const formatters = new Map<string, Intl.NumberFormat>();

const formatterFor = (currency: string, compact: boolean): Intl.NumberFormat => {
  const key = `${currency}:${compact}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? 'compact' : 'standard',
    });
    formatters.set(key, formatter);
  }
  return formatter;
};

export const formatMoney = (
  amount: number | null | undefined,
  currency: string,
  { compact = false } = {},
): string => (amount == null ? '—' : formatterFor(currency, compact).format(amount));

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
