import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const checkAndNavigate = async () => {
      // Her segment değişiminde AsyncStorage'dan tekrar kontrol et
      const onboarded = await AsyncStorage.getItem('onboarded');
      const currentlyOnboarded = onboarded === 'true';

      if (currentlyOnboarded !== isOnboarded) {
        setIsOnboarded(currentlyOnboarded);
        return;
      }

      const inOnboarding = segments[0] === 'onboarding';

      if (!isOnboarded && !inOnboarding) {
        router.replace('/onboarding');
      } else if (isOnboarded && inOnboarding) {
        router.replace('/(tabs)');
      }
    };

    checkAndNavigate();
  }, [isOnboarded, isLoading, segments, router]);

  const checkOnboarding = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('onboarded');
      setIsOnboarded(onboarded === 'true');
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#03045E' }}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}