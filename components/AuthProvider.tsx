'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
        },
      },
    }, { ssr: true });
  }, []);

  return <>{children}</>;
}
