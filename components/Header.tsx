'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const { user, status, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mr-8">
            roulspy
          </Link>
          <nav className="flex items-center">
            <Link 
              href="/" 
              className={`px-5 py-4 text-sm font-medium hover:text-primary ${
                pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-foreground/80 border-b-2 border-transparent'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/configurations" 
              className={`px-5 py-4 text-sm font-medium hover:text-primary ${
                pathname === '/configurations' ? 'text-primary border-b-2 border-primary' : 'text-foreground/80 border-b-2 border-transparent'
              }`}
            >
              Configurations
            </Link>
            <Link 
              href="/pricing" 
              className={`px-5 py-4 text-sm font-medium hover:text-primary ${
                pathname === '/pricing' ? 'text-primary border-b-2 border-primary' : 'text-foreground/80 border-b-2 border-transparent'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/blog" 
              className={`px-5 py-4 text-sm font-medium hover:text-primary ${
                pathname === '/blog' ? 'text-primary border-b-2 border-primary' : 'text-foreground/80 border-b-2 border-transparent'
              }`}
            >
              Blog
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          
          <div className="flex items-center space-x-2">
            {mounted && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="mr-2 h-8 w-8 p-0"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            
            {status === 'loading' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : status === 'authenticated' && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[150px] truncate">{user.name || user.email || 'Account'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/configurations')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>My Configurations</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => router.push('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}