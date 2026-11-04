import { ActionIcon, Group, Table, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconPencil, IconSelector, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { Employee, SortColumn, SortDirection } from '../../api/types';
import { formatDate, formatMoney } from '../../lib/format';

type Props = {
  employees: Employee[];
  sort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

const SortableHeader = ({
  column,
  children,
  sort,
  direction,
  onSort,
  align = 'left',
}: {
  column: SortColumn;
  children: ReactNode;
  sort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  align?: 'left' | 'right';
}) => {
  const active = sort === column;
  const Icon = active ? (direction === 'asc' ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th
      ta={align}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <UnstyledButton onClick={() => onSort(column)} aria-label={`Sort by ${String(children)}`}>
        <Group gap={4} wrap="nowrap" justify={align === 'right' ? 'flex-end' : 'flex-start'}>
          <Text fw={600} size="sm">
            {children}
          </Text>
          <Icon size={14} />
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
};

export const EmployeeTable = ({ employees, sort, direction, onSort, onEdit, onDelete }: Props) => {
  const header = { sort, direction, onSort };

  return (
    <Table.ScrollContainer minWidth={860}>
      <Table striped highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <SortableHeader column="full_name" {...header}>Name</SortableHeader>
            <SortableHeader column="job_title" {...header}>Job title</SortableHeader>
            <SortableHeader column="department" {...header}>Department</SortableHeader>
            <SortableHeader column="country" {...header}>Country</SortableHeader>
            <SortableHeader column="salary" align="right" {...header}>Salary</SortableHeader>
            <SortableHeader column="hired_on" {...header}>Hired</SortableHeader>
            <Table.Th w={90} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => (
            <Table.Tr key={employee.id}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {employee.full_name}
                </Text>
                <Text size="xs" c="dimmed">
                  {employee.email}
                </Text>
              </Table.Td>
              <Table.Td>{employee.job_title}</Table.Td>
              <Table.Td>{employee.department}</Table.Td>
              <Table.Td>{employee.country}</Table.Td>
              <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(employee.salary, employee.currency)}
              </Table.Td>
              <Table.Td>{formatDate(employee.hired_on)}</Table.Td>
              <Table.Td>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                  <Tooltip label="Edit">
                    <ActionIcon variant="subtle" aria-label={`Edit ${employee.full_name}`} onClick={() => onEdit(employee)}>
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label={`Delete ${employee.full_name}`}
                      onClick={() => onDelete(employee)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
