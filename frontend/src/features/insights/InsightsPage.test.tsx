import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../api/endpoints';
import { indiaBreakdown, overview } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { InsightsPage } from './InsightsPage';

vi.mock('../../api/endpoints');

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.mocked(api.fetchOverview).mockResolvedValue(overview);
    vi.mocked(api.fetchCountryBreakdown).mockImplementation(async (country) => ({
      ...indiaBreakdown,
      country,
    }));
  });

  it('shows org totals and per-country stats', async () => {
    renderWithProviders(<InsightsPage />);

    expect(await screen.findByText('Total headcount')).toBeInTheDocument();
    expect(screen.getAllByText('United States').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$90,000', { selector: 'td' })).toHaveLength(4); // min, median, avg, max
  });

  it('drills into the largest country by default and switches on row click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);

    await waitFor(() => expect(api.fetchCountryBreakdown).toHaveBeenCalledWith('India'));
    expect(await screen.findByText('By job title')).toBeInTheDocument();

    const usRow = screen.getAllByText('United States').find((el) => el.closest('tr'))!;
    await user.click(usRow);

    await waitFor(() => expect(api.fetchCountryBreakdown).toHaveBeenCalledWith('United States'));
  });
});
