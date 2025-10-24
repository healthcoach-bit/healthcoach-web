'use client';

import { useState, useEffect } from 'react';
import { signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ErrorAlert from '@/components/ErrorAlert';
import AuthSkeleton from '@/components/AuthSkeleton';
import FormInput from '@/components/FormInput';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await getCurrentUser();
      // User is already signed in, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // User is not signed in, stay on signup page
      setCheckingAuth(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setNeedsConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <AuthSkeleton />;
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.verifyEmail}</h1>
            <p className="text-gray-700 mt-2">
              {t.verificationSent} {email}
            </p>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleConfirm} className="space-y-5 sm:space-y-6">
            <FormInput
              id="code"
              type="text"
              label={t.verificationCode}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {loading ? t.verifying : t.verifyEmailBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.createAccount}</h1>
          <p className="text-gray-700 mt-2">{t.startJourney}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5 sm:space-y-6">
          <FormInput
            id="email"
            type="email"
            label={t.email}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <FormInput
            id="password"
            type="password"
            label={t.password}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helperText={t.passwordRequirements}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          >
            {loading ? t.creatingAccount : t.signUp}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          {t.haveAccount}{' '}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            {t.signInLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
