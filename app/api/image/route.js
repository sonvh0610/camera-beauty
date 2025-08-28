import { NextResponse } from "next/server";
import { withAuthApi } from "@/libs/authMiddleware";
import { CameraImage } from "@/models";

export const GET = withAuthApi(async () => {
  const allImages = await CameraImage.findAll({
    attributes: ["id", "cameraId", "imagePath"],
    order: [["createdAt", "DESC"]],
  });
  return NextResponse.json({ data: allImages }, { status: 200 });
});
