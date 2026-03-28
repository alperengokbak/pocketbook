import type { ApiClient } from './client';
import type { AuthResponse } from '@pocketbook/shared-types';

export function createAuthApi(client: ApiClient) {
  return {
    register: (data: { email: string; password: string; displayName?: string }) =>
      client.post<AuthResponse>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
      client.post<AuthResponse>('/auth/login', data),

    refresh: (refreshToken: string) =>
      client.post<AuthResponse>('/auth/refresh', { refreshToken }),

    logout: () => client.post<void>('/auth/logout'),
  };
}
