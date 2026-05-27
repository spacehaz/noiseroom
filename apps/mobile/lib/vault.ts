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
export async function setPinCanary(pin: string): Promise<void> {
  const encrypted = CryptoJS.AES.encrypt(CANARY, pin).toString();
  await SecureStore.setItemAsync('pin_canary', encrypted);
  await SecureStore.deleteItemAsync('pin_attempts');
}

export async function verifyPin(pin: string): Promise<boolean> {
  const encrypted = await SecureStore.getItemAsync('pin_canary');
  if (!encrypted) return true;
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, pin).toString(CryptoJS.enc.Utf8);
    return decrypted === CANARY;
  } catch {
    return false;
  }
}

// Attempt counter
export async function getAttempts(): Promise<number> {
  return parseInt((await SecureStore.getItemAsync('pin_attempts')) ?? '0');
}

export async function incrementAttempts(): Promise<number> {
  const next = (await getAttempts()) + 1;
  await SecureStore.setItemAsync('pin_attempts', String(next));
  return next;
}

export async function resetAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync('pin_attempts');
}

// Local vocabulary storage
function vocabKey(chatId: string): string {
  return `vocabulary_${chatId}`;
}

async function getStoredChatIds(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync('vocabulary_chat_ids');
  return raw ? JSON.parse(raw) : [];
}

async function addStoredChatId(chatId: string): Promise<void> {
  const ids = await getStoredChatIds();
  if (!ids.includes(chatId)) {
    await SecureStore.setItemAsync('vocabulary_chat_ids', JSON.stringify([...ids, chatId]));
  }
}

export async function saveVocabularyLocally(chatId: string, vocabulary: Vocabulary, pin: string): Promise<void> {
  await SecureStore.setItemAsync(vocabKey(chatId), encryptVocabulary(vocabulary, pin));
  await addStoredChatId(chatId);
}

export async function loadAllVocabularies(pin: string): Promise<Record<string, Vocabulary>> {
  const ids = await getStoredChatIds();
  const result: Record<string, Vocabulary> = {};
  for (const chatId of ids) {
    const encrypted = await SecureStore.getItemAsync(vocabKey(chatId));
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

export async function wipeAllVocabularies(): Promise<void> {
  const ids = await getStoredChatIds();
  for (const chatId of ids) {
    await SecureStore.deleteItemAsync(vocabKey(chatId));
  }
  await SecureStore.deleteItemAsync('vocabulary_chat_ids');
  await SecureStore.deleteItemAsync('pin_canary');
  await SecureStore.deleteItemAsync('pin_attempts');
}
