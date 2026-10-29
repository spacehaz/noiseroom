import { createCryptoRandom } from '@noiseroom/cipher';
import { getRandomValues } from 'expo-crypto';

export const rng = createCryptoRandom(getRandomValues);
