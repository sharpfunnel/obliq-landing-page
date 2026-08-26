import type { LucideIcon } from "lucide-react";

export default function CredentialStatusTile({
  icon: Icon,
  label,
  configured,
  activeLabel = "Configured",
  missingLabel = "Missing",
}: {
  icon: LucideIcon;
  label: string;
  configured: boolean;
  activeLabel?: string;
  missingLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4">
      <div className="flex items-center gap-2 text-navy-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${configured ? "text-navy-900" : "text-red-500"}`}>
        {configured ? activeLabel : missingLabel}
      </p>
    </div>
  );
}
