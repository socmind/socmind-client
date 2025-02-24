// src/components/ChatArea.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Chat, Message } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatAreaProps {
  selectedChat: Chat;
  messages: Message[];
  onSendMessage: (chatId: string, message: Message) => void;
}

export function ChatArea({
  selectedChat,
  messages,
  onSendMessage,
}: ChatAreaProps): JSX.Element {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userId = "user";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const getChatDisplayName = (chat: Chat): string => {
    const filteredMembers = chat.memberIds.filter(
      (memberId) => !memberId.toLowerCase().match(/^(user)$/)
    );
    return `To: ${filteredMembers.join(", ")}`;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        type: "MEMBER",
        senderId: userId,
        chatId: selectedChat.id,
        content: { text: inputMessage.trim() },
        createdAt: new Date().toISOString(),
      };
      onSendMessage(selectedChat.id, newMessage);
      setInputMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h2 className="font-semibold">{getChatDisplayName(selectedChat)}</h2>
          <div className="flex -space-x-2">
            {selectedChat.memberIds
              .filter((memberId) => memberId !== userId)
              .map((memberId) => (
                <div
                  key={memberId}
                  className="w-8 h-8 rounded-full bg-[#1b2e5c] text-white flex items-center justify-center text-sm font-medium ring-2 ring-white relative hover:z-10 hover:scale-110 transform transition-all cursor-default"
                  title={`${memberId}`}
                >
                  {memberId.charAt(0).toUpperCase()}
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 relative">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) =>
            message.type === "SYSTEM" ? (
              <SystemMessage key={message.id} message={message} />
            ) : (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.senderId === userId}
              />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kick off the conversation..."
              className="flex-1 border rounded-2xl py-2 px-4 mr-2 max-h-32 min-h-[2.5rem] resize-none overflow-y-auto break-words"
              rows={1}
              style={{ width: "calc(100% - 3rem)" }}
            />
            <button
              onClick={handleSendMessage}
              className={`bg-[#1b2e5c] text-white rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0 transition-colors ${
                inputMessage.trim() ? "hover:bg-blue-600" : ""
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

function MessageBubble({ message, isUser }: MessageBubbleProps): JSX.Element {
  const bubbleClass = isUser
    ? "bg-[#1b2e5c] text-white"
    : "bg-gray-200 text-black";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-end max-w-[70%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isUser && message.senderId && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-semibold">
            {message.senderId.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div
          className={`flex flex-col ${
            isUser ? "items-end" : "items-start ml-2"
          }`}
        >
          {!isUser && message.senderId && (
            <span className="text-xs text-gray-500 mb-1">
              {message.senderId}
            </span>
          )}
          <div
            className={`py-1 px-3 rounded-2xl ${bubbleClass} break-words min-h-8 flex items-center whitespace-pre-wrap max-w-full overflow-x-auto`}
          >
            <ReactMarkdown
              className={`prose prose-sm ${
                isUser ? "prose-invert !text-white" : ""
              } [&_.katex-display]:!overflow-x-auto [&_.katex-display]:!overflow-y-hidden [&_.katex]:max-w-full [&_.katex]:!overflow-x-auto [&_.katex]:!overflow-y-hidden`}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <span className="my-0">{children}</span>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="rounded px-1 py-0.5">{children}</code>
                ),
              }}
            >
              {message.content.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SystemMessageProps {
  message: Message;
}

function SystemMessage({ message }: SystemMessageProps): JSX.Element {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-gray-500">{message.content.text}</span>
    </div>
  );
}
