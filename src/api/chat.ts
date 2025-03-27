// API client for chat endpoints
import { Member, Chat } from "../types";

const api_url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

interface CreateChatData {
  memberIds: string[];
  name?: string;
  topic?: string;
  creator?: string;
  context?: string;
}

interface UpdateMemberData {
  memberId: string;
  name?: string;
  email?: string | null;
  systemMessage?: string | null;
  description?: string | null;
  type?: string;
}

interface UpdateChatData {
  chatId: string;
  name?: string | null;
  topic?: string | null;
  context?: string | null;
  conclusion?: string | null;
  creator?: string | null;
}

interface UpdatedChat {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  context: string | null;
  creator: string | null;
  topic: string | null;
  conclusion: string | null;
}

export const chatApi = {
  /**
   * Get all chat members
   */
  getAllMembers: async (): Promise<Member[]> => {
    const response = await fetch(`${api_url}/chat/members`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new chat
   */
  createChat: async (chatData: CreateChatData): Promise<Chat> => {
    const response = await fetch(`${api_url}/chat/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Update an existing member
   */
  updateMember: async (memberData: UpdateMemberData): Promise<Member> => {
    const response = await fetch(`${api_url}/chat/update-member`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update member: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Update an existing chat
   */
  updateChat: async (chatData: UpdateChatData): Promise<UpdatedChat> => {
    const response = await fetch(`${api_url}/chat/update-chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update chat: ${response.statusText}`);
    }

    return response.json();
  },
};
