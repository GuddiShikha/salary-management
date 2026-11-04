import { AppShell, Container, Group, SegmentedControl, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';
import { useState } from 'react';
import { EmployeesPage } from './features/employees/EmployeesPage';
import { InsightsPage } from './features/insights/InsightsPage';

type View = 'employees' | 'insights';

export const App = () => {
  const [view, setView] = useState<View>('employees');

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size="lg" variant="light">
                <IconCash size={20} />
              </ThemeIcon>
              <div>
                <Title order={4} lh={1.1}>
                  ACME Salaries
                </Title>
                <Text size="xs" c="dimmed" visibleFrom="xs">
                  HR salary management
                </Text>
              </div>
            </Group>
            <SegmentedControl
              value={view}
              onChange={(value) => setView(value as View)}
              data={[
                { label: 'Employees', value: 'employees' },
                { label: 'Insights', value: 'insights' },
              ]}
            />
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl">{view === 'employees' ? <EmployeesPage /> : <InsightsPage />}</Container>
      </AppShell.Main>
    </AppShell>
  );
};
