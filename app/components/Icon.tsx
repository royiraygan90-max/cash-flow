interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className = "" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: "'FILL' 1",
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {name}
    </span>
  );
}
