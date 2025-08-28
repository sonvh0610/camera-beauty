import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { processImageWithPhotoroom } from "@/services/photoroom";
import { detectFaces } from "@/services/faceDetection";
import { getIO } from "@/libs/socket";
import { CameraImage } from "@/models";

export async function POST(request) {
  try {
    const io = getIO();
    const formData = await request.formData();
    const cameraId = formData.get("cameraId");
    const image = formData.get("image");

    if (!cameraId || typeof cameraId !== "string") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp Camera ID." },
        { status: 400 },
      );
    }
    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "Vui lòng upload đầy đủ ảnh." },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB tính bằng bytes
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Kích thước ảnh quá lớn. Vui lòng upload file dưới 5MB." },
        { status: 413 },
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const backgroundBuffer = fs.readFileSync(
      path.join(process.cwd(), "public", "background.jpg"),
    );

    const result = await processImageWithPhotoroom(
      imageBuffer,
      backgroundBuffer,
    );

    const faceIds = await detectFaces(imageBuffer);

    const resultData = {
      cameraId,
      imagePath: result.outputUrl,
      faceIds,
    };
    const cameraImageData = await CameraImage.create(resultData);

    io.emit("new-image", {
      id: cameraImageData.id,
      cameraId: cameraImageData.cameraId,
      imagePath: cameraImageData.imagePath,
    });

    return NextResponse.json(
      { message: "Xử lý và ghép ảnh thành công!", data: resultData },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Đã có lỗi xảy ra phía server." },
      { status: 500 },
    );
  }
}
