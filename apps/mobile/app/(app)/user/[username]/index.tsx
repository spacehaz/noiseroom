import { FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Text } from '@/components';
import { Container, Header, HeaderTitle, ChatItem, ChatName, ChatMeta, Empty } from './_styles';

interface UserProfile {
  id: string;
  username: string;
  chats: { id: string; name: string; memberCount: number }[];
}

export default function UserScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => api.fetch<UserProfile>(`/users/${username}`),
  });

  return (
    <Container>
      <Header>
        <Button title="←" onClick={() => router.back()} variant="secondary" size="sm" />
        <HeaderTitle>{user ? `> @${user.username}` : '> ...'}</HeaderTitle>
      </Header>

      {isLoading ? (
        <Empty><Text muted>loading...</Text></Empty>
      ) : error ? (
        <Empty><Text error>{error instanceof Error ? error.message : 'failed to load'}</Text></Empty>
      ) : !user || user.chats.length === 0 ? (
        <Empty><Text muted>no chats</Text></Empty>
      ) : (
        <FlatList
          data={user.chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem onPress={() => router.push(`/(app)/chat/${item.id}`)}>
              <ChatName>{`> ${item.name}`}</ChatName>
              <ChatMeta>{item.memberCount} member{item.memberCount !== 1 ? 's' : ''}</ChatMeta>
            </ChatItem>
          )}
        />
      )}
    </Container>
  );
}
