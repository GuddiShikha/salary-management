import { Autocomplete, Button, Group, Modal, NumberInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { ApiError } from '../../api/client';
import type { Employee, EmployeeInput, Meta } from '../../api/types';
import { useSaveEmployee } from '../queries';

type Props = {
  opened: boolean;
  onClose: () => void;
  employee: Employee | null;
  meta: Meta | undefined;
};

const today = () => new Date().toISOString().slice(0, 10);

const toInput = (employee: Employee | null): EmployeeInput => ({
  full_name: employee?.full_name ?? '',
  email: employee?.email ?? '',
  job_title: employee?.job_title ?? '',
  department: employee?.department ?? '',
  country: employee?.country ?? '',
  salary: employee?.salary ?? '',
  hired_on: employee?.hired_on ?? today(),
});

const required = (label: string) => (value: unknown) =>
  value === '' || value == null ? `${label} is required` : null;

export const EmployeeFormModal = ({ opened, onClose, employee, meta }: Props) => {
  const save = useSaveEmployee();
  const form = useForm<EmployeeInput>({
    initialValues: toInput(employee),
    validate: {
      full_name: required('Name'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      job_title: required('Job title'),
      department: required('Department'),
      country: required('Country'),
      salary: (value) => (typeof value === 'number' && value > 0 ? null : 'Salary must be greater than 0'),
      hired_on: (value) => (!value ? 'Hire date is required' : value > today() ? "Can't be in the future" : null),
    },
  });

  // Reset whenever the modal opens for a different employee.
  useEffect(() => {
    if (opened) {
      form.setValues(toInput(employee));
      form.resetDirty(toInput(employee));
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, employee]);

  const currency = meta?.countries.find((c) => c.name === form.values.country)?.currency;

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: employee?.id, input: values });
      notifications.show({
        color: 'green',
        message: employee ? `${values.full_name} updated` : `${values.full_name} added`,
      });
      onClose();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        form.setErrors(
          Object.fromEntries(
            Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages?.join(', ')]),
          ),
        );
      } else {
        notifications.show({ color: 'red', message: (error as Error).message });
      }
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title={employee ? 'Edit employee' : 'Add employee'} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Full name" withAsterisk {...form.getInputProps('full_name')} />
          <TextInput label="Email" type="email" withAsterisk {...form.getInputProps('email')} />
          <Autocomplete
            label="Job title"
            withAsterisk
            data={meta?.job_titles ?? []}
            {...form.getInputProps('job_title')}
          />
          <Autocomplete
            label="Department"
            withAsterisk
            data={meta?.departments ?? []}
            {...form.getInputProps('department')}
          />
          <Select
            label="Country"
            withAsterisk
            searchable
            data={meta?.countries.map((c) => c.name) ?? []}
            {...form.getInputProps('country')}
            onChange={(value) => form.setFieldValue('country', value ?? '')}
          />
          <NumberInput
            label={`Annual salary${currency ? ` (${currency})` : ''}`}
            withAsterisk
            min={0}
            thousandSeparator=","
            decimalScale={2}
            hideControls
            {...form.getInputProps('salary')}
          />
          <TextInput label="Hire date" type="date" withAsterisk max={today()} {...form.getInputProps('hired_on')} />
        </SimpleGrid>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {employee ? 'Save changes' : 'Add employee'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
