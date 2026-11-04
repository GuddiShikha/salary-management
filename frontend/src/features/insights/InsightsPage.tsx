import {
  Alert,
  Card,
  Center,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import type { CountryStats } from '../../api/types';
import { formatMoney, formatNumber } from '../../lib/format';
import { useCountryBreakdown, useOverview } from '../queries';
import { GroupStatsTable } from './GroupStatsTable';
import { StatCard } from './StatCard';

const CountryTable = ({
  countries,
  selected,
  onSelect,
}: {
  countries: CountryStats[];
  selected: string | null;
  onSelect: (country: string) => void;
}) => (
  <Table.ScrollContainer minWidth={720}>
    <Table highlightOnHover verticalSpacing="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Country</Table.Th>
          <Table.Th ta="right">Headcount</Table.Th>
          <Table.Th ta="right">Min</Table.Th>
          <Table.Th ta="right">Median</Table.Th>
          <Table.Th ta="right">Average</Table.Th>
          <Table.Th ta="right">Max</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {countries.map((row) => (
          <Table.Tr
            key={row.country}
            onClick={() => onSelect(row.country)}
            bg={row.country === selected ? 'var(--mantine-primary-color-light)' : undefined}
            style={{ cursor: 'pointer' }}
          >
            <Table.Td>
              <Text size="sm" fw={500}>
                {row.country}{' '}
                <Text span size="xs" c="dimmed">
                  {row.currency}
                </Text>
              </Text>
            </Table.Td>
            <Table.Td ta="right">{formatNumber(row.headcount)}</Table.Td>
            <Table.Td ta="right">{formatMoney(row.min_salary, row.currency)}</Table.Td>
            <Table.Td ta="right">{formatMoney(row.median_salary, row.currency)}</Table.Td>
            <Table.Td ta="right" fw={600}>
              {formatMoney(row.avg_salary, row.currency)}
            </Table.Td>
            <Table.Td ta="right">{formatMoney(row.max_salary, row.currency)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  </Table.ScrollContainer>
);

const CountryDetail = ({ country }: { country: string }) => {
  const breakdown = useCountryBreakdown(country);

  if (breakdown.isPending) {
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  }
  if (breakdown.isError) {
    return <Alert color="red">{breakdown.error.message}</Alert>;
  }

  const data = breakdown.data;
  const money = (value: number) => formatMoney(value, data.currency);

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatCard label="Headcount" value={formatNumber(data.headcount)} />
        <StatCard label="Median salary" value={money(data.median_salary)} />
        <StatCard label="Average salary" value={money(data.avg_salary)} />
        <StatCard
          label="Salary range"
          value={`${formatMoney(data.min_salary, data.currency, { compact: true })} – ${formatMoney(data.max_salary, data.currency, { compact: true })}`}
        />
      </SimpleGrid>
      <Card withBorder padding="md">
        <Tabs defaultValue="job_title">
          <Tabs.List>
            <Tabs.Tab value="job_title">By job title</Tabs.Tab>
            <Tabs.Tab value="department">By department</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="job_title" pt="sm">
            <GroupStatsTable label="Job title" rows={data.by_job_title} currency={data.currency} />
          </Tabs.Panel>
          <Tabs.Panel value="department" pt="sm">
            <GroupStatsTable label="Department" rows={data.by_department} currency={data.currency} />
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Stack>
  );
};

export const InsightsPage = () => {
  const overview = useOverview();
  const [selected, setSelected] = useState<string | null>(null);

  if (overview.isPending) {
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  }
  if (overview.isError) {
    return (
      <Alert color="red" title="Could not load insights">
        {overview.error.message}
      </Alert>
    );
  }

  const { countries, total_headcount, country_count } = overview.data;
  const largest = [...countries].sort((a, b) => b.headcount - a.headcount)[0];
  const country = selected ?? largest?.country ?? null;

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Salary insights</Title>
        <Text c="dimmed" size="sm">
          Figures are in each country's local currency — they are never converted or mixed across countries.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatCard label="Total headcount" value={formatNumber(total_headcount)} />
        <StatCard label="Countries" value={country_count} />
        <StatCard
          label="Largest location"
          value={largest?.country ?? '—'}
          hint={largest ? `${formatNumber(largest.headcount)} employees` : undefined}
        />
      </SimpleGrid>

      <Card withBorder padding={0}>
        <Text fw={600} p="md" pb={0}>
          Pay by country
        </Text>
        <Text size="xs" c="dimmed" px="md">
          Select a row to drill into job titles and departments.
        </Text>
        {countries.length === 0 ? (
          <Text c="dimmed" p="md">
            No employees yet.
          </Text>
        ) : (
          <CountryTable countries={countries} selected={country} onSelect={setSelected} />
        )}
      </Card>

      {country && (
        <Stack gap="sm">
          <Group justify="space-between" align="flex-end">
            <Title order={3}>{country}</Title>
            <Select
              aria-label="Select country"
              w={220}
              data={countries.map((c) => c.country)}
              value={country}
              onChange={(value) => value && setSelected(value)}
              allowDeselect={false}
            />
          </Group>
          <CountryDetail country={country} />
        </Stack>
      )}
    </Stack>
  );
};
