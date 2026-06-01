import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { clearToken } from '@/lib/token';
import { wipeAllVocabularies } from '@/lib/vault';
import { socketClient } from '@/lib/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth } from '@/store/auth.slice';
import { clearVocabularies } from '@/store/vocabularies.slice';
import { Button, Text } from '@/components';
import { Container, Header, HeaderTitle, Body, Username, Divider, Actions } from './_styles';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.username)!;
  const queryClient = useQueryClient();
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { mutate: leaveAll, isPending: isLeaving } = useMutation({
    mutationFn: () => api.fetch('/chats/memberships', { method: 'DELETE' }),
    onSuccess: async () => {
      await wipeAllVocabularies(username);
      dispatch(clearVocabularies());
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setConfirmLeave(false);
      router.replace('/(app)/chats');
    },
  });

  async function handleLogout() {
    socketClient.disconnect();
    await clearToken();
    dispatch(clearAuth());
    dispatch(clearVocabularies());
    queryClient.clear();
    router.replace('/(auth)/login');
  }

  return (
    <Container>
      <Header>
        <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
        <HeaderTitle>{`> profile`}</HeaderTitle>
      </Header>

      <Body>
        <Username>{`@${username}`}</Username>
        <Divider />
        <Actions>
          {confirmLeave ? (
            <>
              <Text error size="sm">this will remove you from all chats and wipe all local vocabularies. are you sure?</Text>
              <Button
                title="confirm leave all"
                onClick={() => leaveAll()}
                loading={isLeaving}
              />
              <Button title="cancel" onClick={() => setConfirmLeave(false)} variant="secondary" />
            </>
          ) : (
            <Button title="leave all chats" onClick={() => setConfirmLeave(true)} variant="secondary" />
          )}
          <Button title="logout" onClick={handleLogout} />
        </Actions>
      </Body>
    </Container>
  );
}
