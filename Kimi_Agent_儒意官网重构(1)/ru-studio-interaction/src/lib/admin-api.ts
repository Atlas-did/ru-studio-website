/**
 * Admin API client — for use in admin panel pages.
 * All requests include JWT from sessionStorage.
 */

const TOKEN_KEY = 'ru_admin_token';
const USERNAME_KEY = 'ru_admin_username';

function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, username: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}

export function getUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/#/admin/login';
    throw new Error('Unauthorized');
  }

  return res;
}

export const adminApi = {
  // Auth
  async login(password: string): Promise<{ token: string; username: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  // Stats
  async getStats(): Promise<{ concepts: number; collection: number; journal: number; contacts: number }> {
    const res = await authFetch('/api/admin/stats');
    return res.json();
  },

  // Site Config
  async updateSiteConfig(data: Record<string, string>): Promise<{ success: boolean }> {
    const res = await authFetch('/api/admin/site-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Concepts
  async getConcepts(): Promise<any[]> {
    const res = await authFetch('/api/admin/concepts');
    return res.json();
  },

  async createConcept(data: any): Promise<{ success: boolean }> {
    const res = await authFetch('/api/admin/concepts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateConcept(id: string, data: any): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/concepts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteConcept(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/concepts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Collection Items
  async getCollection(): Promise<any[]> {
    const res = await authFetch('/api/admin/collection');
    return res.json();
  },

  async createCollectionItem(data: any): Promise<{ success: boolean }> {
    const res = await authFetch('/api/admin/collection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCollectionItem(slug: string, data: any): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/collection/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCollectionItem(slug: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/collection/${slug}`, { method: 'DELETE' });
    return res.json();
  },

  // Journal Posts
  async getJournal(): Promise<any[]> {
    const res = await authFetch('/api/admin/journal');
    return res.json();
  },

  async createJournalPost(data: any): Promise<{ success: boolean }> {
    const res = await authFetch('/api/admin/journal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateJournalPost(slug: string, data: any): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/journal/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteJournalPost(slug: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/admin/journal/${slug}`, { method: 'DELETE' });
    return res.json();
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authFetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Contacts
  async getContacts(): Promise<any[]> {
    const res = await authFetch('/api/admin/contacts');
    return res.json();
  },
};
