"use client";

import {
  Box,
  CloseButton,
  Dialog,
  Image,
  Portal,
  createOverlay,
} from "@chakra-ui/react";

export const imagePreviewDialog = createOverlay((props) => {
  const { imagePath, ...rest } = props;

  return (
    <Dialog.Root {...rest} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {imagePath && (
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Xem ảnh chi tiết</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Image
                    src={imagePath}
                    alt="Ảnh chi tiết"
                    maxH="80vh"
                    w="auto"
                  />
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
