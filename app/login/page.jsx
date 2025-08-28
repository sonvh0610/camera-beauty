"use client";

import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

        router.push("/dashboard");
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
    <Flex minH="100vh" align="center" justify="center">
      <Stack spacing={8}>
        <Heading fontSize="2xl" textAlign="center" mb="15px">
          Đăng nhập tài khoản
        </Heading>

        <Box rounded="lg" boxShadow="sm" p={8} minW="300px">
          <form onSubmit={handleSubmit}>
            <Stack spacing="10px">
              <Field.Root>
                <Field.Label>Tên đăng nhập</Field.Label>
                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Mật khẩu</Field.Label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field.Root>
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
      </Stack>
    </Flex>
  );
}
