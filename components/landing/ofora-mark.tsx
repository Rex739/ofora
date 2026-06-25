export function OforaMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-ofora-green bg-ofora-canvas ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-[7px] rounded-full border-[6px] border-ofora-deep" />
      <span className="absolute right-0 top-0 h-full w-1/2 bg-ofora-mist" />
      <span className="absolute h-[2px] w-7 rotate-[-22deg] bg-ofora-verify" />
    </span>
  );
}
