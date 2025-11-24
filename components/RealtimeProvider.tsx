'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { foodLogKeys } from '@/hooks/useFoodLogs';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

/**
 * RealtimeProvider
 *
 * Frontend WebSocket client that listens for backend realtime events
 * and keeps React Query caches in sync.
 *
 * Features:
 * - Authenticates with Cognito JWT token
 * - Auto-reconnection on disconnect
 * - Handles foodLog, exerciseLog, and healthMetric events
 *
 * Expected backend setup (API Gateway WebSocket):
 * - Environment: NEXT_PUBLIC_WS_URL=wss://your-ws-endpoint
 * - Auth: JWT token passed as query param ?token=xxx
 * - Message format:
 *   { "type": "foodLogCreated" | "exerciseLogCreated" | ..., "data": any }
 */
export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    // If no WS URL configured, do nothing
    if (!wsUrl) {
      console.warn('RealtimeProvider: NEXT_PUBLIC_WS_URL not configured');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const connect = async () => {
      try {
        // Get Cognito JWT token
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          console.warn('RealtimeProvider: No auth token available');
          return;
        }

        // Connect with token as query param
        const urlWithAuth = `${wsUrl}?token=${encodeURIComponent(token)}`;
        const socket = new WebSocket(urlWithAuth);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);
          console.log('✅ WebSocket connected');
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;

          try {
            const message = JSON.parse(event.data as string) as {
              type: string;
              data: any;
            };

            switch (message.type) {
              // Food logs
              case 'foodLogCreated':
              case 'foodLogUpdated':
              case 'foodLogDeleted':
                queryClient.invalidateQueries({ queryKey: foodLogKeys.lists() });
                console.log(`🔄 Refreshed food logs (${message.type})`);
                break;

              // Exercise logs
              case 'exerciseLogCreated':
              case 'exerciseLogUpdated':
              case 'exerciseLogDeleted':
                queryClient.invalidateQueries({ queryKey: ['exerciseLogs'] });
                console.log(`🔄 Refreshed exercise logs (${message.type})`);
                break;

              // Health metrics
              case 'healthMetricCreated':
              case 'healthMetricUpdated':
              case 'healthMetricDeleted':
                queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
                console.log(`🔄 Refreshed health metrics (${message.type})`);
                break;

              // Health profile
              case 'healthProfileUpdated':
                queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
                console.log(`🔄 Refreshed health profile`);
                break;

              default:
                // Unknown event type - ignore
                break;
            }
          } catch (error) {
            console.error('RealtimeProvider: failed to parse WS message', error);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
          if (!isMounted) return;

          setIsConnected(false);
          wsRef.current = null;
          console.log('🔌 WebSocket disconnected');

          // Auto-reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              console.log('🔄 Attempting to reconnect...');
              connect();
            }
          }, 5000);
        };
      } catch (error) {
        console.error('RealtimeProvider: Failed to connect', error);
      }
    };

    // Initial connection
    connect();

    return () => {
      isMounted = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return <>{children}</>;
}
