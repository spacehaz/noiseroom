import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAppSelector } from '@/store/hooks';
import { Button, Text } from '@/components';
import { Container, Header, HeaderTitle, QrContainer, QrBorder, HintText } from './_styles';

const PADDING = 32 + 4; // QrContainer padding + QrBorder padding

export default function ShareVocabScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const vocabulary = useAppSelector((state) => state.vocabularies.byChat[chatId]);
  const [nonce, setNonce] = useState(() => Date.now());

  const qrSize = Dimensions.get('window').width - PADDING * 2;

  useEffect(() => {
    const interval = setInterval(() => setNonce(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Header>
        <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
        <HeaderTitle>{`> share vocab`}</HeaderTitle>
      </Header>

      <QrContainer>
        {vocabulary ? (
          <>
            <QrBorder>
              <QRCode
                value={JSON.stringify({ chatId, vocabulary, nonce })}
                size={qrSize}
                color="#39ff14"
                backgroundColor="#0a0a0a"
              />
            </QrBorder>
            <HintText>let a new member scan this{'\n'}to join and receive the cipher</HintText>
          </>
        ) : (
          <Text error>no vocabulary loaded for this chat</Text>
        )}
      </QrContainer>
    </Container>
  );
}
