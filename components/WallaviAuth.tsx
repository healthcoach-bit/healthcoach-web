'use client';

import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * WallaviAuth Component
 * 
 * Handles automatic authentication for Wallavi chat widget.
 * Fetches Cognito JWT token and passes it to Wallavi for API authorization.
 */
export default function WallaviAuth() {
  useEffect(() => {
    // Wait for Wallavi to be initialized
    const setupWallaviAuth = async () => {
      // Check if Wallavi is loaded
      if (typeof window === 'undefined' || !window.wallavi) {
        console.log('⏳ Waiting for Wallavi to load...');
        return;
      }

      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;

        if (token && userId) {
          window.wallavi.identify({
            user_metadata: {
              // Authorization for API calls
              _authorizations_HealthCoachAPI: {
                type: 'bearer',
                in: 'header',
                name: 'Authorization',
                isActive: true,
                value: `Bearer ${token}`,
              },
              // Context Builder metadata - passed as query params
              _contextBuilder: {
                user_id: userId,
              },
            },
          });
          console.log('✅ Wallavi authenticated - User ID:', userId);
        } else {
          console.log('⚠️ No auth session found');
        }
      } catch (error) {
        console.error('⚠️ Wallavi auth error:', error);
      }
    };

    // Try to setup auth immediately
    setupWallaviAuth();

    // Also try after a delay (in case Wallavi loads late)
    const timeoutId = setTimeout(setupWallaviAuth, 2000);

    // Listen for Wallavi load event if available
    const checkInterval = setInterval(() => {
      if (window.wallavi) {
        setupWallaviAuth();
        clearInterval(checkInterval);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(checkInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Type declaration for window.wallavi
declare global {
  interface Window {
    wallavi: any;
  }
}
