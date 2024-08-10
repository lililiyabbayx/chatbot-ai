"use client";

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Career support assistant gen.ai. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage = message;
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content; // Extract only the assistant's response

      setMessages((prevMessages) => {
        let lastMessage = prevMessages[prevMessages.length - 1];
        let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: assistantResponse },
        ];
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{ p: 2, maxWidth: "70%", mx: "auto", backgroundColor: "##FFFFFF" }}
    >
      <Stack sx={{ gap: 2, mb: 2 }}>
        {messages.map((message, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent:
                message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                minWidth: "250px",
                maxWidth: "1000px",
                p: 2,
                border: "1px solid #555",
                borderRadius: (theme) => theme.spacing(2),
                boxShadow: 1, // Optional: Adds shadow to chat bubbles
                backgroundColor:
                  message.role === "user" ? "#000000" : "#e2e3e5", // Background color for chat bubbles
              }}
            >
              <Typography
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  color: message.role === "user" ? "#FFFFFF" : "#000000", // Text color for chat bubbles
                }}
              >
                {message.content}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Stack>

      {isLoading && <LinearProgress />}

      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        value={message}
        label="Write Something ..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2, backgroundColor: "#ffffff" }}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={sendMessage}
        disabled={isLoading}
        sx={{
          backgroundColor: "#007bff", // Background color for the button
          color: "#000000", // Text color for the button
        }}
      >
        <Typography>Send</Typography>
      </Button>
    </Box>
  );
}
