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

  it('should delete a company', async () => {
    await store.upsertCompany('ToDelete');
    let recent = await store.getRecentCompanies();
    expect(recent.some((c) => c.name === 'ToDelete')).toBe(true);

    await store.deleteCompany('ToDelete');
    recent = await store.getRecentCompanies();
    expect(recent.some((c) => c.name === 'ToDelete')).toBe(false);
  });

  it('should update a company name and properties', async () => {
    await store.upsertCompany('OldName');
    await store.updateCompany('OldName', { name: 'NewName' });

    const recent = await store.getRecentCompanies();
    expect(recent.some((c) => c.name === 'OldName')).toBe(false);
    expect(recent.some((c) => c.name === 'NewName')).toBe(true);
  });

  it('should search companies by name', async () => {
    await store.upsertCompany('Apple');
    await store.upsertCompany('Amazon');
    await store.upsertCompany('Google');

    const results = await store.searchCompanies('Am');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Amazon');
  });

  it('should return early if name is empty in upsertCompany', async () => {
    // @ts-ignore - testing runtime behavior for empty string
    await store.upsertCompany('');
    const recent = await store.getRecentCompanies();
    expect(recent).toHaveLength(0);
  });

  it('should return early if company does not exist in updateCompany', async () => {
    await store.updateCompany('NonExistent', { name: 'NewName' });
    const recent = await store.getRecentCompanies();
    expect(recent).toHaveLength(0);
  });

  it('should update company properties without changing name', async () => {
    await store.upsertCompany('Existing');
    const now = new Date();
    await store.updateCompany('Existing', { useCount: 10, lastUsedAt: now });

    const recent = await store.getRecentCompanies();
    const company = recent.find((c) => c.name === 'Existing');
    expect(company?.useCount).toBe(10);
    expect(company?.lastUsedAt.getTime()).toBe(now.getTime());
  });

  it('should sort search results by useCount and then by lastUsedAt', async () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);

    // Create companies with specific use counts and times
    // We use updateCompany to manually set these for precise testing
    await store.upsertCompany('A');
    await store.updateCompany('A', { useCount: 5, lastUsedAt: tenMinutesAgo });

    await store.upsertCompany('B');
    await store.updateCompany('B', {
      useCount: 10,
      lastUsedAt: fiveMinutesAgo,
    });

    await store.upsertCompany('C');
    await store.updateCompany('C', { useCount: 10, lastUsedAt: now });

    const results = await store.searchCompanies('');
    expect(results).toHaveLength(3);

    // B and C have useCount 10, C is more recent
    expect(results[0].name).toBe('C');
    expect(results[1].name).toBe('B');
    // A has useCount 5
    expect(results[2].name).toBe('A');
  });
});
