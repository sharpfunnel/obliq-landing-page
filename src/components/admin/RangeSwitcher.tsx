import Link from "next/link";

const RANGES = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

export default function RangeSwitcher({ basePath, current }: { basePath: string; current: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-navy-200 bg-white p-1">
      {RANGES.map((r) => {
        const active = current === r.value;
        return (
          <Link
            key={r.value}
            href={`${basePath}?range=${r.value}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active ? "bg-navy-950 text-white" : "text-navy-500 hover:text-navy-900"
            }`}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
