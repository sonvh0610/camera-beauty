"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Image,
  Button,
  Stack,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

export default function Monitor2Page() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/image");
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
  }, [toaster]); // Thêm toast vào dependency array vì nó được sử dụng bên trong effect

  // Lấy danh sách các ảnh đã được chọn
  const selectedImages = images.filter((img) => img.isSelected);

  // Hàm xử lý khi người dùng chọn hoặc bỏ chọn một ảnh
  const handleSelectImage = (id) => {
    setImages(
      images.map((img) =>
        img.id === id ? { ...img, isSelected: !img.isSelected } : img,
      ),
    );
  };

  // Hàm xử lý khi nhấn nút "Bỏ chọn tất cả"
  const handleDeselectAll = () => {
    setImages(images.map((img) => ({ ...img, isSelected: false })));
    toaster.create({
      title: "Đã bỏ chọn tất cả ảnh.",
      type: "success",
    });
  };

  // Hàm xử lý khi nhấn nút "Hoàn thành"
  const handleComplete = () => {
    if (selectedImages.length === 0) {
      toaster.create({
        title: "Vui lòng chọn ít nhất một ảnh.",
        type: "warning",
      });
      return;
    }

    // Hiển thị thông báo và log ra console
    toaster.create({
      title: "Hoàn thành!",
      description: `Bạn đã chọn ${selectedImages.length} ảnh.`,
      type: "success",
    });
    console.log("Các ảnh đã chọn:", selectedImages);
    // Tại đây, bạn có thể gửi danh sách ảnh đã chọn lên server
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
      p={{ base: 4, md: 8 }}
    >
      <Box
        bg="white"
        p="20px"
        borderRadius="lg"
        boxShadow="lg"
        w="full"
        maxW="800px"
        display="flex"
        flexDirection="column"
        maxH="90vh" // Giới hạn chiều cao tổng thể của box
      >
        <Heading as="h1" fontSize="30px" textAlign="center" mb={8}>
          Chọn ảnh
        </Heading>

        {/* Box chứa lưới ảnh, có thể cuộn */}
        <Box flexGrow={1} overflowY="auto" overflowX="hidden" p="10px">
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap="10px">
            {images.map((image) => (
              <Box
                key={image.id}
                onClick={() => handleSelectImage(image.id)}
                cursor="pointer"
                border="3px solid"
                // Thay đổi màu viền dựa trên trạng thái isSelected
                borderColor={image.isSelected ? "green.400" : "red.300"}
                borderRadius="md"
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
            ))}
          </SimpleGrid>
        </Box>

        {/* Các nút hành động */}
        <Stack direction="row" spacing={4} mt={8} justify="center">
          <Button
            colorPalette="blue"
            onClick={handleComplete}
            isDisabled={selectedImages.length === 0}
          >
            Hoàn thành ({selectedImages.length})
          </Button>
          <Button
            colorPalette="red"
            onClick={handleDeselectAll}
            isDisabled={selectedImages.length === 0}
          >
            Bỏ chọn tất cả
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
