import { useRouter } from 'expo-router';
import LoginScreen from './LoginScreen';

export default function LoginPage() {
  const router = useRouter();
  
  const handleNavigateToRegister = () => {
    router.push('/register/index');
  };

  return <LoginScreen onNavigateToRegister={handleNavigateToRegister} />;
}
