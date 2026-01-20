import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FashionProvider } from '@/context/FashionContext';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuth();

  console.log('RootLayoutNav rendering:', { isSignedIn, isLoading });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <FashionProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          {!isSignedIn ? (
            <>
              <Stack.Screen name="login/index" />
              <Stack.Screen name="register/index" />
            </>
          ) : (
            <>
              <Stack.Screen name="fashion" />
              <Stack.Screen name="fashion/productDetails" />
              <Stack.Screen name="fashion/chat" />
              <Stack.Screen name="fashion/checkout" />
            </>
          )}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </FashionProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FashionProvider>
        <RootLayoutNav />
      </FashionProvider>
    </AuthProvider>
  );
}


