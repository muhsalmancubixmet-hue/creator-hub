import { useEffect, useRef, useState, useCallback } from "react";

export interface ChatMessagePayload {
  id: string;
  inquiry_id: string;
  sender_id: string;
  sender_role: "creator" | "business" | "admin";
  sender_name: string;
  sender_avatar?: string;
  body: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  is_me?: boolean;
}

interface UseInquirySocketOptions {
  inquiryId?: string | null;
  token?: string | null;
  onNewMessage?: (message: ChatMessagePayload) => void;
  onMessagesRead?: (readerId: string) => void;
  onTyping?: (data: { userId: string; senderName: string; isTyping: boolean }) => void;
}

function getWsBaseUrl(): string {
  const envWs = (import.meta as any).env?.VITE_WS_URL;
  if (envWs) {
    return envWs.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "127.0.0.1";
    return `${protocol}//${host}:8000`;
  }
  return "ws://127.0.0.1:8000";
}

export function useInquirySocket({
  inquiryId,
  token,
  onNewMessage,
  onMessagesRead,
  onTyping,
}: UseInquirySocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Store callbacks in refs to avoid re-triggering connection on callback mutation
  const onNewMessageRef = useRef(onNewMessage);
  const onMessagesReadRef = useRef(onMessagesRead);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessagesReadRef.current = onMessagesRead;
    onTypingRef.current = onTyping;
  }, [onNewMessage, onMessagesRead, onTyping]);

  useEffect(() => {
    if (!inquiryId || !token || inquiryId === "empty") {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const baseWs = getWsBaseUrl();
    const wsUrl = `${baseWs}/ws/inquiries/${inquiryId}/`;
    // Secure token transport via Sec-WebSocket-Protocol (ADR-001)
    const ws = new WebSocket(wsUrl, ["bearer", token]);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message" && data.message) {
          onNewMessageRef.current?.(data.message);
        } else if (data.type === "messages_read") {
          onMessagesReadRef.current?.(data.reader_id);
        } else if (data.type === "user_typing") {
          onTypingRef.current?.({
            userId: data.user_id,
            senderName: data.sender_name,
            isTyping: data.is_typing,
          });
        }
      } catch {
        // Silently skip malformed socket frames
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [inquiryId, token]);

  const sendMessage = useCallback((body: string, attachmentUrl: string = "") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: "send_message",
          body,
          attachment_url: attachmentUrl,
        })
      );
      return true;
    }
    return false;
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: "typing",
          is_typing: isTyping,
        })
      );
    }
  }, []);

  const markRead = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: "mark_read",
        })
      );
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    markRead,
  };
}

