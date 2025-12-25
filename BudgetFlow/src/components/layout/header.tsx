'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Icons.logo className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">Flowqet</span>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center">
            {user && (
              <span className="text-sm mr-4 hidden sm:inline">
                Welcome, {user.displayName || user.email}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {user && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
