"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner } from "@chakra-ui/react";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
      const verifySession = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
          const currentPath = window.location.pathname;
          router.push(`/login?redirect=${currentPath}`);
          return;
        }

        try {
          const response = await fetch("/api/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Phiên đăng nhập không hợp lệ");
          }

          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          localStorage.removeItem("authToken");
          const currentPath = window.location.pathname;
          router.push(`/login?redirect=${currentPath}`);
        } finally {
          setIsVerifying(false);
        }
      };

      verifySession();
    }, [router]);

    if (isVerifying) {
      return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50">
          <Spinner size="xl" />
        </Flex>
      );
    }

    return <WrappedComponent {...props} user={user} />;
  };

  return AuthComponent;
};

export default withAuth;
