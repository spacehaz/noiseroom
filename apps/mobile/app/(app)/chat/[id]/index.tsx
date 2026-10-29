import { useEffect, useState, useRef } from 'react';
import { FlatList, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { encrypt, decrypt } from '@noiseroom/cipher';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { useAppSelector } from '@/store/hooks';
import { Button, Text } from '@/components';
import { rng } from '@/lib/random';
import {
  Container,
  Header,
  HeaderTitle,
  MessageBubble,
  MessageSender,
  MessageText,
  InputRow,
  MessageInput,
  Empty,
  MessageList
} from './_styles';

interface Message {
  id: string;
  ciphertext: string;
  createdAt: string;
  sender: { id: string; username: string };
}

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const token = useAppSelector((state) => state.auth.token)!;
  const userId = useAppSelector((state) => state.auth.username);
  const vocabulary = useAppSelector((state) => state.vocabularies.byChat[chatId]);

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: initialMessages = [], isLoading, error } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.fetch<Message[]>(`/chats/${chatId}/messages?order=asc&limit=50`),
  });

  useEffect(() => {
    const socket = socketClient.connect(token);

    socket.on('new_message', (message: Message) => {
      setLiveMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('new_message');
    };
  }, [token]);

  function sendMessage() {
    if (!text.trim() || !vocabulary) return;

    const ciphertext = encrypt(text.trim(), vocabulary, rng);
    socketClient.instance?.emit('send_message', { chatId, ciphertext });
    setText('');
  }

  function decryptMessage(ciphertext: string): string {
    if (!vocabulary) return ciphertext;
    try {
      return decrypt(ciphertext, vocabulary);
    } catch {
      return ciphertext;
    }
  }

  const allMessages = [...initialMessages, ...liveMessages];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Container>
        <Header>
          <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
          <HeaderTitle>{`> chat`}</HeaderTitle>
          {vocabulary
            ? <Button title="share" onClick={() => router.push(`/(app)/chat/${chatId}/share-vocab`)} variant="secondary" size="sm" />
            : <Button title="scan" onClick={() => router.push('/(app)/join-chat')} variant="secondary" size="sm" />
          }
        </Header>

        {isLoading ? (
          <Empty><Text muted>loading...</Text></Empty>
        ) : error ? (
          <Empty><Text error>{error instanceof Error ? error.message : 'failed to load'}</Text></Empty>
        ) : allMessages.length === 0 ? (
          <Empty><Text muted>no messages yet</Text></Empty>
        ) : (
          <MessageList>
            <FlatList
              ref={flatListRef}
              data={allMessages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              renderItem={({ item }) => {
                const own = item.sender.username === userId;
                return (
                  <MessageBubble own={own}>
                    {!own && <MessageSender>{item.sender.username}</MessageSender>}
                    <MessageText>{decryptMessage(item.ciphertext)}</MessageText>
                  </MessageBubble>
                );
              }}
            />
          </MessageList>
        )}

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#0a0a0a' }}>
          <InputRow>
            <MessageInput
              value={text}
              onChangeText={setText}
              placeholder="type a message..."
              placeholderTextColor="#444444"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!!vocabulary}
            />
            <Button title="send" onClick={sendMessage} disabled={!text.trim() || !vocabulary} />
          </InputRow>
        </SafeAreaView>
      </Container>
    </KeyboardAvoidingView>
  );
}
