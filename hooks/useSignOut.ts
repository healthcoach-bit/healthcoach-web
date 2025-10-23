import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'aws-amplify/auth';

/**
 * Custom hook to handle sign out with proper cleanup
 * Clears React Query cache and Zustand localStorage
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    try {
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear Zustand persisted state (localStorage)
      localStorage.removeItem('healthcoach-ui-storage');
      
      // Sign out from Cognito
      await signOut();
      
      // Redirect to home
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  return handleSignOut;
}
