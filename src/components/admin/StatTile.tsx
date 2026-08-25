import type { LucideIcon } from "lucide-react";

export default function StatTile({
  icon: Icon,
  label,
  value,
  subLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4">
      <div className="flex items-center gap-2 text-navy-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-navy-900">{value}</p>
      {subLabel && <p className="mt-0.5 text-xs text-navy-400">{subLabel}</p>}
    </div>
  );
}
