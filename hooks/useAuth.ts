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
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      // Only redirect if we're sure there's no valid session
      console.log('Auth check failed, redirecting to login');
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return { isCheckingAuth, isAuthenticated };
}
