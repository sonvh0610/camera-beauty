import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const withAuthApi = (handler) => {
  return async (req, context) => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, message: "Yêu cầu xác thực không hợp lệ." },
          { status: 401 },
        );
      }

      const token = authHeader.split(" ")[1];
      let decoded;

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Token không hợp lệ hoặc đã hết hạn." },
          { status: 401 },
        );
      }

      return handler(req, context, decoded);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { success: false, message: "Lỗi trong middleware xác thực." },
        { status: 500 },
      );
    }
  };
};
