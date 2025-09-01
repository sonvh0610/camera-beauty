import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export const CustomHeader = ({ user }) => {
  const router = useRouter();

  const onLogout = () => {
    if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("authToken");
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${currentPath}`);
    }
  };

  return (
    <Flex
      w="100%"
      h="50px"
      backgroundColor="blue.600"
      justifyContent="space-between"
      alignItems="center"
      gap="15px"
      px="15px"
    >
      <Heading color="white" fontSize={{ base: "18px", lg: "20px" }}>
        CAMERA BEAUTY
      </Heading>
      <Text color="white" ml="auto">
        Xin chào, {user.displayName}
      </Text>
      <Button variant="plain" color="white" size="lg" p="0" onClick={onLogout}>
        Đăng xuất
      </Button>
    </Flex>
  );
};
