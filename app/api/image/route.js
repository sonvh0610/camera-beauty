import { CameraImage } from "@/models/images";
import { NextResponse } from "next/server";

export async function GET() {
  const allImages = await CameraImage.findAll({
    attributes: ["id", "cameraId", "imagePath"],
  });
  return NextResponse.json({ data: allImages }, { status: 200 });
}
