import PageHeader from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getCtaStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminCtasPage() {
  const ctas = await getCtaStats(30);

  return (
    <div>
      <PageHeader title="CTAs" description="Viewed / hovered / clicked per call-to-action, last 30 days." />

      <Table>
        <Thead>
          <tr>
            <Th>CTA</Th>
            <Th className="text-right">Viewed</Th>
            <Th className="text-right">Hovered</Th>
            <Th className="text-right">Clicked</Th>
            <Th className="text-right">CTR</Th>
          </tr>
        </Thead>
        <tbody>
          {ctas.length === 0 && <EmptyState message="No CTA interactions recorded yet." />}
          {ctas.map((c) => (
            <Tr key={c.ctaId}>
              <Td className="font-medium text-navy-900">{c.ctaId}</Td>
              <Td className="text-right">{c.viewed}</Td>
              <Td className="text-right">{c.hovered}</Td>
              <Td className="text-right">{c.clicked}</Td>
              <Td className="text-right font-medium">{c.ctr}%</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
