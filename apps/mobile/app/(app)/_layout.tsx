import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAppSelector } from '@/store/hooks';

export default function AppLayout() {
  const token = useAppSelector((state) => state.auth.token);
  const pin = useAppSelector((state) => state.auth.pin);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    } else if (!pin) {
      router.replace('/(auth)/enter-pin');
    }
  }, [token, pin]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
