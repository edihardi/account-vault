const colors: Record<string, string> = {
  // VS Code syntax color palette
  ACTIVE:    "bg-[#4ec9b0]/10 text-[#4ec9b0] ring-1 ring-[#4ec9b0]/20",   // teal
  INACTIVE:  "bg-[#858585]/10 text-[#858585] ring-1 ring-[#858585]/20",   // grey
  BANNED:    "bg-[#f44747]/10 text-[#f44747] ring-1 ring-[#f44747]/20",   // red
  SUSPENDED: "bg-[#ce9178]/10 text-[#ce9178] ring-1 ring-[#ce9178]/20",   // orange
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? colors.INACTIVE}`}>
      {status}
    </span>
  );
}
