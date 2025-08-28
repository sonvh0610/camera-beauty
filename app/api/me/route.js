import { NextResponse } from "next/server";
import { withAuthApi } from "@/libs/authMiddleware";
import { User } from "@/models/users";

export const GET = withAuthApi(async (req, context, userPayload) => {
  try {
    const { userId } = userPayload;

    const user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("API /api/me error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ nội bộ." },
      { status: 500 },
    );
  }
});
