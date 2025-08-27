import sharp from "sharp";
import {
  DetectFacesCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";
import { FACE_COLLECTION_ID, rekognition } from "@/app/libs/rekognition";

export async function detectFaces(imageBuffer) {
  // Lấy metadata (width, height) trực tiếp từ buffer
  const { width: baseWidth, height: baseHeight } = await sharp(
    imageBuffer,
  ).metadata();

  // 1. Gửi toàn bộ ảnh để phát hiện vị trí các khuôn mặt
  const detectCmd = new DetectFacesCommand({
    Image: { Bytes: imageBuffer },
  });
  const detectRes = await rekognition.send(detectCmd);

  if (!detectRes.FaceDetails || detectRes.FaceDetails.length === 0) {
    return []; // Không tìm thấy khuôn mặt nào
  }

  const imgWidth = baseWidth || 0;
  const imgHeight = baseHeight || 0;
  const resolvedFaceIds = [];

  // 2. Lặp qua từng khuôn mặt đã phát hiện
  for (const face of detectRes.FaceDetails) {
    const box = face.BoundingBox;
    if (!box || !imgWidth || !imgHeight) continue;

    // Tính toán tọa độ để cắt khuôn mặt
    const left = Math.max(Math.floor(box.Left * imgWidth), 0);
    const top = Math.max(Math.floor(box.Top * imgHeight), 0);
    const width = Math.min(Math.ceil(box.Width * imgWidth), imgWidth - left);
    const height = Math.min(Math.ceil(box.Height * imgHeight), imgHeight - top);
    if (width <= 0 || height <= 0) continue;

    // Cắt buffer của từng khuôn mặt
    const croppedBuffer = await sharp(imageBuffer)
      .extract({ left, top, width, height })
      .jpeg({ quality: 85, chromaSubsampling: "4:2:0" })
      .toBuffer();

    let usedFaceId = null;

    // 3. Tìm kiếm khuôn mặt đã cắt trong Collection
    try {
      const searchCmd = new SearchFacesByImageCommand({
        CollectionId: FACE_COLLECTION_ID,
        FaceMatchThreshold: 90,
        Image: { Bytes: croppedBuffer },
        QualityFilter: "AUTO",
      });
      const searchRes = await rekognition.send(searchCmd);
      if (searchRes.FaceMatches && searchRes.FaceMatches.length > 0) {
        const topMatch = searchRes.FaceMatches[0];
        if (
          topMatch.Similarity >= 90 &&
          topMatch.Face &&
          topMatch.Face.FaceId
        ) {
          usedFaceId = topMatch.Face.FaceId;
        }
      }
    } catch (e) {
      // Bỏ qua lỗi (ví dụ: không có khuôn mặt nào trong collection) và tiếp tục
    }

    // 4. Nếu không tìm thấy, thêm khuôn mặt mới vào Collection
    if (!usedFaceId) {
      const externalImageId = `indexed-${Date.now()}`; // Tạo một ID bên ngoài duy nhất
      const indexCmd = new IndexFacesCommand({
        CollectionId: FACE_COLLECTION_ID,
        Image: { Bytes: croppedBuffer },
        ExternalImageId: externalImageId,
        QualityFilter: "AUTO",
      });
      const indexRes = await rekognition.send(indexCmd);
      if (indexRes.FaceRecords && indexRes.FaceRecords.length > 0) {
        usedFaceId = indexRes.FaceRecords[0].Face.FaceId;
      }
    }

    // 5. Thêm faceId đã xử lý vào mảng kết quả
    if (usedFaceId) {
      resolvedFaceIds.push(usedFaceId);
    }
  }

  return resolvedFaceIds;
}
