import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Determine the page to redirect to after login.
  // Defaults to '/dashboard' if no specific page was requested.
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // --- FIX: Capture the returned user object from the login function ---
      // The `login` function in the auth store now returns the user data on success.
      const loggedInUser = await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to MamaSaheli!",
      });

      // --- START: MODIFIED REDIRECTION LOGIC ---

      // 1. Check if the logged-in user has the 'doctor' role (stored in Appwrite labels).
      // This line is now valid because `loggedInUser` is a user object, not `void`.
      const isDoctor = loggedInUser?.labels?.includes('doctor');

      // 2. Determine the default destination based on the user's role.
      const defaultRedirect = isDoctor ? '/doctor' : '/dashboard';

      // 3. Decide the final redirection path.
      // If the user was originally trying to go to the generic '/dashboard',
      // we override it with their role-specific dashboard.
      // Otherwise, we send them to the specific page they were trying to access (e.g., /medicaldocs).
      const finalRedirectPath = from === '/dashboard' ? defaultRedirect : from;

      navigate(finalRedirectPath, { replace: true });

      // --- END: MODIFIED REDIRECTION LOGIC ---

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center">
              <Heart className="h-10 w-10 text-mamasaheli-accent" />
              <span className="ml-2 text-2xl font-bold text-mamasaheli-primary">MamaSaheli</span>
            </div>
          </div>
          
          <Card className="shadow-lg border-mamasaheli-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Log in to your MamaSaheli account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hello@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-mamasaheli-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-mamasaheli-primary hover:bg-mamasaheli-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-mamasaheli-primary font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </div>
              <div className="text-center text-xs text-gray-500">
                By logging in, you agree to our{' '}
                <Link to="/terms" className="underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline">Privacy Policy</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;