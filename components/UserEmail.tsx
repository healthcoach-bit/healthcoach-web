'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

interface UserEmailProps {
  className?: string;
}

export default function UserEmail({ className = '' }: UserEmailProps) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setEmail(user.signInDetails?.loginId || '');
    } catch (err) {
      // User not authenticated
    }
  };

  if (!email) return null;

  return (
    <span className={`text-gray-700 truncate ${className}`}>
      {email}
    </span>
  );
}
