// src/components/Sidebar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Chat, Member } from "@/types";
import { Plus, Loader, Loader2, PersonStanding } from "lucide-react";
import { chatApi } from "@/api/chat";
import { Orbitron } from "next/font/google";
import Link from "next/link";

const orbitron = Orbitron({ subsets: ["latin"] });

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: (chat: Chat) => void;
  isLoading?: boolean;
}

function getLatestMessage(chat: Chat): string {
  return chat.latestMessage?.content.text ?? "";
}

function getChatDisplayName(chat: Chat): string {
  return chat.name ?? `Chat with ${chat.memberIds.join(", ")}`;
}

export function Sidebar({
  chats,
  selectedChat,
  onChatSelect,
  onNewChat,
  isLoading = false,
}: SidebarProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(false);
  const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false);
  const userId = "user";

  const fetchMembers = useCallback(async () => {
    setIsMembersLoading(true);
    try {
      const membersList = await chatApi.getAllMembers();
      setMembers(membersList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setIsMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      fetchMembers();
    }
  }, [isDropdownOpen, fetchMembers]);

  const handleNewChatClick = () => {
    setIsDropdownOpen(true);
    setSelectedMembers([]);
    setError(null);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }

    setIsCreatingChat(true);
    try {
      const newChat = await chatApi.createChat({
        memberIds: [...selectedMembers, userId],
        name: `Chat with ${selectedMembers.join(", ")}`,
      });

      onNewChat(newChat);
      setIsDropdownOpen(false);
      setSelectedMembers([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-white text-[#1b2e5c] p-4 flex flex-col">
      {/* Header with title and new chat button */}
      <div className="relative mb-4">
        <div className="flex justify-between items-center">
          <a
            href="https://www.societyofmind.ai"
            className={`${orbitron.className} text-2xl tracking-tight text-[#1b2e5c] transition-colors hover:text-blue-600`}
          >
            SocietyOfMind
          </a>
          <button
            onClick={handleNewChatClick}
            className="p-1.5 flex items-center justify-center bg-[#1b2e5c] text-white rounded-md hover:bg-blue-600 transition-colors"
            title="New Chat"
          >
            <Plus size={16} />
          </button>
        </div>
        {/* Member Selection Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 bg-white border rounded-md shadow-lg mt-1 z-50 w-full">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-gray-700">Select Members</h3>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {isMembersLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="animate-spin text-gray-500" size={24} />
                </div>
              ) : (
                members
                  .filter((member) => member.type === "PROGRAM")
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleMemberToggle(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-sm text-gray-500">
                          {member.id}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="p-3 border-t flex justify-end space-x-2">
              {!isCreatingChat && (
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreateChat}
                disabled={isCreatingChat || selectedMembers.length === 0}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center text-white ${
                  isCreatingChat || selectedMembers.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1b2e5c] hover:bg-blue-600"
                }`}
              >
                {isCreatingChat ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat list or loader */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-[#1b2e5c]" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-2.5 h-16 cursor-pointer rounded-lg mx-2 my-1 ${
                selectedChat && selectedChat.id === chat.id
                  ? "bg-[#1b2e5c] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {getChatDisplayName(chat)}
                </h3>
                <p
                  className={`text-xs truncate ${
                    selectedChat && selectedChat.id === chat.id
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  {getLatestMessage(chat)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Agents link at the bottom of sidebar */}
      <div className="mt-4 pt-3">
        <Link
          href="/agents"
          className="flex items-center p-2 rounded-md hover:bg-gray-100 text-[#1b2e5c] transition-colors"
        >
          <PersonStanding size={18} className="mr-2" />
          <span className="text-sm font-medium">Manage AI Agents</span>
        </Link>
      </div>
    </div>
  );
}
