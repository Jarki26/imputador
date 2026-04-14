import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyStore } from './companyStore';
import type { Company } from './db';

describe('CompanyStore', () => {
  let store: CompanyStore;

  beforeEach(async () => {
    // Use unique database name per test for isolation
    const dbName = `test-company-db-${Math.random().toString(36).substring(7)}`;
    store = new CompanyStore(dbName);
  });

  it('should upsert a company and retrieve it', async () => {
    await store.upsertCompany('Google');
    const recent = await store.getRecentCompanies(1);
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Google');
    expect(recent[0].useCount).toBe(1);
  });

  it('should increment useCount on existing company', async () => {
    await store.upsertCompany('Apple');
    await store.upsertCompany('Apple');
    const recent = await store.getRecentCompanies(1);
    expect(recent[0].name).toBe('Apple');
    expect(recent[0].useCount).toBe(2);
  });

  it('should list top 10 most used companies sorted by useCount', async () => {
    // Add 12 companies with different use counts
    for (let i = 1; i <= 12; i++) {
      const name = `Company ${i}`;
      // Company i will be upserted i times
      for (let j = 0; j < i; j++) {
        await store.upsertCompany(name);
      }
    }

    const top10 = await store.getRecentCompanies(10);
    expect(top10).toHaveLength(10);
    expect(top10[0].name).toBe('Company 12');
    expect(top10[0].useCount).toBe(12);
    expect(top10[9].name).toBe('Company 3');
    expect(top10[9].useCount).toBe(3);
  });
});
