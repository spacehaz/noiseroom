import { useState, useEffect, useRef } from 'react';
import { FlatList, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Text } from '@/components';
import { Container, Header, SearchInput, UserItem, UserName, Empty } from './_styles';

interface User {
  id: string;
  username: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: users = [], isFetching } = useQuery({
    queryKey: ['users', debouncedQuery],
    queryFn: () => api.fetch<User[]>(`/users?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <Container>
      <Header>
        <Button title="←" onClick={() => router.back()} variant="secondary" />
        <SearchInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="search username..."
          placeholderTextColor="#444444"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </Header>

      {debouncedQuery.length === 0 ? (
        <Empty><Text muted>type to search users</Text></Empty>
      ) : isFetching ? (
        <Empty><Text muted>searching...</Text></Empty>
      ) : users.length === 0 ? (
        <Empty><Text muted>no users found</Text></Empty>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserItem onPress={() => router.push(`/(app)/user/${item.username}`)}>
              <UserName>{`> @${item.username}`}</UserName>
            </UserItem>
          )}
        />
      )}
    </Container>
  );
}
