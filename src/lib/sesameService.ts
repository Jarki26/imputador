export interface SesameUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface SesameCheck {
  id: string;
  checkIn: {
    date: string;
  };
  checkOut?: {
    date: string;
  };
}

function getUrl(endpoint: string, proxyUrl?: string | null): string {
  const base = 'https://back-eu4.sesametime.com/api/v3';
  const fullUrl = `${base}${endpoint}`;
  if (!proxyUrl) return fullUrl;

  const normalizedProxy = proxyUrl.endsWith('/') ? proxyUrl : `${proxyUrl}/`;
  return `${normalizedProxy}${fullUrl}`;
}

export const sesameService = {
  async login(email: string, password: string, proxyUrl?: string | null): Promise<string> {
    const url = getUrl('/security/login', proxyUrl);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Sesame login failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  async getMe(token: string, proxyUrl?: string | null): Promise<SesameUser> {
    const url = getUrl('/security/me', proxyUrl);
    const response = await fetch(url, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Sesame user info: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // The documentation shows 'data' is an array
    return Array.isArray(result.data) ? result.data[0] : result.data;
  },

  async getChecks(userId: string, token: string, from: string, to: string, proxyUrl?: string | null): Promise<SesameCheck[]> {
    const endpoint = `/employees/${userId}/checks?from=${from}&to=${to}&includeOut=true`;
    const url = getUrl(endpoint, proxyUrl);
    const response = await fetch(url, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Sesame checks: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },
};
