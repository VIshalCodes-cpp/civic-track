export type IntentKey =
  | "water_supply_issue"
  | "electricity_issue"
  | "road_damage"
  | "garbage_collection"
  | "sewerage_problem"
  | "public_transport_issue"
  | "noise_complaint"
  | "streetlight_issue"
  | "general";

type ChatStep =
  | "idle"
  | "ask_location"
  | "ask_description"
  | "ask_image";

interface ChatSession {
  step: ChatStep;
  category?: IntentKey | null;

  latitude?: number;
  longitude?: number;

  description?: string;
  imageUrl?: string;
}

const sessions: Record<string, ChatSession> = {};

export function getSession(userId: string): ChatSession {
  if (!sessions[userId]) {
    sessions[userId] = { step: "idle" };
  }

  return sessions[userId];
}

export function resetSession(userId: string) {
  sessions[userId] = { step: "idle" };
}

