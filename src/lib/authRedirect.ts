const RETURN_KEY = 'auth_market_return';

// Only existing, same-origin market routes are eligible return destinations.
export function safeMarketReturn(value: string | null): string | null {
  if (!value || !/^\/markets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\?[^#]*)?$/i.test(value)) {
    return null;
  }
  return value;
}

export function marketAuthLink(path: string, search = ''): string {
  const destination = safeMarketReturn(path + search);
  if (!destination) return '/auth';
  const params = new URLSearchParams({ redirect: destination });
  const referral = new URLSearchParams(destination.split('?')[1] || '').get('ref');
  if (referral) params.set('ref', referral);
  return `/auth?${params.toString()}`;
}

export function rememberMarketReturn(value: string | null): string | null {
  const destination = safeMarketReturn(value);
  if (destination) localStorage.setItem(RETURN_KEY, destination);
  return destination;
}

export function pendingMarketReturn(): string | null {
  return safeMarketReturn(localStorage.getItem(RETURN_KEY));
}

export function clearMarketReturn() {
  localStorage.removeItem(RETURN_KEY);
}