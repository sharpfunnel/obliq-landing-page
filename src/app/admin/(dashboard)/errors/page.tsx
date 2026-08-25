import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getErrors } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  js: "bg-red-50 text-red-700",
  unhandled_rejection: "bg-orange-50 text-orange-700",
  image_load: "bg-amber-50 text-amber-700",
  lead_submit: "bg-purple-50 text-purple-700",
};

export default async function AdminErrorsPage() {
  const errors = await getErrors(100);

  return (
    <div>
      <PageHeader title="Errors" description={`Last ${errors.length} client-side errors.`} />

      <Table>
        <Thead>
          <tr>
            <Th>Time</Th>
            <Th>Type</Th>
            <Th>Message</Th>
            <Th>Path</Th>
          </tr>
        </Thead>
        <tbody>
          {errors.length === 0 && <EmptyState message="No errors recorded — nice." />}
          {errors.map((e) => (
            <Tr key={e.id}>
              <Td className="whitespace-nowrap text-xs text-navy-500">
                {e.createdAt.toLocaleDateString()} {e.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Td>
              <Td>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[e.type] ?? "bg-navy-50 text-navy-700"}`}>
                  {e.type}
                </span>
              </Td>
              <Td className="max-w-md truncate text-xs" title={e.stack ?? e.message}>
                {e.message}
              </Td>
              <Td className="text-xs text-navy-500">{e.path}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
