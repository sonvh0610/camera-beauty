import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { User } from "@/models/users";

export async function POST(request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return NextResponse.json(
      { error: "Vui lòng nhập tên đăng nhập và mật khẩu." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");
    const findUser = await User.findOne({
      where: {
        username,
        password: passwordHash,
      },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng." },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { userId: findUser.id, username: findUser.username },
      process.env.JWT_SECRET,
    );

    return NextResponse.json(
      { message: "Đăng nhập thành công", token: token },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}
