import { NextResponse } from "next/server";
import { withAuthApi } from "@/libs/authMiddleware";
import { sequelize } from "@/libs/sequelize";
import { getIO } from "@/libs/socket";
import { Ticket, TicketImage } from "@/models";

const createTicketHandler = async (req, context, userPayload) => {
  const t = await sequelize.transaction();
  const io = getIO();

  try {
    const { imageIds } = await req.json();

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp danh sách ảnh hợp lệ." },
        { status: 400 },
      );
    }

    const { userId } = userPayload;

    const newTicket = await Ticket.create(
      { userId: userId, status: "PENDING" },
      { transaction: t },
    );

    const ticketImagesData = imageIds.map((imageId) => ({
      ticketId: newTicket.id,
      imageId: imageId,
    }));

    await TicketImage.bulkCreate(ticketImagesData, { transaction: t });

    await t.commit();

    io.emit("new-ticket", { id: newTicket.id });

    return NextResponse.json({
      success: true,
      message: "Đã tạo phiếu thành công!",
      ticketId: newTicket.id,
    });
  } catch (error) {
    // Nếu có bất kỳ lỗi nào xảy ra, rollback transaction
    await t.rollback();

    console.error("API /api/images/create-ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ nội bộ khi tạo phiếu." },
      { status: 500 },
    );
  }
};

export const POST = withAuthApi(createTicketHandler);
