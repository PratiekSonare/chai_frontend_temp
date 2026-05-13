/**
 * SemiCircle Component
 * Displays a semi-circular progress indicator
 * @param {number} pct - Percentage value (0-100)
 * @param {string} size - Size variant: 'small' (60x35) or 'large' (100x60), default: 'large'
 */
export function SemiCircle({ pct, size = "large" }) {
  const clamped = Math.min(Math.max(pct, 0), 100);

  if (size === "small") {
    const arc = (clamped / 100) * 78.5;
    return (
      <svg
        width="60"
        height="35"
        viewBox="0 0 60 35"
        className="overflow-visible"
      >
        <path
          d="M 5 30 A 25 25 0 0 1 55 30"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 5 30 A 25 25 0 0 1 55 30"
          fill="none"
          stroke="#001a8e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${arc} 78.5`}
          style={{
            transformOrigin: "30px 30px",
            transform: "scaleX(-1)",
          }}
        />
      </svg>
    );
  }

  // large (default)
  const arc = (clamped / 100) * 125.6;
  return (
    <svg
      width="100"
      height="60"
      viewBox="0 0 100 60"
      className="overflow-visible"
    >
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 90 50 A 40 40 0 0 0 10 50"
        fill="none"
        stroke="#001a8e"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${arc} 125.6`}
      />
    </svg>
  );
}
