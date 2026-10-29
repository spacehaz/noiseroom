import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { saveToken, decodeToken } from '@/lib/token';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/auth.slice';
import { Button, Input, Title, Text } from '@/components';
import { Container, Fields, Actions } from './_styles';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (password !== confirm) {
      setError('passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.fetch<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      await saveToken(access_token);
      dispatch(setAuth({ token: access_token, username: decodeToken(access_token).username }));
      router.replace('/(auth)/set-pin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'request failed');
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
        <Title>// register</Title>
        <Fields>
          <Input
            label="username"
            value={username}
            onChange={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="password"
            value={password}
            onChange={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="confirm password"
            value={confirm}
            onChange={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          {error ? (
            <Text error size="sm">
              {error}
            </Text>
          ) : null}
        </Fields>
        <Actions>
          <Button title="register" onClick={handleRegister} loading={loading} />
          <Button title="back to login" onClick={() => router.back()} variant="secondary" />
        </Actions>
      </Container>
    </KeyboardAvoidingView>
  );
}
