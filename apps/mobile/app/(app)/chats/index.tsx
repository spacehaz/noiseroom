import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { Title, Text, Button } from '@/components';
import {
  Container,
  Header,
  ChatItem,
  ChatName,
  MemberCount,
  ChatMeta,
  NoVocab,
  Empty,
  Footer,
} from './_styles';

interface Chat {
  id: string;
  name: string;
  members: { user: { id: string; username: string } }[];
}

export default function ChatsScreen() {
  const { bottom } = useSafeAreaInsets();
  const username = useAppSelector((state) => state.auth.username)!;
  const vocabularies = useAppSelector((state) => state.vocabularies.byChat);

  const {
    data: chats = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.fetch<Chat[]>('/chats'),
  });

  return (
    <Container>
      <Header>
        <Title size="lg">// chats</Title>
        <Button
          title={`@${username}`}
          onClick={() => router.push('/(app)/profile')}
          variant="secondary"
          size="sm"
        />
        <Button
          title="scan"
          onClick={() => router.push('/(app)/join-chat')}
          variant="secondary"
          size="sm"
        />
      </Header>
      {isLoading ? (
        <Empty>
          <Text muted>loading...</Text>
        </Empty>
      ) : error ? (
        <Empty>
          <Text error>{error instanceof Error ? error.message : 'failed to load'}</Text>
        </Empty>
      ) : chats.length === 0 ? (
        <Empty>
          <Text muted>no chats yet</Text>
        </Empty>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem onPress={() => router.push(`/(app)/chat/${item.id}`)}>
              <ChatName>{`> ${item.name}`}</ChatName>
              <ChatMeta>
                <MemberCount>
                  {item.members.length} member{item.members.length !== 1 ? 's' : ''}
                </MemberCount>
                {!vocabularies[item.id] && <NoVocab>[no vocab]</NoVocab>}
              </ChatMeta>
            </ChatItem>
          )}
        />
      )}
      <Footer style={{ paddingBottom: bottom + 16 }}>
        <Button title="create chat" onClick={() => router.push('/(app)/create-chat')} />
        <Button title="search" onClick={() => router.push('/(app)/search')} variant="secondary" />
      </Footer>
    </Container>
  );
}
