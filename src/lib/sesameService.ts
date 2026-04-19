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

export const sesameService = {
  async login(email: string, password: string): Promise<string> {
    const response = await fetch('https://back-eu4.sesametime.com/api/v3/security/login', {
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

  async getMe(token: string): Promise<SesameUser> {
    const response = await fetch('https://back-eu4.sesametime.com/api/v3/security/me', {
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

  async getChecks(userId: string, token: string, from: string, to: string): Promise<SesameCheck[]> {
    const url = `https://back-eu4.sesametime.com/api/v3/employees/${userId}/checks?from=${from}&to=${to}&includeOut=true`;
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
