'use client';

import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

/**
 * WallaviAuth Component
 * 
 * Handles automatic authentication for Wallavi chat widget.
 * Fetches Cognito JWT token and passes it to Wallavi for API authorization.
 */
export default function WallaviAuth() {
  useEffect(() => {
    let isSettingUp = false; // Prevent concurrent executions
    
    // Clear Wallavi authentication
    const clearWallaviAuth = () => {
      if (typeof window === 'undefined' || !window.wallavi) {
        return;
      }
      
      // Clear by identifying with empty metadata
      try {
        window.wallavi.identify({ user_metadata: {} });
      } catch (error) {
        console.error('❌ Error clearing Wallavi auth:', error);
      }
    };
    
    // Wait for Wallavi to be initialized
    const setupWallaviAuth = async (forceRefresh = false) => {
      // Prevent concurrent executions
      if (isSettingUp) {
        return;
      }
      // Check if Wallavi is loaded
      if (typeof window === 'undefined' || !window.wallavi) {
        return;
      }
      
      
      isSettingUp = true;

      try {
        // Force refresh when called from interval, otherwise check if token is about to expire
        const session = await fetchAuthSession({ forceRefresh });
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;
        const tokenExp = session.tokens?.idToken?.payload?.exp as number;
        
        // Check if token is expired or will expire in the next 5 minutes
        if (tokenExp) {
          const expiresIn = tokenExp - Math.floor(Date.now() / 1000);
          // console.log(`⏱️ Token expires in ${Math.floor(expiresIn / 60)} minutes`);
          
          if (expiresIn < 300) { // Less than 5 minutes
            console.log('🔄 Token expiring soon, forcing refresh...');
            const refreshedSession = await fetchAuthSession({ forceRefresh: true });
            const refreshedToken = refreshedSession.tokens?.idToken?.toString();
            if (refreshedToken) {
              console.log('✅ Token refreshed successfully');
              return setupWallaviAuth(false); // Retry with refreshed token
            }
          }
        }

        if (token && userId) {
          const metadata = {
            user_metadata: {
              // Authorization for API calls - must match EXACT integration name in Wallavi (HealthCoachAPI9)
              _authorizations_HealthCoachAPI10: {
                type: 'bearer',
                in: 'header',
                name: 'Authorization',
                isActive: true,
                value: `Bearer ${token}`,
              },
              // Context Builder metadata
              _contextBuilder: {
                user_id: userId,
              },
              // Environment Context - injected into agent's context
              _environmentContext: {
                timestamp_rules: `CRITICAL: When user mentions time (breakfast, lunch, dinner, specific hour):
- Use time EXACTLY as mentioned in format YYYY-MM-DDTHH:MM:00.000Z
- "desayuno a las 7" → "2025-10-29T07:00:00.000Z" (NOT 13:00)
- "comida a la 1 PM" → "2025-10-29T13:00:00.000Z" (NOT 19:00)
- "cena a las 8 PM" → "2025-10-29T20:00:00.000Z" (NOT 02:00)
- Default times if not specified: breakfast=07:00, lunch=13:00, dinner=20:00
- NEVER convert timezone. The .000Z is just a marker.`,
              },
            },
          };
          
          window.wallavi.identify(metadata);
          
        } else {
          console.warn('⚠️ Wallavi Auth - Missing token or userId', { hasToken: !!token, hasUserId: !!userId });
        }
      } catch (error) {
        console.error('❌ Wallavi Auth Error:', error);
      } finally {
        isSettingUp = false;
      }
    };

    // Try to setup auth immediately
    setupWallaviAuth();

    // Multiple retries with increasing delays to handle:
    // 1. Wallavi widget loading
    // 2. Initial login token availability
    const timeouts = [
      setTimeout(setupWallaviAuth, 1000),   // 1 second
      setTimeout(setupWallaviAuth, 2000),   // 2 seconds
      setTimeout(setupWallaviAuth, 4000),   // 4 seconds
      setTimeout(setupWallaviAuth, 8000),   // 8 seconds (for slow initial login)
    ];

    // Refresh token every 50 minutes (tokens expire after 60 minutes)
    const refreshInterval = setInterval(() => {
      setupWallaviAuth(true); // Force refresh on interval
    }, 50 * 60 * 1000); // 50 minutes

    // Check token expiration every 5 minutes
    const expirationCheckInterval = setInterval(() => {
      // console.log('🔍 Checking token expiration...');
      setupWallaviAuth(false); // Will auto-refresh if token is expiring soon
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for auth events (signIn, signOut)
    // NOTE: We DON'T listen to tokenRefresh to avoid infinite loops
    const hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      
      switch (event) {
        case 'signedIn':
          // Wait a bit for token to be available
          setTimeout(setupWallaviAuth, 1000);
          break;
        case 'signedOut':
          clearWallaviAuth();
          break;
        // REMOVED: tokenRefresh case - causes infinite loop with forceRefresh
        // Token refresh is handled by the 50-minute interval instead
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(refreshInterval);
      clearInterval(expirationCheckInterval);
      hubUnsubscribe(); // Unsubscribe from Hub events
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
