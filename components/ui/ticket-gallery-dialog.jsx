"use client";

import ReactImageGallery from "react-image-gallery";
import { useMemo, useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  createOverlay,
} from "@chakra-ui/react";

import "react-image-gallery/styles/css/image-gallery.css";
import { toaster } from "@/components/ui/toaster";

export const ticketGaleryDialog = createOverlay((props) => {
  const { ticket, ...rest } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const galleryImages = useMemo(() => {
    if (!ticket || !ticket.images) return [];
    return ticket.images.map((image) => ({
      original: image.imagePath,
      thumbnail: image.imagePath,
      originalAlt: `Ảnh ${image.id}`,
      thumbnailAlt: `Thumbnail ${image.id}`,
    }));
  }, [ticket]);

  const activeImage = useMemo(() => {
    if (!ticket || !ticket.images) return null;
    return ticket.images[activeIndex];
  }, [ticket, activeIndex]);

  const handlePrint = () => {
    if (!activeImage) return;
    const imageUrl = activeImage.imagePath;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>In ảnh</title>
          <style>
            @media print {
              @page {
                size: auto; /* Tự động điều chỉnh theo khổ giấy */
                margin: 0;
              }
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
              }
              img {
                width: 100%;
                height: 100%;
                object-fit: contain; /* Đây là thuộc tính quan trọng để ảnh vừa vặn */
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" />
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (error) {
        console.error("Không thể in ảnh:", error);
        window.open(imageUrl, "_blank");
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    };
  };

  const handleCompleteTicket = async () => {
    if (!ticket) return;
    setIsCompleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("id", ticket.id);
      formData.append("status", "COMPLETED");

      const response = await fetch("/api/ticket/update-status", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Cập nhật trạng thái thất bại.");
      }

      toaster.create({
        title: "Thành công",
        description: `Đã gửi yêu cầu hoàn thành phiếu #${ticket.id}`,
        type: "info",
      });
      ticketGaleryDialog.close("a");
    } catch (error) {
      toaster.create({
        title: "Lỗi",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog.Root {...rest} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {ticket && (
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Chi tiết Phiếu #{ticket.id}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body spaceY="4">
                {galleryImages.length > 0 ? (
                  <>
                    <ReactImageGallery
                      items={galleryImages}
                      showPlayButton={false}
                      showFullscreenButton={true}
                      thumbnailPosition="bottom"
                      onSlide={(currentIndex) => setActiveIndex(currentIndex)}
                    />
                    <Flex justifyContent="center" gap="10px">
                      <Button
                        colorPalette="blue"
                        onClick={handlePrint}
                        disabled={!activeImage || isCompleting}
                      >
                        In ảnh
                      </Button>
                      <Button
                        colorPalette="blue"
                        onClick={handleCompleteTicket}
                        disabled={!activeImage || isCompleting}
                      >
                        Hoàn thành
                      </Button>
                    </Flex>
                  </>
                ) : (
                  <Text>Không có ảnh để hiển thị.</Text>
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          )}
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});
