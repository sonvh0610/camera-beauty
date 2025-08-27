import { NextResponse } from "next/server";
import { processImageWithPhotoroom } from "@/app/services/photoroom";
import { detectFaces } from "@/app/services/faceDetection";
import { User } from "@/app/models/users";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const originalImage = formData.get("original");
    const backgroundImage = formData.get("background");

    if (!originalImage || typeof originalImage === "string") {
      return NextResponse.json(
        { error: 'Yêu cầu phải có đủ cả hai file "original" và "background".' },
        { status: 400 },
      );
    }

    const originalBuffer = Buffer.from(await originalImage.arrayBuffer());
    const backgroundBuffer = Buffer.from(await backgroundImage.arrayBuffer());

    const result = await processImageWithPhotoroom(
      originalBuffer,
      backgroundBuffer,
    );

    const faceIds = await detectFaces(originalBuffer);

    await User.create({
      imagePath: result.outputUrl,
      faceIds,
    });

    // Trả về đường dẫn của ảnh đã được xử lý
    return NextResponse.json(
      {
        message: "Xử lý và ghép ảnh thành công!",
        data: {
          path: result.outputUrl,
          faceId: faceIds,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lỗi khi xử lý upload:", error);
    return NextResponse.json(
      { error: error.message || "Đã có lỗi xảy ra phía server." },
      { status: 500 },
    );
  }
}
