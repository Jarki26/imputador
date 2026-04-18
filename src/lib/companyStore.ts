import { initDB, type Company, putItem, deleteItem, getMany } from './db';

/**
 * Service for managing companies in IndexedDB.
 */
export class CompanyStore {
  private dbName: string;

  constructor(dbName: string = 'imputador-db') {
    this.dbName = dbName;
  }

  /**
   * Adds or updates a company, incrementing its use count and updating lastUsedAt.
   * @param name - The name of the company.
   */
  async upsertCompany(name: string): Promise<void> {
    if (!name) return;

    const db = await initDB(this.dbName);
    const existing = await db.get('companies', name);

    const company: Company = {
      name,
      lastUsedAt: new Date(),
      useCount: (existing?.useCount || 0) + 1,
    };

    await putItem(db, 'companies', company);
  }

  /**
   * Retrieves the most used companies.
   * @param limit - The maximum number of companies to return.
   * @returns A promise that resolves to an array of recent companies.
   */
  async getRecentCompanies(limit: number = 10): Promise<Company[]> {
    const db = await initDB(this.dbName);
    return getMany<Company>(db, 'companies', {
      indexName: 'useCount',
      direction: 'prev',
      limit,
    });
  }

  /**
   * Deletes a company by name.
   * @param name - The name of the company to delete.
   */
  async deleteCompany(name: string): Promise<void> {
    const db = await initDB(this.dbName);
    await deleteItem(db, 'companies', name);
  }

  /**
   * Updates an existing company's information.
   * @param name - The original name of the company.
   * @param updates - The properties to update.
   */
  async updateCompany(name: string, updates: Partial<Company>): Promise<void> {
    const db = await initDB(this.dbName);
    const existing = await db.get('companies', name);
    if (!existing) return;

    // If the name is changing, we need to delete the old entry and put a new one
    if (updates.name && updates.name !== name) {
      await deleteItem(db, 'companies', name);
      await putItem(db, 'companies', { ...existing, ...updates } as Company);
    } else {
      await putItem(db, 'companies', { ...existing, ...updates } as Company);
    }
  }

  /**
   * Searches for companies by name (case-insensitive prefix match).
   * @param query - The search query.
   * @returns A promise that resolves to an array of matching companies.
   */
  async searchCompanies(query: string): Promise<Company[]> {
    const db = await initDB(this.dbName);
    const companies = await getMany<Company>(db, 'companies');
    const lowerQuery = query.toLowerCase();

    return companies
      .filter((c) => c.name.toLowerCase().includes(lowerQuery))
      .sort(
        (a, b) =>
          b.useCount - a.useCount ||
          b.lastUsedAt.getTime() - a.lastUsedAt.getTime(),
      );
  }
}
