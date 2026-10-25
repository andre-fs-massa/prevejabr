import { describe, expect, test } from 'bun:test';
import { clearMarketReturn, marketAuthLink, pendingMarketReturn, rememberMarketReturn, safeMarketReturn } from './authRedirect';

const market = '/markets/82691ec2-19df-425a-ba60-8f729eb1e371';

describe('shared market authentication return', () => {
  test('login and signup retain the exact shared market and referral', () => {
    const link = new URL(marketAuthLink(market, '?ref=AMIGO25'), 'https://prevejabr.afsm.me');
    expect(link.pathname).toBe('/auth');
    expect(link.searchParams.get('redirect')).toBe(`${market}?ref=AMIGO25`);
    expect(link.searchParams.get('ref')).toBe('AMIGO25');
    expect(safeMarketReturn(link.searchParams.get('redirect'))).toBe(`${market}?ref=AMIGO25`);
  });

  test('market links without referral still return to that market', () => {
    const params = new URLSearchParams(marketAuthLink(market).split('?')[1]);
    expect(params.get('redirect')).toBe(market);
  });

  test('a shared market survives home and generic signup before authentication', () => {
    const values = new Map();
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      setItem: (key, value) => values.set(key, value),
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
    } });
    try {
      rememberMarketReturn(`${market}?ref=AMIGO25`);
      rememberMarketReturn(null);
      expect(pendingMarketReturn()).toBe(`${market}?ref=AMIGO25`);
      clearMarketReturn();
      expect(pendingMarketReturn()).toBeNull();
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });

  test('external or non-market destinations cannot redirect users', () => {
    for (const value of ['https://evil.example', '//evil.example', '/auth', '/markets/../auth', '/markets/not-an-id']) {
      expect(safeMarketReturn(value)).toBeNull();
    }
    expect(marketAuthLink('/')).toBe('/auth');
  });
});