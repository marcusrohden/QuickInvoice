'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await signIn(email, password);
      
      if (success) {
        router.push('/');
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>Enter your email and password to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-300">{error}</span>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a
            href="#register"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}