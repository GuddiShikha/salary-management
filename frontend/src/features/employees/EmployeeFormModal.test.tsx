import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/client';
import * as api from '../../api/endpoints';
import { employee, meta } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { EmployeeFormModal } from './EmployeeFormModal';

vi.mock('../../api/endpoints');

const renderModal = (props: Partial<Parameters<typeof EmployeeFormModal>[0]> = {}) => {
  const onClose = vi.fn();
  renderWithProviders(
    <EmployeeFormModal opened onClose={onClose} employee={null} meta={meta} {...props} />,
  );
  return { onClose };
};

describe('EmployeeFormModal', () => {
  it('validates required fields before calling the API', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Add employee' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Salary must be greater than 0')).toBeInTheDocument();
    expect(api.createEmployee).not.toHaveBeenCalled();
  });

  it('pre-fills and updates an existing employee', async () => {
    vi.mocked(api.updateEmployee).mockResolvedValue(employee({ salary: 2_000_000 }));
    const user = userEvent.setup();
    const { onClose } = renderModal({ employee: employee() });

    const salary = screen.getByLabelText(/Annual salary \(INR\)/);
    expect(screen.getByLabelText(/Full name/)).toHaveValue('Asha Rao');

    await user.clear(salary);
    await user.type(salary, '2000000');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(api.updateEmployee).toHaveBeenCalledWith(1, expect.objectContaining({ salary: 2_000_000 })),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('shows server-side field errors inline', async () => {
    vi.mocked(api.updateEmployee).mockRejectedValue(
      new ApiError(422, 'Unprocessable', { email: ['has already been taken'] }),
    );
    const user = userEvent.setup();
    const { onClose } = renderModal({ employee: employee() });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('has already been taken')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
