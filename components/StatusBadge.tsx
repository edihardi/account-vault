const colors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-zinc-500/15 text-zinc-400",
  BANNED: "bg-red-500/15 text-red-400",
  SUSPENDED: "bg-amber-500/15 text-amber-400",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? colors.INACTIVE}`}>
      {status}
    </span>
  );
}
