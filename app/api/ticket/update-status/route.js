import { NextResponse } from "next/server";
import { withAuthApi } from "@/libs/authMiddleware";
import { Ticket } from "@/models";
import { getIO } from "@/libs/socket";

const updateTicketStatusHandler = async (request) => {
  try {
    const io = getIO();
    const formData = await request.formData();
    const id = formData.get("id");
    const status = formData.get("status");

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phiếu." },
        { status: 404 },
      );
    }

    ticket.status = status;
    await ticket.save();

    io.emit("ticket-updated", { ticketId: ticket.id, status: ticket.status });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái phiếu #${id}`,
    });
  } catch (error) {
    console.error("API complete ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ nội bộ." },
      { status: 500 },
    );
  }
};

export const PUT = withAuthApi(updateTicketStatusHandler);
