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
    <div className="w-full">
      {/* Logo positioned at left */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/" className="block">
          <img 
            src="/images/logo.png" 
            alt="Roulette Simulator Logo" 
            className="h-[50px] w-[50px]" 
            style={{ height: '50px', width: '50px' }}
          />
        </Link>
      </div>
      
      {/* Authentication controls at top right */}
      <div className="fixed top-4 right-6 z-50 flex items-center">
        {mounted && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="mr-2 h-10 w-10 p-0 rounded bg-muted"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
        
        {status === 'loading' ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : status === 'authenticated' && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center h-10 px-4 rounded bg-muted">
                <User className="h-4 w-4 mr-2" />
                <span className="max-w-[100px] truncate">{user.name || user.email || 'Account'}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
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
          <Button variant="outline" className="h-10 rounded bg-muted" onClick={() => router.push('/auth')}>
            Sign In
          </Button>
        )}
      </div>
      
      {/* Spacer to push content below the fixed elements */}
      <div className="h-16"></div>
    </div>
  );
}