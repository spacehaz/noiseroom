import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setPin } from '@/store/auth.slice';
import { setPinCanary } from '@/lib/vault';
import { Button, Input, Title, Text } from '@/components';
import { Container, Fields, Actions } from './_styles';

export default function SetPinScreen() {
  const dispatch = useAppDispatch();
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  async function handleConfirm() {
    if (pin.length < 4) {
      setError('pin must be at least 4 digits');
      return;
    }
    if (pin !== confirm) {
      setError('pins do not match');
      return;
    }
    await setPinCanary(pin);
    dispatch(setPin(pin));
    router.replace('/(app)/chats');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Container>
        <Title>// set pin</Title>
        <Text muted size="sm">your pin encrypts your vocabulary backup. it is never stored — you will need to enter it each session.</Text>
        <Fields>
          <Input
            label="pin"
            value={pin}
            onChange={setPinValue}
            secureTextEntry
            keyboardType="numeric"
            returnKeyType="next"
          />
          <Input
            label="confirm pin"
            value={confirm}
            onChange={setConfirm}
            secureTextEntry
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          {error ? <Text error size="sm">{error}</Text> : null}
        </Fields>
        <Actions>
          <Button title="confirm" onClick={handleConfirm} />
        </Actions>
      </Container>
    </KeyboardAvoidingView>
  );
}
