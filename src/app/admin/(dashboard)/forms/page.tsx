import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getFormStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const forms = await getFormStats(30);

  return (
    <div>
      <PageHeader title="Forms" description="Funnel per form, last 30 days." />

      <Table>
        <Thead>
          <tr>
            <Th>Form</Th>
            <Th className="text-right">Viewed</Th>
            <Th className="text-right">Started</Th>
            <Th className="text-right">Submitted</Th>
            <Th className="text-right">Abandoned</Th>
            <Th className="text-right">Errors</Th>
            <Th className="text-right">Completion</Th>
          </tr>
        </Thead>
        <tbody>
          {forms.length === 0 && <EmptyState message="No form interactions recorded yet." />}
          {forms.map((f) => (
            <Tr key={f.formId}>
              <Td className="font-medium text-navy-900">{f.formId}</Td>
              <Td className="text-right">{f.viewed}</Td>
              <Td className="text-right">{f.started}</Td>
              <Td className="text-right">{f.submitted}</Td>
              <Td className="text-right">{f.abandoned}</Td>
              <Td className="text-right">{f.validationErrors}</Td>
              <Td className="text-right font-medium">{f.completionRate}%</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
