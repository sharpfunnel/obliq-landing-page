import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-200 bg-white">
      <table className="w-full min-w-max border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">{children}</thead>;
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

export function Tr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-t border-navy-100 ${className}`}>{children}</tr>;
}

export function Td({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top text-navy-800 ${className}`} title={title}>
      {children}
    </td>
  );
}

export function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-10 text-center text-sm text-navy-400">
        {message}
      </td>
    </tr>
  );
}
