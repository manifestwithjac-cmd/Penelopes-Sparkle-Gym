import "./shared/minigame.css";

/** Temporary placeholder for apparatus mini-games not yet built (Phase 3
 * adds Beam/Bars/Trampoline/Vault). Never shown for Floor. */
export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="minigame">
      <div className="minigame__stage">
        <div className="minigame__prompt">
          <p className="minigame__hint">{label} tricks are coming soon!</p>
          <span style={{ fontSize: "3rem" }}>🚧✨</span>
        </div>
      </div>
    </div>
  );
}
