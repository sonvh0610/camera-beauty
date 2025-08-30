"use client";

import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LuUser, LuLock } from "react-icons/lu";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Đăng nhập thành công
        localStorage.setItem("authToken", data.token);

        toaster.create({
          title: "Đăng nhập thành công!",
          description: "Đang chuyển hướng bạn đến trang chính.",
          type: "success",
        });

        const redirectPath = searchParams.get("redirect") || "/";
        router.push(redirectPath);
      } else {
        toaster.create({
          title: "Đăng nhập thất bại",
          description:
            data.message || "Tên đăng nhập hoặc mật khẩu không đúng.",
          type: "error",
        });
      }
    } catch (error) {
      // Xử lý lỗi mạng hoặc lỗi server khác
      toaster.create({
        title: "Đã xảy ra lỗi",
        description: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh">
      {/* Cột bên trái */}
      <Flex
        w={{ base: "100%", lg: "50%" }}
        align="center"
        justify="center"
        direction="column"
        bg="white"
        display={{ base: "none", lg: "flex" }}
      >
        <Heading as="h1" fontSize="40px" color="blue.600">
          QUẢN LÝ HỆ THỐNG
        </Heading>
      </Flex>

      {/* Cột bên phải */}
      <Flex
        w={{ base: "100%", lg: "50%" }}
        align="center"
        justify="center"
        bg="blue.50"
        m="20px"
        borderRadius="10px"
      >
        <Box
          w="full"
          maxW="350px"
          px="30px"
          py="40px"
          bg="white"
          borderRadius="xl"
          boxShadow="lg"
          mx={4}
        >
          <Heading
            as="h2"
            size="lg"
            textAlign="center"
            color="blue.700"
            mb="20px"
          >
            Chào mừng đã trở lại!
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack gap="15px">
              <InputGroup startElement={<LuUser />}>
                <Input
                  type="text"
                  placeholder="Mã tài khoản"
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </InputGroup>
              <InputGroup startElement={<LuLock />}>
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </InputGroup>
              <Button
                type="submit"
                colorPalette="blue"
                mt="10px"
                disabled={isLoading}
              >
                Đăng Nhập
              </Button>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}
