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
        // Force refresh to get latest token
        const session = await fetchAuthSession({ forceRefresh: true });
        const token = session.tokens?.idToken?.toString();
        const userId = session.tokens?.idToken?.payload?.sub as string;

        if (token && userId) {
          const metadata = {
            user_metadata: {
              // Environment context - immediate user context
              _environmentContext: {
                user: {
                  id: userId,
                  authenticated: true,
                  tier: "standard"
                },
                app: {
                  name: "HealthCoach",
                  features: ["food_logging", "exercise_tracking", "health_metrics", "ai_coach"],
                  version: "1.0.0"
                },
                session: {
                  token_expires: new Date((session.tokens?.idToken?.payload?.exp as number) * 1000).toISOString(),
                  locale: "es-US"
                }
              },
              
              // Global authorization for API calls
              _authorizations_HealthCoachAPI4: {
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
              
              // Function-specific authorization details
              createFoodLog: {
                _appName: "HealthCoach API",
                _authorizationDetails: {
                  isActive: true,
                  type: "bearer",
                  in: "header",
                  name: "Authorization",
                  value: `Bearer ${token}`
                }
              },
              
              createExerciseLog: {
                _appName: "HealthCoach API",
                _authorizationDetails: {
                  isActive: true,
                  type: "bearer",
                  in: "header",
                  name: "Authorization",
                  value: `Bearer ${token}`
                }
              },
              
              createHealthMetric: {
                _appName: "HealthCoach API",
                _authorizationDetails: {
                  isActive: true,
                  type: "bearer",
                  in: "header",
                  name: "Authorization",
                  value: `Bearer ${token}`
                }
              },
              
              getFoodLogs: {
                _appName: "HealthCoach API",
                _authorizationDetails: {
                  isActive: true,
                  type: "bearer",
                  in: "header",
                  name: "Authorization",
                  value: `Bearer ${token}`
                }
              },
            },
          };
          
          window.wallavi.identify(metadata);
          console.log('✅ Wallavi authenticated - User ID:', userId);
          console.log('🔑 Token expires:', new Date((session.tokens?.idToken?.payload?.exp as number) * 1000).toLocaleTimeString());
          console.log('📦 Metadata sent to Wallavi:', JSON.stringify(metadata, null, 2));
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

    // Refresh token every 50 minutes (tokens expire after 60 minutes)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Refreshing Cognito token...');
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
