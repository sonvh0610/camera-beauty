"use client";

import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Image,
  Portal,
  Spinner,
  Text,
  VStack,
  createOverlay,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

import "react-image-gallery/styles/css/image-gallery.css";

export const faceDetectDialog = createOverlay((props) => {
  const { open, ...rest } = props;

  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setIsCameraReady(false);
        setCapturedImage(null);
      }, 300);
    }
  }, [open]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCameraReady(false);
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const imageBlob = dataURLtoBlob(capturedImage);

      const formData = new FormData();
      formData.append("image", imageBlob, "face-capture.jpg");

      const response = await fetch("/api/search-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Trình duyệt sẽ tự động thêm 'Content-Type': 'multipart/form-data'
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Nhận diện khuôn mặt thất bại.");
      }

      toaster.create({
        title: "Thành công",
        description: "Đã chọn tất cả ảnh có mặt của bạn!",
        type: "success",
      });

      handleClose(result.data);
    } catch (error) {
      toaster.create({
        title: "Lỗi",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (data = {}) => {
    faceDetectDialog.close("a", data);
  };

  return (
    <Dialog.Root open={open} {...rest} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content position="relative">
            {isSubmitting && (
              <Flex
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="whiteAlpha.800"
                align="center"
                justify="center"
                zIndex="overlay"
                borderRadius="md"
              >
                <VStack>
                  <Spinner size="xl" />
                  <Text mt={2}>Đang xử lý...</Text>
                </VStack>
              </Flex>
            )}

            <Dialog.Header>
              <Dialog.Title>Nhận diện khuôn mặt</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body spaceY="4">
              {webcamRef && (
                <>
                  <Flex justify="center" align="center" direction="column">
                    {capturedImage ? (
                      <Image
                        src={capturedImage}
                        alt="Ảnh đã chụp"
                        borderRadius="md"
                      />
                    ) : (
                      <Box
                        position="relative"
                        borderRadius="md"
                        overflow="hidden"
                        w="100%"
                      >
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          width="100%"
                          videoConstraints={{ facingMode: "user" }}
                          onUserMedia={() => setIsCameraReady(true)}
                        />

                        {!isCameraReady && (
                          <Flex
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg="blackAlpha.700"
                            align="center"
                            justify="center"
                          >
                            <Spinner size="xl" color="white" />
                          </Flex>
                        )}

                        {isCameraReady && (
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            width="65%"
                            height="85%"
                            borderRadius="50%"
                            border="3px solid white"
                            boxShadow="0 0 0 9999px rgba(0, 0, 0, 0.5)"
                            pointerEvents="none"
                          />
                        )}
                      </Box>
                    )}
                  </Flex>
                  {capturedImage ? (
                    <Flex w="100%" justify="space-between" gap="10px">
                      <Button
                        colorPalette="red"
                        onClick={handleRetake}
                        flex={1}
                      >
                        Chụp lại
                      </Button>
                      <Button
                        flex={1}
                        colorPalette="blue"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                      >
                        Gửi ảnh
                      </Button>
                    </Flex>
                  ) : (
                    <Button colorPalette="blue" onClick={capture} w="100%">
                      Chụp ảnh
                    </Button>
                  )}
                </>
              )}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});
