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
        return;
      }

      try {
        // Force refresh to get latest token
        const session = await fetchAuthSession({ forceRefresh: true });
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;

        if (token && userId) {
          const metadata = {
            user_metadata: {
              // Authorization for API calls - must match EXACT integration name in Wallavi (HealthCoachAPI3)
              _authorizations_HealthCoachAPI8: {
                type: 'bearer',
                in: 'header',
                name: 'Authorization',
                isActive: true,
                value: `Bearer ${token}`,
              },
              // Context Builder metadata - passed as query params
              _contextBuilder: {
                user_id: userId,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                utc_offset: new Date().getTimezoneOffset() / -60,
              },
            },
          };
          
          window.wallavi.identify(metadata);
        }
      } catch (error) {
        // Silent fail - Wallavi auth is optional
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

    // Refresh token every 50 minutes (tokens expire after 60 minutes)
    const refreshInterval = setInterval(() => {
      setupWallaviAuth();
    }, 50 * 60 * 1000); // 50 minutes

    return () => {
      clearTimeout(timeoutId);
      clearInterval(checkInterval);
      clearInterval(refreshInterval);
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
