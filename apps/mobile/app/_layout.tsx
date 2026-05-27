import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { ThemeProvider } from 'styled-components/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme';
import { store } from '@/store';
import { setAuth } from '@/store/auth.slice';
import { loadToken, decodeToken } from '@/lib/token';

const queryClient = new QueryClient();

function AppProviders() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadToken().then((token) => {
      if (token) {
        const { username } = decodeToken(token);
        store.dispatch(setAuth({ token, username }));
        // PIN is not persisted — user must re-enter each session
        // Routing to enter-pin is handled by (app)/_layout.tsx
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppProviders />
      </QueryClientProvider>
    </Provider>
  );
}
