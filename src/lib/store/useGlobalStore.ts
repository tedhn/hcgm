"use client";

import { type Admin } from "@prisma/client";
import { create } from "zustand";

interface UserState {
  user: Admin | null;
  setUser: (data: Admin) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set(user),
}));
