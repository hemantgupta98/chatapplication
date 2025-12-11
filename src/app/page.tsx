"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, MessageSquare, Users } from "lucide-react";
import { Box, Container } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Typography, TextField, Stack } from "@mui/material";

export default function Page() {
  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
      }),
    []
  );

  const [messages, setMessages] = useState<{ message: string; room: string }[]>(
    []
  );
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState<string | undefined>("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessage("");
  };

  const joinRoomHandler = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      if (socket.id) {
        setSocketId(socket.id);
      }
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data: { message: string; room: string }) => {
      console.log(data);
      setMessages((messages) => [
        ...messages,
        data as { message: string; room: string },
      ]);
    });

    socket.on("welcome", (s: unknown) => {
      console.log(s);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-3/4">
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center gap-2 px-2 py-2">
                <MessageSquare className="h-6 w-6 text-gray-200 fill-blue-500" />
                <span className="font-semibold text-lg">Chat App</span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <input
                    type="text"
                    placeholder="Search "
                    className="h-8 w-full bg-gray-200 text-black font-semibold p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                  />
                </SidebarGroupLabel>
                <SidebarGroupContent className="mt-5">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/">
                          <Home />
                          <span>Home</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/messages">
                          <MessageSquare />
                          <span>Messages</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/users">
                          <Users />
                          <span>Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
              <div className="p-2">
                <p className="text-xs text-sidebar-foreground/70">
                  © 2025 Chat App
                </p>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>
      </SidebarProvider>
      <Container maxWidth="sm">
        <Box sx={{ height: 10 }} />
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          className="mb-100"
        >
          {socketID}
        </Typography>

        <form onSubmit={joinRoomHandler}>
          <h5>Join Room</h5>
          <TextField
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            id="outlined-basic"
            label="Room Name"
            variant="outlined"
          />
          <Button type="submit">Join</Button>
        </form>

        <form onSubmit={handleSubmit}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id="outlined-basic"
            label="Message"
            variant="outlined"
          />
          <TextField
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            id="outlined-basic"
            label="Room"
            variant="outlined"
          />
          <Button type="submit" className="bg-blue-500 text-black">
            Send
          </Button>
        </form>

        <Stack>
          {messages.map((m, i) => (
            <Typography key={i} variant="h6" component="div" gutterBottom>
              {m.message}
            </Typography>
          ))}
        </Stack>
      </Container>
    </>
  );
}
