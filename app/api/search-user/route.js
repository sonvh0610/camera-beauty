import { Sequelize } from "sequelize";
import { NextResponse } from "next/server";
import { CameraImage } from "@/models/images";
import { detectFaces } from "@/services/faceDetection";

export async function POST(request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!image || typeof image === "string") {
    return NextResponse.json(
      { error: "Yêu cầu phải có ảnh nhận diện." },
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
  const faceIds = await detectFaces(imageBuffer);

  const results = [];
  for (const faceId of faceIds) {
    const findImage = await CameraImage.findOne({
      where: Sequelize.fn(
        "JSON_CONTAINS",
        Sequelize.col("faceIds"),
        `"${faceId}"`,
      ),
    });
    if (findImage) {
      results.push({ faceId, imagePath: findImage.imagePath });
    } else {
      results.push({ faceId, imagePath: "" });
    }
  }

  return NextResponse.json(
    {
      message: "Gửi tìm kiếm thành công, trả về kết quả.",
      data: { results },
    },
    { status: 200 },
  );
}
