import { useState } from 'react';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Vocabulary } from '@noiseroom/cipher';
import { api } from '@/lib/api';
import { encryptVocabulary, saveVocabularyLocally } from '@/lib/vault';
import { socketClient } from '@/lib/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setVocabulary } from '@/store/vocabularies.slice';
import { Button, Text } from '@/components';
import { Container, Header, HeaderTitle, PermissionContainer, CameraContainer, ErrorBar } from './_styles';

export default function JoinChatScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const dispatch = useAppDispatch();
  const pin = useAppSelector((state) => state.auth.pin)!;
  const username = useAppSelector((state) => state.auth.username)!;
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: string) => {
      let chatId: string;
      let vocabulary: Vocabulary;
      let nonce: number | undefined;
      try {
        ({ chatId, vocabulary, nonce } = JSON.parse(data));
      } catch {
        throw new Error('invalid QR code');
      }
      if (nonce !== undefined && Date.now() - nonce > 30000) {
        throw new Error('QR code expired — ask for a new one');
      }
      const encryptedVocabulary = encryptVocabulary(vocabulary, pin);
      try {
        await api.fetch(`/chats/${chatId}/join`, {
          method: 'POST',
          body: JSON.stringify({ encryptedVocabulary }),
        });
      } catch {
        // already a member — still save vocabulary and navigate
      }
      return { chatId, vocabulary };
    },
    onSuccess: async ({ chatId, vocabulary }) => {
      await saveVocabularyLocally(username, chatId, vocabulary, pin);
      dispatch(setVocabulary({ chatId, vocabulary }));
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      socketClient.instance?.emit('join_chat', { chatId });
      router.replace(`/(app)/chat/${chatId}`);
    },
    onError: () => {
      setScanned(false);
    },
  });

  function handleScan({ data }: { data: string }) {
    if (scanned || isPending) return;
    setScanned(true);
    mutate(data);
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Container>
        <Header>
          <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
          <HeaderTitle>{`> scan QR`}</HeaderTitle>
        </Header>
        <PermissionContainer>
          <Text muted>camera access is required to scan QR codes</Text>
          <Button title="grant permission" onClick={requestPermission} />
        </PermissionContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
        <HeaderTitle>{`> scan QR`}</HeaderTitle>
      </Header>

      <CameraContainer>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
        />
        {error && (
          <ErrorBar>
            <Text error>{error instanceof Error ? error.message : 'invalid QR code'}</Text>
          </ErrorBar>
        )}
      </CameraContainer>
    </Container>
  );
}
