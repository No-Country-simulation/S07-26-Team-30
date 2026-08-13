export interface NavItem {
  label: string;
  slug: string;
  anchor?: string;
  children?: NavItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
