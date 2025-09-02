"use client";

import ReactImageGallery from "react-image-gallery";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Image,
  Button,
  Stack,
  Alert,
  Text,
  Spinner,
  Center,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import withAuth from "@/components/hoc/withAuth";
import { toaster } from "@/components/ui/toaster";
import { useSocket } from "@/libs/socket-context";
import { CustomHeader } from "@/components/ui/header";
import { faceDetectDialog } from "@/components/ui/face-detect-dialog";

import "react-image-gallery/styles/css/image-gallery.css";

function ImagePreview({ image, onClick, hideBorder }) {
  return (
    <Box
      onClick={onClick}
      cursor="pointer"
      border={hideBorder ? "0" : "3px solid"}
      borderColor={image.isSelected ? "green.400" : "gray.300"}
      borderRadius={hideBorder ? "none" : "md"}
      overflow="hidden"
      position="relative"
      transition="all 0.2s"
      _hover={{
        transform: "scale(1.05)",
        boxShadow: "md",
      }}
    >
      <Image
        src={image.src}
        alt={`Ảnh ${image.id}`}
        fit="cover"
        aspectRatio="1"
      />
      {image.isSelected && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box color="white" fontSize="2xl" fontWeight="bold">
            ✓
          </Box>
        </Box>
      )}
    </Box>
  );
}

function Monitor2Page({ user }) {
  const [images, setImages] = useState([]);
  const [filterFaceIds, setFilterFaceIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);

  const [openSlideDialog, setOpenSlideDialog] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/image", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu ảnh từ server.");
        }
        const result = await response.json();

        const formattedImages = result.data.map((img) => ({
          id: img.id,
          src: img.imagePath,
          isSelected: false,
        }));

        setImages(formattedImages);
      } catch (err) {
        setError(err.message);
        toaster.create({
          title: "Lỗi tải ảnh",
          description: err.message,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();

    if (socket) {
      socket.off("new-image");
      socket.on("new-image", (newImage) => {
        const formattedNewImage = {
          id: newImage.id,
          src: newImage.imagePath,
          isSelected: false,
        };
        setImages((prevImages) => [formattedNewImage, ...prevImages]);
        toaster.create({
          title: "Có ảnh mới!",
          description: `Ảnh từ camera ${newImage.cameraId} đã được thêm.`,
          type: "success",
        });
      });
    }
  }, [toaster, socket]);

  const selectedImages = images.filter((img) => img.isSelected);

  const filteredImages = useMemo(() => {
    if (filterFaceIds && filterFaceIds.length) {
      let selectedIds = filterFaceIds.map((item) => item.images).flat();
      selectedIds = selectedIds.map((item) => item.id);

      if (selectedIds.length) {
        return images.filter((img) => selectedIds.indexOf(img.id) > -1);
      } else {
        return [];
      }
    }

    return images;
  }, [images, filterFaceIds]);

  const galleryImages = useMemo(() => {
    return filteredImages.map((image) => ({
      ...image,
      original: image.src,
      thumbnail: image.src,
      originalAlt: `Ảnh ${image.id}`,
      thumbnailAlt: `Thumbnail ${image.id}`,
    }));
  }, [filteredImages]);

  const handleSelectImage = (id) => {
    setImages(
      images.map((img) =>
        img.id === id ? { ...img, isSelected: !img.isSelected } : img,
      ),
    );
  };

  const handleSelectImageOnSlide = () => {
    const image = filteredImages[activeSlideIndex];
    handleSelectImage(image.id);
  };

  const handleDeselectAll = (showToast = true) => {
    setImages(images.map((img) => ({ ...img, isSelected: false })));
    if (showToast) {
      toaster.create({
        title: "Đã bỏ chọn tất cả ảnh.",
        type: "success",
      });
    }
  };

  const handleViewImage = (imageIdx) => {
    setOpenSlideDialog(true);
    setActiveSlideIndex(imageIdx);
  };

  const handleViewFaceDetection = async () => {
    const data = await faceDetectDialog.open("a", {});
    if (data) {
      setImages(images.map((img) => ({ ...img, isSelected: false })));
      setFilterFaceIds(data);
    }
  };

  const handleRemoveFilter = () => {
    setFilterFaceIds([]);
  };

  const handleComplete = async () => {
    if (selectedImages.length === 0) {
      toaster.create({
        title: "Vui lòng chọn ít nhất một ảnh.",
        type: "warning",
      });
      return;
    }

    setIsCompleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const imageIds = selectedImages.map((img) => img.id);

      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Tạo phiếu thất bại.");
      }

      toaster.create({
        title: "Thành công!",
        description: result.message,
        type: "success",
      });
      setOpenSlideDialog(false);
      handleDeselectAll(false);
    } catch (err) {
      toaster.create({
        title: "Đã xảy ra lỗi",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <CustomHeader user={user} />
      <Box p="15px">
        <Box
          bg="white"
          p="20px"
          borderRadius="lg"
          boxShadow="lg"
          w="100%"
          h="calc(100vh - 105px)"
          display="flex"
          flexDirection="column"
        >
          {/* Box chứa lưới ảnh, có thể cuộn */}
          <Box flexGrow={1} overflowY="auto" overflowX="hidden" p="10px">
            {isLoading ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="xl" />
              </Flex>
            ) : error ? (
              <Alert.Root status="error" title={error}>
                <Alert.Indicator />
                <Alert.Title>{error}</Alert.Title>
              </Alert.Root>
            ) : filteredImages.length === 0 ? (
              <Flex justify="center" align="center" h="100%">
                <Text color="gray.500">Không có ảnh nào để hiển thị.</Text>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap="10px">
                {filteredImages.map((image, idx) => (
                  <Box key={image.id}>
                    <ImagePreview
                      image={image}
                      onClick={() => handleSelectImage(image.id)}
                    />
                    <Center mt="8px">
                      <Button
                        colorPalette="blue"
                        onClick={() => handleViewImage(idx)}
                        disabled={isCompleting}
                      >
                        Xem
                      </Button>
                    </Center>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Stack direction="row" spacing={4} mt={8} justify="center">
            {filterFaceIds.length ? (
              <Button
                colorPalette="red"
                onClick={handleRemoveFilter}
                disabled={isCompleting}
              >
                Huỷ bộ lọc
              </Button>
            ) : (
              <Button
                colorPalette="blue"
                onClick={handleViewFaceDetection}
                disabled={isCompleting}
              >
                Nhận diện khuôn mặt
              </Button>
            )}

            <Button
              colorPalette="blue"
              onClick={handleComplete}
              disabled={selectedImages.length === 0 || isCompleting}
            >
              Hoàn thành ({selectedImages.length})
            </Button>
            <Button
              colorPalette="red"
              onClick={handleDeselectAll}
              disabled={selectedImages.length === 0}
            >
              Bỏ chọn tất cả
            </Button>
          </Stack>
        </Box>
      </Box>
      <faceDetectDialog.Viewport />

      <Dialog.Root
        open={openSlideDialog}
        onOpenChange={(e) => setOpenSlideDialog(e.open)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
              </Dialog.Header>
              {galleryImages && galleryImages[activeSlideIndex] && (
                <Dialog.Body>
                  <ReactImageGallery
                    items={galleryImages}
                    showPlayButton={false}
                    showFullscreenButton={true}
                    thumbnailPosition="bottom"
                    startIndex={activeSlideIndex}
                    onSlide={(idx) => setActiveSlideIndex(idx)}
                    renderThumbInner={(props) => (
                      <ImagePreview image={props} hideBorder={true} />
                    )}
                  />
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap="10px"
                    mt="10px"
                  >
                    <Button
                      colorPalette={
                        galleryImages[activeSlideIndex].isSelected
                          ? "red"
                          : "blue"
                      }
                      onClick={handleSelectImageOnSlide}
                      disabled={isCompleting}
                    >
                      {galleryImages[activeSlideIndex].isSelected
                        ? "Bỏ chọn"
                        : "Chọn"}
                    </Button>
                    <Button
                      colorPalette="blue"
                      onClick={handleComplete}
                      disabled={selectedImages.length === 0 || isCompleting}
                    >
                      Hoàn thành ({selectedImages.length})
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={() => setOpenSlideDialog(false)}
                    >
                      Thoát
                    </Button>
                  </Box>
                </Dialog.Body>
              )}
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

export default withAuth(Monitor2Page);
