// src/pages/ForgotPasswordPage.tsx

import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { account } from '@/lib/appwrite';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resetUrl = `${window.location.origin}/reset-password`;
      await account.createRecovery(email, resetUrl);
      setIsSubmitted(true);
      toast({ title: "Check Your Email", description: "A password reset link has been sent to your email address." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send reset link.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted ? "Please check your inbox for the reset link." : "Enter your email to receive a password reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center text-green-600">
                <p>Email sent successfully!</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" asChild className="mx-auto">
              <Link to="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;