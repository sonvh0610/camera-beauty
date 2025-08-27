import { Sequelize } from "sequelize";
import { NextResponse } from "next/server";
import { User } from "@/app/models/users";
import { detectFaces } from "@/app/services/faceDetection";

export async function POST(request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!image || typeof image === "string") {
    return NextResponse.json(
      { error: "Yêu cầu phải có ảnh nhận diện." },
      { status: 400 },
    );
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const faceIds = await detectFaces(imageBuffer);

  const results = [];
  for (const faceId of faceIds) {
    const user = await User.findOne({
      where: Sequelize.fn(
        "JSON_CONTAINS",
        Sequelize.col("faceIds"),
        `"${faceId}"`,
      ),
    });
    if (user) {
      results.push({ faceId, imagePath: user.imagePath });
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
