import { create } from "zustand";
import type { CameraState } from "./camera/CameraRig";

interface SceneBridgeState {
  cameraTarget: CameraState;
  setCameraTarget: (target: CameraState) => void;
}

export const useSceneBridge = create<SceneBridgeState>((set) => ({
  cameraTarget: "gym-overview",
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
