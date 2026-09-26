"use client";

import React from "react";

export type SFSymbolName =
  | "share"
  | "square.and.arrow.up"
  | "bookmark"
  | "bookmark.fill"
  | "filter"
  | "line.3.horizontal.decrease"
  | "line.3.horizontal.decrease.circle"
  | "inspector"
  | "sidebar.right"
  | "sidebar.left"
  | "search"
  | "magnifyingglass"
  | "command"
  | "bell"
  | "bell.badge"
  | "arrow.clockwise"
  | "chart.bar.xaxis"
  | "terminal"
  | "gearshape"
  | "ellipsis.circle"
  | "checkmark"
  | "checkmark.circle.fill"
  | "xmark"
  | "xmark.circle.fill"
  | "chevron.right"
  | "chevron.left"
  | "chevron.up"
  | "chevron.down"
  | "arrow.up.right";

export type SFRenderingMode = "monochrome" | "hierarchical" | "multicolor";

interface SFSymbolProps extends Omit<React.SVGProps<SVGSVGElement>, "fill"> {
  name: SFSymbolName;
  size?: number;
  renderingMode?: SFRenderingMode;
  weight?: "regular" | "medium" | "semibold" | "bold";
  className?: string;
  fill?: boolean;
}

/**
 * Apple SF Symbols Vector System.
 * Renders authentic Apple platform symbols with hierarchical layer opacity,
 * stroke weight adaptation, and optical sizing.
 */
export default function SFSymbol({
  name,
  size = 17,
  renderingMode = "hierarchical",
  weight = "medium",
  className = "",
  fill = false,
  ...props
}: SFSymbolProps) {
  const strokeW =
    weight === "regular"
      ? 1.4
      : weight === "semibold"
      ? 2.0
      : weight === "bold"
      ? 2.3
      : 1.75; // medium default

  const secOpacity = renderingMode === "hierarchical" ? 0.38 : 1;

  const renderSymbol = () => {
    switch (name) {
      case "share":
      case "square.and.arrow.up":
        return (
          <>
            {/* Apple square.and.arrow.up */}
            <path
              d="M8.5 2.5L12 6M8.5 2.5L5 6M8.5 2.5V11.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 8.5H3.5C2.67 8.5 2 9.17 2 10V14C2 14.83 2.67 15.5 3.5 15.5H13.5C14.33 15.5 15 14.83 15 14V10C15 9.17 14.33 8.5 13.5 8.5H13"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={secOpacity}
            />
          </>
        );

      case "bookmark":
        if (fill) {
          return (
            <path
              d="M4.5 2.5C3.67 2.5 3 3.17 3 4V15.2C3 15.68 3.55 15.96 3.93 15.67L8.5 12.2L13.07 15.67C13.45 15.96 14 15.68 14 15.2V4C14 3.17 13.33 2.5 12.5 2.5H4.5Z"
              fill="currentColor"
            />
          );
        }
        return (
          <path
            d="M4.5 2.5C3.67 2.5 3 3.17 3 4V15.2C3 15.68 3.55 15.96 3.93 15.67L8.5 12.2L13.07 15.67C13.45 15.96 14 15.68 14 15.2V4C14 3.17 13.33 2.5 12.5 2.5H4.5Z"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "bookmark.fill":
        return (
          <path
            d="M4.5 2.5C3.67 2.5 3 3.17 3 4V15.2C3 15.68 3.55 15.96 3.93 15.67L8.5 12.2L13.07 15.67C13.45 15.96 14 15.68 14 15.2V4C14 3.17 13.33 2.5 12.5 2.5H4.5Z"
            fill="currentColor"
          />
        );

      case "filter":
      case "line.3.horizontal.decrease":
        return (
          <>
            <line
              x1="2.5"
              y1="4.5"
              x2="14.5"
              y2="4.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
            <line
              x1="4.5"
              y1="8.5"
              x2="12.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={secOpacity}
            />
            <line
              x1="6.5"
              y1="12.5"
              x2="10.5"
              y2="12.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={secOpacity * 0.75}
            />
          </>
        );

      case "line.3.horizontal.decrease.circle":
        return (
          <>
            <circle
              cx="8.5"
              cy="8.5"
              r="6.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
              opacity={secOpacity}
            />
            <line
              x1="5"
              y1="6.5"
              x2="12"
              y2="6.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
            <line
              x1="6.2"
              y1="9"
              x2="10.8"
              y2="9"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
            <line
              x1="7.4"
              y1="11.5"
              x2="9.6"
              y2="11.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          </>
        );

      case "inspector":
      case "sidebar.right":
        return (
          <>
            <rect
              x="2"
              y="2.5"
              width="13"
              height="12"
              rx="2.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
            />
            <line
              x1="11"
              y1="2.5"
              x2="11"
              y2="14.5"
              stroke="currentColor"
              strokeWidth={strokeW}
            />
            <rect
              x="11"
              y="2.5"
              width="4"
              height="12"
              rx="1"
              fill="currentColor"
              opacity={secOpacity}
            />
          </>
        );

      case "sidebar.left":
        return (
          <>
            <rect
              x="2"
              y="2.5"
              width="13"
              height="12"
              rx="2.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
            />
            <line
              x1="6"
              y1="2.5"
              x2="6"
              y2="14.5"
              stroke="currentColor"
              strokeWidth={strokeW}
            />
            <rect
              x="2"
              y="2.5"
              width="4"
              height="12"
              rx="1"
              fill="currentColor"
              opacity={secOpacity}
            />
          </>
        );

      case "search":
      case "magnifyingglass":
        return (
          <>
            <circle
              cx="7.2"
              cy="7.2"
              r="4.7"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
            />
            <line
              x1="10.8"
              y1="10.8"
              x2="14.5"
              y2="14.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          </>
        );

      case "command":
        return (
          <path
            d="M6 3.5C6 4.33 5.33 5 4.5 5H3.5C2.67 5 2 4.33 2 3.5C2 2.67 2.67 2 3.5 2C4.33 2 5 2.67 5 3.5V6M6 6H11M11 6V3.5C11 2.67 11.67 2 12.5 2C13.33 2 14 2.67 14 3.5C14 4.33 13.33 5 12.5 5H11M11 6V11M11 11H12.5C13.33 11 14 11.67 14 12.5C14 13.33 13.33 14 12.5 14C11.67 14 11 13.33 11 12.5V11M11 11H6M6 11V12.5C6 13.33 5.33 14 4.5 14C3.67 14 3 13.33 3 12.5C3 11.67 3.67 11 4.5 11H6M6 11V6"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "bell":
        return (
          <>
            <path
              d="M8.5 2C6.2 2 4.5 3.7 4.5 6V9L3 11.5H14L12.5 9V6C12.5 3.7 10.8 2 8.5 2Z"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.2 13C7.4 13.7 7.9 14.2 8.5 14.2C9.1 14.2 9.6 13.7 9.8 13"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={secOpacity}
            />
          </>
        );

      case "bell.badge":
        return (
          <>
            <path
              d="M7 2.5C5.3 2.8 4 4.2 4 6V9L2.5 11.5H13.5L12 9V6C12 5.5 12.1 5 12.3 4.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.2 13C6.4 13.7 6.9 14.2 7.5 14.2C8.1 14.2 8.6 13.7 8.8 13"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={secOpacity}
            />
            <circle cx="13" cy="3.5" r="2.5" fill="var(--neg)" />
          </>
        );

      case "arrow.clockwise":
        return (
          <path
            d="M13.5 4V7.5H10M13.2 6.5C12.2 4.8 10.5 3.7 8.5 3.7C5.4 3.7 2.9 6.2 2.9 9.3C2.9 12.4 5.4 14.9 8.5 14.9C11.1 14.9 13.3 13.1 13.9 10.7"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "chart.bar.xaxis":
        return (
          <>
            <line
              x1="2"
              y1="14.5"
              x2="15"
              y2="14.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
            <rect
              x="3.5"
              y="8"
              width="2.5"
              height="5.5"
              rx="0.8"
              fill="currentColor"
              opacity={secOpacity}
            />
            <rect
              x="7.25"
              y="4.5"
              width="2.5"
              height="9"
              rx="0.8"
              fill="currentColor"
            />
            <rect
              x="11"
              y="6"
              width="2.5"
              height="7.5"
              rx="0.8"
              fill="currentColor"
              opacity={secOpacity}
            />
          </>
        );

      case "terminal":
        return (
          <>
            <rect
              x="2"
              y="3"
              width="13"
              height="11"
              rx="2.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
            />
            <path
              d="M4.5 6.5L7 8.5L4.5 10.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="8.5"
              y1="10.5"
              x2="11.5"
              y2="10.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={secOpacity}
            />
          </>
        );

      case "gearshape":
        return (
          <path
            d="M8.5 6C7.12 6 6 7.12 6 8.5C6 9.88 7.12 11 8.5 11C9.88 11 11 9.88 11 8.5C11 7.12 9.88 6 8.5 6ZM8.5 2C8.78 2 9 2.22 9 2.5V3.32C9.55 3.44 10.06 3.65 10.53 3.94L11.11 3.36C11.31 3.16 11.63 3.16 11.83 3.36L12.64 4.17C12.84 4.37 12.84 4.69 12.64 4.89L12.06 5.47C12.35 5.94 12.56 6.45 12.68 7H13.5C13.78 7 14 7.22 14 7.5V8.5C14 8.78 13.78 9 13.5 9H12.68C12.56 9.55 12.35 10.06 12.06 10.53L12.64 11.11C12.84 11.31 12.84 11.63 12.64 11.83L11.83 12.64C11.63 12.84 11.31 12.84 11.11 12.64L10.53 12.06C10.06 12.35 9.55 12.56 9 12.68V13.5C9 13.78 8.78 14 8.5 14H7.5C7.22 14 7 13.78 7 13.5V12.68C6.45 12.56 5.94 12.35 5.47 12.06L4.89 12.64C4.69 12.84 4.37 12.84 4.17 12.64L3.36 11.83C3.16 11.63 3.16 11.31 3.36 11.11L3.94 10.53C3.65 10.06 3.44 9.55 3.32 9H2.5C2.22 9 2 8.78 2 8.5V7.5C2 7.22 2.22 7 2.5 7H3.32C3.44 6.45 3.65 5.94 3.94 5.47L3.36 4.89C3.16 4.69 3.16 4.37 3.36 4.17L4.17 3.36C4.37 3.16 4.69 3.16 4.89 3.36L5.47 3.94C5.94 3.65 6.45 3.44 7 3.32V2.5C7 2.22 7.22 2 7.5 2H8.5Z"
            stroke="currentColor"
            strokeWidth={strokeW * 0.8}
            fill="none"
            strokeLinejoin="round"
          />
        );

      case "ellipsis.circle":
        return (
          <>
            <circle
              cx="8.5"
              cy="8.5"
              r="6.5"
              stroke="currentColor"
              strokeWidth={strokeW}
              fill="none"
              opacity={secOpacity}
            />
            <circle cx="5.5" cy="8.5" r="0.9" fill="currentColor" />
            <circle cx="8.5" cy="8.5" r="0.9" fill="currentColor" />
            <circle cx="11.5" cy="8.5" r="0.9" fill="currentColor" />
          </>
        );

      case "checkmark":
        return (
          <path
            d="M3.5 8.5L7 12L13.5 5"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "checkmark.circle.fill":
        return (
          <>
            <circle cx="8.5" cy="8.5" r="6.5" fill="var(--pos)" />
            <path
              d="M5.5 8.5L7.5 10.5L11.5 6.5"
              stroke="#ffffff"
              strokeWidth={strokeW}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );

      case "xmark":
        return (
          <path
            d="M4.5 4.5L12.5 12.5M12.5 4.5L4.5 12.5"
            stroke="currentColor"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        );

      case "xmark.circle.fill":
        return (
          <>
            <circle cx="8.5" cy="8.5" r="6.5" fill="var(--neg)" />
            <path
              d="M6 6L11 11M11 6L6 11"
              stroke="#ffffff"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          </>
        );

      case "chevron.right":
        return (
          <path
            d="M6 3.5L11 8.5L6 13.5"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "chevron.left":
        return (
          <path
            d="M11 3.5L6 8.5L11 13.5"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "chevron.down":
        return (
          <path
            d="M3.5 6L8.5 11L13.5 6"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "chevron.up":
        return (
          <path
            d="M3.5 11L8.5 6L13.5 11"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "arrow.up.right":
        return (
          <path
            d="M4.5 12.5L12.5 4.5M12.5 4.5H6.5M12.5 4.5V10.5"
            stroke="currentColor"
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {renderSymbol()}
    </svg>
  );
}
