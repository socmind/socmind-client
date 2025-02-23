// src/components/Sidebar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Chat, Member } from "@/types";
import { Plus, Loader, Loader2 } from "lucide-react";
import { chatApi } from "@/api/chat";

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: (chat: Chat) => void;
  isLoading?: boolean;
}

function getLastMessage(chat: Chat): string {
  return chat.lastMessage?.content.text ?? "";
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
  const userId = "flynn";

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
    <div className="w-1/6 bg-white flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-[#1b2e5c]" />
        </div>
      ) : (
        <>
          <div className="h-16 p-4 flex justify-end relative">
            <button
              onClick={handleNewChatClick}
              className="p-2 flex items-center justify-center bg-[#1b2e5c] text-white rounded-md hover:bg-blue-600 transition-colors"
              title="New Chat"
            >
              <Plus size={16} />
            </button>

            {/* Member Selection Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg mt-1 z-50">
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
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isCreatingChat}
                  >
                    Cancel
                  </button>
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
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 h-20 cursor-pointer ${
                  selectedChat && selectedChat.id === chat.id ? "bg-[#1b2e5c] text-white" : ""
                }`}
                onClick={() => onChatSelect(chat)}
              >
                {/* <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-lg font-semibold">
                    {getChatDisplayName(chat)[0]}
                  </span>
                </div> */}
                <div className="flex-1 min-w-0 ml-5">
                  <h3 className="font-semibold text-sm truncate">
                    {getChatDisplayName(chat)}
                  </h3>
                  <p className={`text-sm truncate ${
                    selectedChat && selectedChat.id === chat.id ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
