import { useRouter } from 'expo-router';
import RegisterScreen from './RegisterScreen';

export default function RegisterPage() {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push('/login/index');
  };

  return <RegisterScreen onNavigateToLogin={handleNavigateToLogin} />;
}
