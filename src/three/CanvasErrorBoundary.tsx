import { Component, type ReactNode } from "react";

/**
 * Keeps a 3D failure from blanking the whole app. If the iPad can't start
 * WebGL (older iPadOS, low memory, graphics turned off) or three.js throws,
 * the gym falls back to a flat pink-and-purple backdrop and everything
 * drawn on top of it (Penelope, the HUD, the events, the Game Room) keeps
 * working.
 */
export class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D gym unavailable, showing the flat backdrop instead:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background:
              "linear-gradient(180deg, #f3e6ff 0%, #ead6ff 55%, #ffd9ec 55%, #ffb3d9 100%)",
          }}
        />
      );
    }
    return this.props.children;
  }
}
