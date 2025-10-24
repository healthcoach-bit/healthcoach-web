import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle authentication check
 * Prevents premature redirects on page refresh by waiting for auth check to complete
 */
export function useAuth() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    } catch (err) {
      setIsCheckingAuth(false);
      router.push('/login');
    }
  };

  return { isCheckingAuth, isAuthenticated };
}
