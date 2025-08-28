import path from "path";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import { ensureDirExists } from "@/services/utils";

/**
 * Xử lý ảnh: Tách nền ảnh gốc bằng Photoroom và ghép vào ảnh nền được cung cấp.
 * @param {Buffer} originalBuffer - Buffer của ảnh gốc cần tách nền.
 * @param {Buffer} backgroundBuffer - Buffer của ảnh nền để ghép vào.
 * @returns {Promise<{outputFilename: string, outputPath: string}>} - Trả về đường dẫn công khai của ảnh kết quả.
 */
export async function processImageWithPhotoroom(
  originalBuffer,
  backgroundBuffer,
) {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    throw new Error("Biến môi trường PHOTOROOM_API_KEY chưa được thiết lập.");
  }

  // 1) Gọi Photoroom API để tách nền -> trả về ảnh PNG với kênh alpha
  const form = new FormData();
  form.append("image_file", originalBuffer, "original.png"); // Thêm buffer vào form data
  form.append("output_format", "png");

  const response = await axios.post(
    "https://sdk.photoroom.com/v1/segment",
    form,
    {
      headers: {
        "X-Api-Key": apiKey,
        ...form.getHeaders(),
      },
      responseType: "arraybuffer",
      validateStatus: () => true,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const errorBody = response.data
      ? Buffer.from(response.data).toString()
      : "Không có nội dung lỗi.";
    throw new Error(
      `Lỗi từ Photoroom: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  const cutoutBuffer = Buffer.from(response.data);

  // 2) Ghép ảnh đã tách nền vào ảnh nền được cung cấp bằng Sharp
  const bg = sharp(backgroundBuffer);
  const fg = sharp(cutoutBuffer);

  const [bgMeta, fgMeta] = await Promise.all([bg.metadata(), fg.metadata()]);

  // Thay đổi kích thước ảnh nền để khớp với kích thước ảnh đã tách nền
  const targetWidth = fgMeta.width || bgMeta.width || 1024;
  const targetHeight = fgMeta.height || bgMeta.height || 1024;

  const resizedBgBuffer = await sharp(backgroundBuffer)
    .resize(targetWidth, targetHeight, { fit: "cover" })
    .toBuffer();

  // Thực hiện ghép ảnh
  const composedBuffer = await sharp(resizedBgBuffer)
    .composite([{ input: cutoutBuffer, gravity: "center" }])
    .png()
    .toBuffer();

  // 3) Lưu ảnh kết quả
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  ensureDirExists(uploadDir);
  const outputFilename = `result-${Date.now()}.png`;
  const outputPath = path.join(uploadDir, outputFilename);

  await sharp(composedBuffer).toFile(outputPath);

  return {
    outputUrl: `/uploads/${outputFilename}`,
    outputPath,
  };
}
