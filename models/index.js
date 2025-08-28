import { sequelize } from "@/libs/sequelize";
import { User } from "./users";
import { Ticket } from "./tickets";
import { CameraImage } from "./images";
import { TicketImage } from "./ticket-images";

CameraImage.belongsToMany(Ticket, { through: TicketImage });
Ticket.belongsTo(User);
Ticket.belongsToMany(CameraImage, { through: TicketImage });

// Xuất ra tất cả các model đã được thiết lập mối quan hệ
export { sequelize, User, Ticket, CameraImage, TicketImage };
