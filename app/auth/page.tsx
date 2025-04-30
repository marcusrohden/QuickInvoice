'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Separator } from '@/components/ui/separator';

export default function AuthPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  // Redirect to home page if already logged in
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/');
    }
  }, [user, status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login and Registration Forms Column */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div id="login-section">
            <LoginForm />
          </div>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">Or</span>
            </div>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      {/* Hero Image/Content Column */}
      <div className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Roulette Simulator SaaS</h1>
          <p className="text-xl mb-8">
            Analyze house advantage in roulette games with multiple prize configurations
            and detailed statistical analysis. Perfect for casino operators and game designers.
          </p>
          <ul className="space-y-4 mb-10">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Advanced simulation modes with up to 10,000 spins</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Custom prize configurations with multiple prize values</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Comprehensive statistical reporting and visualization</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save and load your favorite game configurations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}