import { describe, expect, test } from 'bun:test';
import { marketAuthLink, safeMarketReturn } from './authRedirect';

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

  test('external or non-market destinations cannot redirect users', () => {
    for (const value of ['https://evil.example', '//evil.example', '/auth', '/markets/../auth', '/markets/not-an-id']) {
      expect(safeMarketReturn(value)).toBeNull();
    }
    expect(marketAuthLink('/')).toBe('/auth');
  });
});