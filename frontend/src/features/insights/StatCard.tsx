import { Card, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export const StatCard = ({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) => (
  <Card withBorder padding="md">
    <Text size="xs" tt="uppercase" fw={600} c="dimmed">
      {label}
    </Text>
    <Text size="xl" fw={700} mt={4} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Text>
    {hint && (
      <Text size="xs" c="dimmed" mt={2}>
        {hint}
      </Text>
    )}
  </Card>
);
