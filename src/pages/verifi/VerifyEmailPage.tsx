// src/pages/VerifyEmailPage.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { account } from '@/lib/appwrite';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setMessage('Invalid verification link. Please try again.');
      return;
    }

    const verify = async () => {
      try {
        await account.updateVerification(userId, secret);
        setStatus('success');
        setMessage('Your email has been successfully verified! Redirecting you to the dashboard...');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-mamasaheli-primary" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <AlertTriangle className="h-12 w-12 text-red-500" />}
            <p className="text-gray-600">{message}</p>
            {status !== 'loading' && (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VerifyEmailPage;