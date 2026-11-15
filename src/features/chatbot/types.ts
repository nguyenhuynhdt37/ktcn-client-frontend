export type ChatKind = "faq" | "refusal" | "model" | "error";

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatReply {
  answer: string;
  kind: ChatKind;
  sources: ChatSource[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: ChatSource[];
}

export type ChatLang = "vi" | "en";
