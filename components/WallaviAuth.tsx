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

    return () => {
      timeouts.forEach(clearTimeout);
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
