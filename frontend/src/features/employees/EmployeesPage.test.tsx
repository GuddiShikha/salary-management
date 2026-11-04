import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../api/endpoints';
import { employee, meta } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { EmployeesPage } from './EmployeesPage';

vi.mock('../../api/endpoints');

const asha = employee();
const ben = employee({
  id: 2,
  full_name: 'Ben Carter',
  email: 'ben@acme.example',
  country: 'United States',
  currency: 'USD',
  salary: 90_000,
  job_title: 'Account Executive',
  department: 'Sales',
});

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.mocked(api.fetchMeta).mockResolvedValue(meta);
    vi.mocked(api.listEmployees).mockResolvedValue({
      data: [asha, ben],
      meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
    });
  });

  it('lists employees with salaries in local currency', async () => {
    renderWithProviders(<EmployeesPage />);

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument();
    expect(screen.getByText('₹1,800,000')).toBeInTheDocument();
    expect(screen.getByText('$90,000')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–2 of 2')).toBeInTheDocument();
  });

  it('sends a debounced search to the server and resets to page 1', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmployeesPage />);
    await screen.findByText('Asha Rao');

    await user.type(screen.getByLabelText('Search employees'), 'ben');

    await waitFor(() =>
      expect(api.listEmployees).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'ben', page: 1 })),
    );
  });

  it('toggles sort direction when a header is clicked twice', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmployeesPage />);
    await screen.findByText('Asha Rao');

    await user.click(screen.getByRole('button', { name: 'Sort by Salary' }));
    await waitFor(() =>
      expect(api.listEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'salary', direction: 'asc' }),
      ),
    );

    await user.click(screen.getByRole('button', { name: 'Sort by Salary' }));
    await waitFor(() =>
      expect(api.listEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'salary', direction: 'desc' }),
      ),
    );
  });

  it('shows an empty state when nothing matches', async () => {
    vi.mocked(api.listEmployees).mockResolvedValue({
      data: [],
      meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
    });
    renderWithProviders(<EmployeesPage />);

    expect(await screen.findByText('No employees match your filters.')).toBeInTheDocument();
  });

  it('deletes an employee after confirmation', async () => {
    vi.mocked(api.deleteEmployee).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<EmployeesPage />);

    await user.click(await screen.findByRole('button', { name: 'Delete Ben Carter' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(api.deleteEmployee).toHaveBeenCalledWith(2, expect.anything()));
  });

  it('shows an error when the list fails to load', async () => {
    vi.mocked(api.listEmployees).mockRejectedValue(new Error('Server unavailable'));
    renderWithProviders(<EmployeesPage />);

    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();
  });
});
