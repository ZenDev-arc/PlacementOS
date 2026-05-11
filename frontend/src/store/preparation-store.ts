import { create } from "zustand";

type PreparationState = {
  activeModule: "dashboard" | "dsa" | "core" | "internships" | "mentor";
  setActiveModule: (module: PreparationState["activeModule"]) => void;
};

export const usePreparationStore = create<PreparationState>((set) => ({
  activeModule: "dashboard",
  setActiveModule: (activeModule) => set({ activeModule }),
}));
