import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./BigButton.css";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "md" | "lg" | "xl";
  children?: ReactNode;
}

/** The one button component the whole game should use — guarantees a
 * touch target that meets the spec's "very large touch targets" rule. */
export function BigButton({
  icon,
  variant = "primary",
  size = "lg",
  className = "",
  children,
  ...rest
}: BigButtonProps) {
  return (
    <button
      className={`big-button big-button--${variant} big-button--${size} ${className}`}
      {...rest}
    >
      {icon && <span className="big-button__icon">{icon}</span>}
      {children && <span className="big-button__label">{children}</span>}
    </button>
  );
}
