import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'auth_token';

export interface TokenPayload {
  userId: string;
  username: string;
}

export function decodeToken(token: string): TokenPayload {
  return JSON.parse(atob(token.split('.')[1]));
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  api.setToken(token);
}

export async function loadToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) api.setToken(token);
  return token;
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  api.clearToken();
}
