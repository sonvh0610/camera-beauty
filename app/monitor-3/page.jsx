"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Button,
  Text,
  Spinner,
  Tag,
} from "@chakra-ui/react";

import { toaster } from "@/components/ui/toaster";
import withAuth from "@/components/hoc/withAuth";
import { ticketGaleryDialog } from "@/components/ui/ticket-gallery-dialog";
import { useSocket } from "@/libs/socket-context";

function Monitor3Page({ user }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const socket = useSocket();

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/ticket", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách phiếu.");
        }
        const result = await response.json();
        setTickets(result.data);
      } catch (error) {
        toaster.create({
          title: "Lỗi",
          description: error.message,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [toaster]);

  // useEffect để lắng nghe sự kiện WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewTicket = (newTicket) => {
      setTickets((prevTickets) => [newTicket, ...prevTickets]);
      toaster.create({
        title: "Thông báo",
        description: `Có phiếu mới #${newTicket.id} vừa được tạo.`,
        type: "info",
      });
    };

    socket.on("new-ticket", handleNewTicket);

    return () => {
      socket.off("new-ticket", handleNewTicket);
    };
  }, [socket]);

  const handleViewTicket = (ticket) => {
    ticketGaleryDialog.open("a", { ticket });
    setSelectedTicket(ticket);
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Flex direction="column" minH="100vh" bg="gray.50" p={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading as="h1" size="lg">
            Danh sách phiếu
          </Heading>
          {user && (
            <Text>
              Xin chào, <strong>{user.displayName}</strong>
            </Text>
          )}
        </Flex>

        {tickets.length === 0 ? (
          <Text>Không có phiếu nào để hiển thị.</Text>
        ) : (
          <Box flexGrow={1} overflowY="auto" overflowX="hidden" p="10px">
            <SimpleGrid gap="15px">
              {tickets.map((ticket) => (
                <Box
                  key={ticket.id}
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                >
                  <Flex justify="space-between" align="stretch">
                    <Box>
                      <Heading fontSize="xl">Phiếu #{ticket.id}</Heading>
                      <Text mt={2} color="gray.600">
                        Tạo bởi:{" "}
                        <strong>{ticket.user?.displayName || "N/A"}</strong>
                      </Text>
                      <Text mt={2} color="gray.500">
                        Ngày tạo: {new Date(ticket.createdAt).toLocaleString()}
                      </Text>
                      <Text mt={2}>
                        Số lượng ảnh:{" "}
                        <strong>{ticket.images?.length || 0}</strong>
                      </Text>
                    </Box>
                    <Flex
                      direction="column"
                      align="flex-end"
                      justify="space-between"
                    >
                      <Tag.Root
                        colorPalette={
                          ticket.status === "PENDING" ? "yellow" : "green"
                        }
                      >
                        <Tag.Label>{ticket.status}</Tag.Label>
                      </Tag.Root>
                      <Button
                        mt={4}
                        colorPalette="blue"
                        onClick={() => handleViewTicket(ticket)}
                        disabled={!ticket.images || ticket.images.length === 0}
                      >
                        Xem chi tiết
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
        <ticketGaleryDialog.Viewport />
      </Flex>
    </>
  );
}

export default withAuth(Monitor3Page);
