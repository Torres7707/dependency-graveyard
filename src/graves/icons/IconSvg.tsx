import { useId, type ReactNode } from "react";

/** Gradient and filter ids must be unique per instance and safe inside `url(#…)`. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^\w-]/g, "")}`;
}

interface Props {
  size?: number | string;
  className?: string;
  title?: string;
  children: ReactNode;
}

export function IconSvg({ size = 64, className, title, children }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      overflow="visible"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
