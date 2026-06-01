import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { Vocabulary } from '@noiseroom/cipher';

const CANARY = 'noiseroom_v1';
export const MAX_PIN_ATTEMPTS = 5;

export function encryptVocabulary(vocabulary: Vocabulary, pin: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(vocabulary), pin).toString();
}

export function decryptVocabulary(encrypted: string, pin: string): Vocabulary {
  const bytes = CryptoJS.AES.decrypt(encrypted, pin);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// PIN canary — set on first PIN creation, verified on every unlock
export async function setPinCanary(username: string, pin: string): Promise<void> {
  const encrypted = CryptoJS.AES.encrypt(CANARY, pin).toString();
  await SecureStore.setItemAsync(`pin_canary_${username}`, encrypted);
  await SecureStore.deleteItemAsync(`pin_attempts_${username}`);
}

export async function verifyPin(username: string, pin: string): Promise<boolean> {
  const encrypted = await SecureStore.getItemAsync(`pin_canary_${username}`);
  if (!encrypted) return true;
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, pin).toString(CryptoJS.enc.Utf8);
    return decrypted === CANARY;
  } catch {
    return false;
  }
}

// Attempt counter
export async function getAttempts(username: string): Promise<number> {
  return parseInt((await SecureStore.getItemAsync(`pin_attempts_${username}`)) ?? '0');
}

export async function incrementAttempts(username: string): Promise<number> {
  const next = (await getAttempts(username)) + 1;
  await SecureStore.setItemAsync(`pin_attempts_${username}`, String(next));
  return next;
}

export async function resetAttempts(username: string): Promise<void> {
  await SecureStore.deleteItemAsync(`pin_attempts_${username}`);
}

// Local vocabulary storage
function vocabKey(username: string, chatId: string): string {
  return `vocabulary_${username}_${chatId}`;
}

async function getStoredChatIds(username: string): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(`vocabulary_chat_ids_${username}`);
  return raw ? JSON.parse(raw) : [];
}

async function addStoredChatId(username: string, chatId: string): Promise<void> {
  const ids = await getStoredChatIds(username);
  if (!ids.includes(chatId)) {
    await SecureStore.setItemAsync(`vocabulary_chat_ids_${username}`, JSON.stringify([...ids, chatId]));
  }
}

export async function saveVocabularyLocally(username: string, chatId: string, vocabulary: Vocabulary, pin: string): Promise<void> {
  await SecureStore.setItemAsync(vocabKey(username, chatId), encryptVocabulary(vocabulary, pin));
  await addStoredChatId(username, chatId);
}

export async function loadAllVocabularies(username: string, pin: string): Promise<Record<string, Vocabulary>> {
  const ids = await getStoredChatIds(username);
  const result: Record<string, Vocabulary> = {};
  for (const chatId of ids) {
    const encrypted = await SecureStore.getItemAsync(vocabKey(username, chatId));
    if (encrypted) {
      try {
        result[chatId] = decryptVocabulary(encrypted, pin);
      } catch {
        // skip corrupted entries
      }
    }
  }
  return result;
}

export async function wipeAllVocabularies(username: string): Promise<void> {
  const ids = await getStoredChatIds(username);
  for (const chatId of ids) {
    await SecureStore.deleteItemAsync(vocabKey(username, chatId));
  }
  await SecureStore.deleteItemAsync(`vocabulary_chat_ids_${username}`);
  await SecureStore.deleteItemAsync(`pin_canary_${username}`);
  await SecureStore.deleteItemAsync(`pin_attempts_${username}`);
}
