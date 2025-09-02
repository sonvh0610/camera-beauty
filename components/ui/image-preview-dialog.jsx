"use client";

import ReactImageGallery from "react-image-gallery";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  createOverlay,
} from "@chakra-ui/react";

import "react-image-gallery/styles/css/image-gallery.css";

export const imagePreviewDialog = createOverlay((props) => {
  const { images, imageSelectId, onSelectImage, handleComplete, ...rest } =
    props;
  const selectedImageIdx = images.findIndex((img) => img.id === imageSelectId);
  const [activeIndex, setActiveIndex] = useState(selectedImageIdx);

  const galleryImages = useMemo(() => {
    return images.map((image) => ({
      id: image.id,
      original: image.src,
      thumbnail: image.src,
      originalAlt: `Ảnh ${image.id}`,
      thumbnailAlt: `Thumbnail ${image.id}`,
      thumbnailHeight: 100,
    }));
  }, [images]);

  const handleSelectImageOnSlide = () => {
    const img = galleryImages[activeIndex];
    onSelectImage(img.id);
  };

  const handleCompleteOnSlide = () => {
    handleComplete();
  };

  const handleClose = () => {
    imagePreviewDialog.close("imagePreviewDialog");
  };

  return (
    <Dialog.Root {...rest} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {galleryImages && (
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Xem ảnh chi tiết</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <ReactImageGallery
                  items={galleryImages}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  thumbnailPosition="bottom"
                  startIndex={activeIndex}
                  onSlide={(currentIndex) => setActiveIndex(currentIndex)}
                />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="10px"
                >
                  <Button
                    colorPalette="blue"
                    onClick={handleSelectImageOnSlide}
                  >
                    Chọn
                  </Button>
                  <Button colorPalette="blue" onClick={handleCompleteOnSlide}>
                    Hoàn thành
                  </Button>
                  <Button colorPalette="red" onClick={handleClose}>
                    Thoát
                  </Button>
                </Box>
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
