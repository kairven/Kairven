import { create } from "zustand"

interface CoreState {
  count: number
  mode: "light" | "dark" | "system"
  increment: () => void
  decrement: () => void
  setMode: (mode: "light" | "dark" | "system") => void
}

export const useStore = create<CoreState>((set) => ({
  count: 0,
  mode: "dark",
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  setMode: (mode) => set({ mode }),
}))
