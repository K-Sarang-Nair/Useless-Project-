export type BearExpression =
  | "angry"
  | "furious"
  | "sleepy"
  | "sneaky"
  | "suspicious"
  | "silly"
  | "roar";
export type BearGait =
  | "idle"
  | "walk"
  | "run"
  | "sneak"
  | "dance"
  | "stomp"
  | "hop"
  | "tiptoe"
  | "roll";
export type BearAction =
  | "none"
  | "look"
  | "shake"
  | "sniff"
  | "roar"
  | "shiver"
  | "jump"
  | "throw"
  | "blow"
  | "tug"
  | "swipe"
  | "wave"
  | "squash";

type Props = {
  expression: BearExpression;
  gait: BearGait;
  facing: 1 | -1;
  reaching?: boolean;
  silhouette?: boolean;
  action?: BearAction;
  glowEyes?: boolean;
};

export function Bear({
  expression,
  gait,
  facing,
  reaching,
  silhouette,
  action = "none",
  glowEyes,
}: Props) {
  const browAngle =
    expression === "furious" || expression === "roar"
      ? 30
      : expression === "angry"
        ? 20
        : expression === "sleepy"
          ? 4
          : 12;
  const eyeH = expression === "sleepy" ? 1.6 : expression === "sneaky" ? 2.2 : 5;
  const eyeFill = glowEyes ? "var(--glow)" : "var(--bear-nose)";

  return (
    <div
      className={`bear bear--${gait} ${action !== "none" ? `bear-act--${action}` : ""} ${
        silhouette ? "bear--dark" : ""
      } ${glowEyes ? "bear--glow" : ""}`}
      style={{ transform: `scaleX(${facing})` }}
    >
      <svg viewBox="0 0 120 150" width="100%" height="100%" aria-hidden="true">
        {/* legs */}
        <g className="bear-leg bear-leg--back">
          <rect x="42" y="104" width="16" height="34" rx="8" fill="var(--bear-dark)" />
        </g>
        <g className="bear-leg bear-leg--front">
          <rect x="64" y="104" width="16" height="34" rx="8" fill="var(--bear-fur)" />
        </g>
        {/* body */}
        <ellipse cx="61" cy="92" rx="32" ry="30" fill="var(--bear-fur)" />
        <ellipse cx="63" cy="98" rx="18" ry="16" fill="var(--bear-belly)" />
        {/* arms */}
        <g className={`bear-arm bear-arm--back`}>
          <rect x="28" y="72" width="15" height="32" rx="7.5" fill="var(--bear-dark)" />
        </g>
        <g
          className="bear-arm bear-arm--front"
          style={reaching ? { transform: "rotate(-72deg)" } : undefined}
        >
          <rect x="78" y="72" width="15" height="34" rx="7.5" fill="var(--bear-fur)" />
        </g>
        {/* head */}
        <g className="bear-head">
          <circle cx="42" cy="44" r="11" fill="var(--bear-fur)" />
          <circle cx="42" cy="44" r="5" fill="var(--bear-inner)" />
          <circle cx="84" cy="44" r="11" fill="var(--bear-fur)" />
          <circle cx="84" cy="44" r="5" fill="var(--bear-inner)" />
          <ellipse cx="63" cy="55" rx="30" ry="27" fill="var(--bear-fur)" />
          <ellipse cx="66" cy="64" rx="15" ry="11" fill="var(--bear-snout)" />
          <ellipse cx="68" cy="60" rx="5" ry="3.6" fill="var(--bear-nose)" />
          {/* eyes */}
          <ellipse className="bear-eye" cx="53" cy="50" rx="4" ry={eyeH} fill={eyeFill} />
          <ellipse className="bear-eye" cx="74" cy="50" rx="4" ry={eyeH} fill={eyeFill} />
          {/* brows */}
          <rect
            x="45"
            y="40"
            width="16"
            height="3.6"
            rx="1.8"
            fill="var(--bear-nose)"
            transform={`rotate(${browAngle} 53 42)`}
          />
          <rect
            x="66"
            y="40"
            width="16"
            height="3.6"
            rx="1.8"
            fill="var(--bear-nose)"
            transform={`rotate(${-browAngle} 74 42)`}
          />
          {/* mouth */}
          {expression === "roar" ? (
            <g className="bear-roar-mouth">
              <ellipse cx="66" cy="72" rx="11" ry="9" fill="var(--bear-nose)" />
              <path d="M58 68 l3 5 l3 -5 z" fill="var(--bear-belly)" />
              <path d="M70 68 l3 5 l3 -5 z" fill="var(--bear-belly)" />
            </g>
          ) : expression === "sleepy" ? (
            <ellipse cx="66" cy="72" rx="6" ry="7" fill="var(--bear-nose)" opacity="0.85" />
          ) : expression === "silly" ? (
            <path
              d="M56 71 q10 9 20 0"
              stroke="var(--bear-nose)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M56 74 q10 -8 20 0"
              stroke="var(--bear-nose)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
        {(expression === "furious" || expression === "roar") && (
          <g className="bear-steam">
            <circle cx="26" cy="26" r="5" fill="var(--bear-belly)" opacity="0.5" />
            <circle cx="98" cy="22" r="6" fill="var(--bear-belly)" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  );
}
