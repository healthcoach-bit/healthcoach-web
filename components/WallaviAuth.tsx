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
      
      console.log('🚪 Clearing Wallavi authentication on logout...');
      
      // Clear by identifying with empty metadata
      try {
        window.wallavi.identify({ user_metadata: {} });
        console.log('✅ Wallavi authentication cleared');
      } catch (error) {
        console.error('❌ Error clearing Wallavi auth:', error);
      }
    };
    
    // Wait for Wallavi to be initialized
    const setupWallaviAuth = async () => {
      // Prevent concurrent executions
      if (isSettingUp) {
        console.log('⏸️ Auth setup already in progress, skipping...');
        return;
      }
      // Check if Wallavi is loaded
      if (typeof window === 'undefined' || !window.wallavi) {
        console.log('⏳ Wallavi not loaded yet, skipping auth setup');
        return;
      }
      
      console.log('🎯 Wallavi detected, setting up authentication...');
      
      isSettingUp = true;

      try {
        // Get session WITHOUT forcing refresh to avoid triggering tokenRefresh events
        // Only force refresh on the periodic interval (every 50 minutes)
        const session = await fetchAuthSession({ forceRefresh: false });
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;

        if (token && userId) {
          const metadata = {
            user_metadata: {
              // Authorization for API calls - must match EXACT integration name in Wallavi (HealthCoachAPI9)
              _authorizations_HealthCoachAPI9: {
                type: 'bearer',
                in: 'header',
                name: 'Authorization',
                isActive: true,
                value: `Bearer ${token}`,
              },
              // Context Builder metadata - passed as query params
              // ⚠️ CRITICAL: DO NOT send timezone/offset info
              // Our system uses "display time" (local time + .000Z marker), NOT actual UTC
              // If we send timezone, Wallavi may apply conversions and break timestamp consistency
              _contextBuilder: {
                user_id: userId,
                // REMOVED: timezone and utc_offset - causes timestamp conversion issues
              },
              // Environment Context - injected into agent's context on every message
              // This has PRIORITY over general instructions
              _environmentContext: {
                timestamp_format_rules: `CRITICAL TIMESTAMP RULES - MUST FOLLOW EXACTLY:
1. When user mentions ANY time (breakfast, lunch, dinner, or specific hour), send it EXACTLY as local time
2. Format: YYYY-MM-DDTHH:MM:00.000Z
3. DO NOT convert to UTC - just use the time as mentioned
4. Examples:
   - User says "desayuno a las 7" → "2025-10-29T07:00:00.000Z" (NOT 13:00 or any other hour)
   - User says "comida a la 1 PM" → "2025-10-29T13:00:00.000Z" (NOT 19:00)
   - User says "cena a las 8 PM" → "2025-10-29T20:00:00.000Z" (NOT 02:00 next day)
5. If no time specified, use: breakfast=07:00, lunch=13:00, dinner=20:00, snack=current hour
6. The .000Z suffix is just a marker - it does NOT mean UTC time
7. NEVER add or subtract hours for timezone conversion
8. Send the hour EXACTLY as the user mentions it`,
              },
            },
          };
          
          console.log('🔐 Wallavi Auth - Sending identify with token for user:', userId);
          console.log('📋 Token (first 50 chars):', token.substring(0, 50));
          console.log('🏷️ Integration name: HealthCoachAPI9');
          
          window.wallavi.identify(metadata);
          
          console.log('✅ Wallavi identify() called successfully');
        } else {
          console.warn('⚠️ Wallavi Auth - Missing token or userId', { hasToken: !!token, hasUserId: !!userId });
        }
      } catch (error) {
        console.error('❌ Wallavi Auth Error:', error);
        console.log('⚠️ Wallavi authentication failed - user may need to login');
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

    // Listen for auth events (signIn, signOut)
    // NOTE: We DON'T listen to tokenRefresh to avoid infinite loops
    const hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      
      console.log('🔔 Auth event detected:', event);
      
      switch (event) {
        case 'signedIn':
          console.log('👤 User signed in, setting up Wallavi auth...');
          // Wait a bit for token to be available
          setTimeout(setupWallaviAuth, 1000);
          break;
        case 'signedOut':
          console.log('👋 User signed out, clearing Wallavi auth...');
          clearWallaviAuth();
          break;
        // REMOVED: tokenRefresh case - causes infinite loop with forceRefresh
        // Token refresh is handled by the 50-minute interval instead
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(checkInterval);
      clearInterval(refreshInterval);
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
