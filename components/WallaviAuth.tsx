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
      // Check if Wallavi is loaded
      if (typeof window === 'undefined' || !window.wallavi) {
        console.log('⏳ Wallavi not loaded yet, skipping auth setup');
        return;
      }
      
      console.log('🎯 Wallavi detected, setting up authentication...');

      try {
        // Force refresh to get latest token
        const session = await fetchAuthSession({ forceRefresh: true });
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;

        if (token && userId) {
          const metadata = {
            user_metadata: {
              // Authorization for API calls - must match EXACT integration name in Wallavi (HealthCoachAPI8)
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

    // Listen for auth events (signIn, signOut, etc.)
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
        case 'tokenRefresh':
          console.log('🔄 Token refreshed, updating Wallavi auth...');
          setupWallaviAuth();
          break;
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
