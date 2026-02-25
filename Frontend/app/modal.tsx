import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/'); // Redirect to home screen
  }, [router]);
  return null;
}
