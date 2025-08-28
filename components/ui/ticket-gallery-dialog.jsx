"use client";

import ReactImageGallery from "react-image-gallery";
import { useMemo } from "react";
import { Button, Dialog, Flex, Portal, createOverlay } from "@chakra-ui/react";

import "react-image-gallery/styles/css/image-gallery.css";

export const ticketGaleryDialog = createOverlay((props) => {
  const { ticket, ...rest } = props;

  const galleryImages = useMemo(() => {
    if (!ticket || !ticket.images) return [];
    return ticket.images.map((image) => ({
      original: image.imagePath,
      thumbnail: image.imagePath,
      originalAlt: `Ảnh ${image.id}`,
      thumbnailAlt: `Thumbnail ${image.id}`,
    }));
  }, [ticket]);

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
                      showPlayButton={false} // Tắt nút tự động chạy
                      showFullscreenButton={true} // Bật nút xem toàn màn hình
                      thumbnailPosition="bottom" // Hiển thị thumbnail bên dưới
                    />
                    <Flex justifyContent="center">
                      <Button colorPalette="blue">In ảnh</Button>
                    </Flex>
                  </>
                ) : (
                  <Text>Không có ảnh để hiển thị.</Text>
                )}
              </Dialog.Body>
            </Dialog.Content>
          )}
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});
