import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPin } from '@/store/auth.slice';
import { loadVocabularies, clearVocabularies } from '@/store/vocabularies.slice';
import {
  verifyPin,
  getAttempts,
  incrementAttempts,
  resetAttempts,
  loadAllVocabularies,
  wipeAllVocabularies,
  MAX_PIN_ATTEMPTS,
} from '@/lib/vault';
import { Button, Input, Title, Text } from '@/components';
import { Container, Fields, Actions } from './_styles';

export default function EnterPinScreen() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.username)!;
  const [pin, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (pin.length < 4) {
      setError('pin must be at least 4 digits');
      return;
    }

    setLoading(true);
    try {
      const attempts = await getAttempts(username);

      if (attempts >= MAX_PIN_ATTEMPTS) {
        setError('too many wrong attempts — all vocabularies wiped');
        return;
      }

      const valid = await verifyPin(username, pin);

      if (!valid) {
        const next = await incrementAttempts(username);
        if (next >= MAX_PIN_ATTEMPTS) {
          await wipeAllVocabularies(username);
          dispatch(clearVocabularies());
          setError('too many wrong attempts — all vocabularies wiped');
        } else {
          const remaining = MAX_PIN_ATTEMPTS - next;
          setError(`wrong pin. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`);
        }
        return;
      }

      await resetAttempts(username);
      const byChat = await loadAllVocabularies(username, pin);
      dispatch(loadVocabularies(byChat));
      dispatch(setPin(pin));
      router.replace('/(app)/chats');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Container>
        <Title>{'// enter pin'}</Title>
        <Text muted size="sm">
          enter your pin to unlock vocabulary access for this session.
        </Text>
        <Fields>
          <Input
            label="pin"
            value={pin}
            onChange={setPinValue}
            secureTextEntry
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          {error ? (
            <Text error size="sm">
              {error}
            </Text>
          ) : null}
        </Fields>
        <Actions>
          <Button title="unlock" onClick={handleConfirm} loading={loading} />
        </Actions>
      </Container>
    </KeyboardAvoidingView>
  );
}
