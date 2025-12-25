'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Hotel } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
         toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Please verify your email before logging in.',
        });
        await auth.signOut();
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Hotel className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-center">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:gap-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-9 sm:h-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <Icons.eyeOff /> : <Icons.eye />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-2 sm:pt-4">
            <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="mt-4 text-center text-xs sm:text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline text-primary hover:text-primary/80">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
