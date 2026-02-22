import { create } from "zustand";

interface PendingChange {
  original: string;
  newCode: string;
  authorId?: string;
}

interface RoomState {
  myCode: string;
  friendCode: string;
  pendingChange: PendingChange | null;
  language: string;

  setMyCode: (code: string) => void;
  setFriendCode: (code: string) => void;
  setPendingChange: (change: PendingChange) => void;
  clearPendingChange: () => void;
  setLanguage: (lang: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  myCode:
    "// Your code will appear here\n// Push from VS Code or type directly\n",
  friendCode: "",
  pendingChange: null,
  language: "javascript",

  setMyCode: (code) => set({ myCode: code }),
  setFriendCode: (code) => set({ friendCode: code }),
  setPendingChange: (change) => set({ pendingChange: change }),
  clearPendingChange: () => set({ pendingChange: null }),
  setLanguage: (lang) => set({ language: lang }),
}));
