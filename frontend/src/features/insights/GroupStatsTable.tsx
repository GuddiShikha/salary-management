import { Progress, Table, Text } from '@mantine/core';
import type { GroupStats } from '../../api/types';
import { formatMoney } from '../../lib/format';

type Props = { label: string; rows: GroupStats[]; currency: string };

// Rows arrive sorted by average salary (desc); the bar shows each row's
// average relative to the highest-paid group so differences are scannable.
export const GroupStatsTable = ({ label, rows, currency }: Props) => {
  const topAverage = Math.max(...rows.map((row) => row.avg_salary), 1);

  return (
    <Table.ScrollContainer minWidth={560}>
      <Table verticalSpacing="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{label}</Table.Th>
            <Table.Th ta="right">Headcount</Table.Th>
            <Table.Th ta="right">Min</Table.Th>
            <Table.Th ta="right">Max</Table.Th>
            <Table.Th ta="right">Average</Table.Th>
            <Table.Th w="22%" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.name}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {row.name}
                </Text>
              </Table.Td>
              <Table.Td ta="right">{row.headcount}</Table.Td>
              <Table.Td ta="right">{formatMoney(row.min_salary, currency, { compact: true })}</Table.Td>
              <Table.Td ta="right">{formatMoney(row.max_salary, currency, { compact: true })}</Table.Td>
              <Table.Td ta="right" fw={600}>
                {formatMoney(row.avg_salary, currency, { compact: true })}
              </Table.Td>
              <Table.Td>
                <Progress value={(row.avg_salary / topAverage) * 100} size="sm" aria-hidden />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
