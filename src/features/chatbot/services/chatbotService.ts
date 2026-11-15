import axios from "axios";
import { axiosClient } from "@/shared/api/axios-client";
import type { ChatLang, ChatReply } from "../types";

export class ChatRateLimitError extends Error {
  readonly code = "rate_limited" as const;
}

export const chatbotService = {
  async send(payload: { sessionId: string; message: string; lang: ChatLang }): Promise<ChatReply> {
    try {
      const response = await axiosClient.post<ChatReply>(
        "/api/v1/portal/chatbot/messages",
        { session_id: payload.sessionId, message: payload.message, lang: payload.lang },
        { timeout: 40000 },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        throw new ChatRateLimitError("rate limited");
      }
      throw error;
    }
  },
};
