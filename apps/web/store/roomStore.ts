import { create } from "zustand";

import type { PendingChange } from "@codesync/socket-types";

export interface RoomUser {
  id: string;
  name: string;
  color: string;
  role: "owner" | "editor";
}

interface RoomState {
  // Code state
  myCode: string;
  friendCode: string;

  // Diff/pending change
  pendingChange: PendingChange | null;

  // Users
  users: RoomUser[];
  myRole: "owner" | "editor" | null;
  myUser: RoomUser | null;
  friendUser: RoomUser | null;

  // Actions
  setMyCode: (code: string) => void;
  setFriendCode: (code: string) => void;
  setPendingChange: (change: PendingChange | null) => void;
  clearPendingChange: () => void;
  setUsers: (users: RoomUser[]) => void;
  setMyRole: (role: "owner" | "editor") => void;
  setMyUser: (user: RoomUser) => void;
  setFriendUser: (user: RoomUser | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  myCode: '// Start coding here...\nconsole.log("Hello, ColabCode!");',
  friendCode: "",
  pendingChange: null,
  users: [],
  myRole: null,
  myUser: null,
  friendUser: null,

  setMyCode: (code) => set({ myCode: code }),
  setFriendCode: (code) => set({ friendCode: code }),
  setPendingChange: (change) => set({ pendingChange: change }),
  clearPendingChange: () => set({ pendingChange: null }),
  setUsers: (users) => set({ users }),
  setMyRole: (role) => set({ myRole: role }),
  setMyUser: (user) => set({ myUser: user }),
  setFriendUser: (user) => set({ friendUser: user }),
}));
