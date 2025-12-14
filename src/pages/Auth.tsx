import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/apiConfig';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

type AuthView = 'auth' | 'forgot-password' | 'reset-password' | 'verify-success' | 'verify-error' | 'verification-pending';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<AuthView>('auth');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');
  
  // Handle URL query params for verification and reset
  useEffect(() => {
    const action = searchParams.get('action');
    const token = searchParams.get('token');

    if (action === 'verify' && token) {
      handleEmailVerification(token);
    } else if (action === 'reset' && token) {
      setView('reset-password');
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if already logged in (only when not processing verification/reset)
    const action = searchParams.get('action');
    if (!action) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, searchParams]);

  const handleEmailVerification = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setVerifyMessage(data.message || 'Email verified successfully!');
        setView('verify-success');
        toast.success('Email verified! You can now log in.');
      } else {
        setVerifyMessage(data.message || 'Failed to verify email');
        setView('verify-error');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      setVerifyMessage('Connection error. Please try again.');
      setView('verify-error');
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Welcome back!');
        navigate('/', { replace: true });
      } else if (data.error === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email);
        setView('verification-pending');
      } else {
        toast.error(data.message || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: password,
          full_name: formData.get('full_name'),
          organization: formData.get('organization'),
          baseUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUnverifiedEmail(formData.get('email') as string);
        setView('verification-pending');
        toast.success('Account created! Please check your email to verify.');
      } else {
        toast.error(data.message || 'Signup failed. Email may already be in use.');
      }
    } catch (error) {
      toast.error('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          baseUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset link sent! Check your email.');
        setView('auth');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const token = searchParams.get('token');
    
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successfully! You can now log in.');
        setView('auth');
        // Clear URL params
        navigate('/auth', { replace: true });
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: unverifiedEmail,
          baseUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verification pending view
  if (view === 'verification-pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => setView('auth')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to <span className="font-medium text-foreground">{unverifiedEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please check your email and click the verification link to activate your account.
                  The link will expire in 24 hours.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification success view
  if (view === 'verify-success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>{verifyMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => {
                  setView('auth');
                  navigate('/auth', { replace: true });
                }}
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification error view
  if (view === 'verify-error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>{verifyMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  setView('auth');
                  navigate('/auth', { replace: true });
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (view === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => setView('auth')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="researcher@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset password view
  if (view === 'reset-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    name="confirm_password"
                    type="password"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main auth view (login/signup)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Summit2Shore Data Portal</CardTitle>
            <CardDescription className="text-center">
              Access environmental monitoring data and manage your API credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="researcher@university.edu"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button 
                        type="button"
                        variant="link" 
                        className="px-0 h-auto text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setView('forgot-password')}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="full_name"
                      placeholder="Dr. Jane Smith"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="researcher@university.edu"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-organization">Organization (Optional)</Label>
                    <Input
                      id="signup-organization"
                      name="organization"
                      placeholder="University of Vermont"
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      name="confirm_password"
                      type="password"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By signing up, you agree to use this data for research purposes only
        </p>
      </div>
    </div>
  );
}
