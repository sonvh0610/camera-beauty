"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Flex, Button, Spinner, Tabs, Table } from "@chakra-ui/react";

import { toaster } from "@/components/ui/toaster";
import withAuth from "@/components/hoc/withAuth";
import { ticketGaleryDialog } from "@/components/ui/ticket-gallery-dialog";
import { useSocket } from "@/libs/socket-context";
import { CustomHeader } from "@/components/ui/header";

function Monitor3Page({ user }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pendingTickets = useMemo(() => {
    return tickets.filter((t) => t.status === "PENDING");
  }, [tickets]);
  const completedTickets = useMemo(() => {
    return tickets.filter((t) => t.status === "COMPLETED");
  }, [tickets]);

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

    const handleTicketUpdate = ({ ticketId, status }) => {
      setTickets((currentTickets) =>
        currentTickets.map((t) =>
          t.id === ticketId ? { ...t, status: status } : t,
        ),
      );
    };

    socket.on("new-ticket", handleNewTicket);
    socket.on("ticket-updated", handleTicketUpdate);

    return () => {
      socket.off("new-ticket", handleNewTicket);
      socket.off("ticket-updated", handleTicketUpdate);
    };
  }, [socket]);

  const handleViewTicket = (ticket) => {
    ticketGaleryDialog.open("a", { ticket });
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <CustomHeader user={user} />
      <Box p="15px">
        <Tabs.Root defaultValue="PENDING" variant="plain" fitted>
          <Tabs.List bg="bg.muted" rounded="l3" p="5px">
            <Tabs.Trigger value="PENDING">Chưa In</Tabs.Trigger>
            <Tabs.Trigger value="COMPLETED">Đã In</Tabs.Trigger>
            <Tabs.Indicator rounded="l2" bg="blue.300" />
          </Tabs.List>
          <Tabs.Content value="PENDING">
            <Table.ScrollArea borderWidth="1px" height="calc(100vh - 150px)">
              <Table.Root size="md" variant="outline" showColumnBorder>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>ID Phiếu</Table.ColumnHeader>
                    <Table.ColumnHeader>Người tạo</Table.ColumnHeader>
                    <Table.ColumnHeader>Ngày tạo</Table.ColumnHeader>
                    <Table.ColumnHeader>Số lượng ảnh</Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {pendingTickets.map((ticket) => (
                    <Table.Row key={ticket.id}>
                      <Table.Cell>#{ticket.id}</Table.Cell>
                      <Table.Cell>
                        <strong>{ticket.user?.displayName || "N/A"}</strong>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>{ticket.images?.length || 0}</Table.Cell>
                      <Table.Cell textAlign="end">
                        <Button
                          size="sm"
                          colorPalette="blue"
                          onClick={() => handleViewTicket(ticket)}
                          disabled={
                            !ticket.images || ticket.images.length === 0
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Tabs.Content>
          <Tabs.Content value="COMPLETED">
            <Table.ScrollArea borderWidth="1px" height="calc(100vh - 150px)">
              <Table.Root size="md" variant="outline" showColumnBorder>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>ID Phiếu</Table.ColumnHeader>
                    <Table.ColumnHeader>Người tạo</Table.ColumnHeader>
                    <Table.ColumnHeader>Ngày tạo</Table.ColumnHeader>
                    <Table.ColumnHeader>Số lượng ảnh</Table.ColumnHeader>
                    <Table.ColumnHeader></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {completedTickets.map((ticket) => (
                    <Table.Row key={ticket.id}>
                      <Table.Cell>#{ticket.id}</Table.Cell>
                      <Table.Cell>
                        <strong>{ticket.user?.displayName || "N/A"}</strong>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>{ticket.images?.length || 0}</Table.Cell>
                      <Table.Cell textAlign="end">
                        <Button
                          size="sm"
                          colorPalette="blue"
                          onClick={() => handleViewTicket(ticket)}
                          disabled={
                            !ticket.images || ticket.images.length === 0
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
      <ticketGaleryDialog.Viewport />
    </Box>
  );
}

export default withAuth(Monitor3Page);
