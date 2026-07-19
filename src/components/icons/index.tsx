import type { SVGProps } from "react";
import type { IconKey } from "../../data/types";
import { asset } from "../../utils/asset";

/**
 * The icon registry.
 *
 * Control glyphs (the stepper's +/-) are inline SVG so they inherit
 * `currentColor` and add no network weight. Step-header marks are brand assets
 * from the design file, so they ship as files under `/public/icons` and are
 * resolved here through a single keyed lookup — components reference an
 * `IconKey`, never a path.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/* ---- Step header icons -------------------------------------------------- */

const STEP_ICON_PATHS: Record<IconKey, string> = {
  camera: "/icons/livestream.svg",
  shield: "/icons/hms-shield.svg",
  sensor: "/icons/sensor.svg",
  protection: "/icons/panel.svg",
};

export function StepIcon({ name, ...props }: { name: IconKey } & IconProps) {
  return (
    <img
      src={asset(STEP_ICON_PATHS[name])}
      alt=""
      style={{
        width: props.width || 24,
        height: props.height || 24,
      }}
      {...(props.className ? { className: props.className } : {})}
    />
  );
}

/* ---- Controls ----------------------------------------------------------- */

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.2}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg width={24} height={28} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 16L4 8h16z" />
    </svg>
  );
}
