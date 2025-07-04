import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Github, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail } from '@/shared/utils/validation';
import { VALIDATION } from '@/shared/constants';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if we're on the reset password page
  const isResetPassword = location.pathname === '/auth/reset-password';

  // Clear error and success messages when switching tabs or modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [isLogin, isForgotPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isResetPassword) {
        // Validate password confirmation
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        const { error } = await updatePassword(newPassword);
        if (error) {
          setError((error as Error).message);
          toast({
            title: "Error",
            description: (error as Error).message,
            variant: "destructive"
          });
        } else {
          setSuccess('Password updated successfully!');
          toast({
            title: "Success",
            description: "Password updated successfully!"
          });
          setTimeout(() => navigate('/auth'), 2000);
        }
      } else if (isForgotPassword) {
        // Handle forgot password
        if (!email) {
          setError('Please enter your email address');
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          setError((error as Error).message);
          toast({
            title: "Error",
            description: (error as Error).message,
            variant: "destructive"
          });
        } else {
          setSuccess('Password reset instructions sent to your email!');
          toast({
            title: "Success",
            description: "Password reset instructions sent to your email!"
          });
          setTimeout(() => setIsForgotPassword(false), 3000);
        }
      } else {
        // Handle login/signup
        if (!email || !password) {
          setError('Please fill in all required fields');
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        if (!isLogin && password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
          setError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
          return;
        }

        const { error } = isLogin
          ? await signIn(email, password)
          : await signUp(email, password);

        if (error) {
          setError((error as Error).message);
          toast({
            title: "Error",
            description: (error as Error).message,
            variant: "destructive"
          });
        } else {
          if (isLogin) {
            toast({
              title: "Success",
              description: "Signed in successfully!"
            });
            // Redirect to auth callback to handle onboarding checks
            navigate('/auth/callback');
          } else {
            setSuccess('Please check your email to verify your account!');
            toast({
              title: "Success",
              description: "Please check your email to verify your account!"
            });
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setError(null);
    setSuccess(null);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError((error as Error).message);
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isResetPassword) {
    return (
      <div className="layout-container items-center justify-center bg-green-glass">
        <div className="w-full max-w-md p-8 space-y-8 workspace-card m-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pl-10 bg-black/20 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 bg-black/20 border-white/10"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/20 border-green-500/50">
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container items-center justify-center bg-green-glass">
      <div className="w-full max-w-md space-y-8 workspace-card p-8 m-auto">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Pitch Perfect</h1>
          </div>
          <p className="text-gray-400">Sign in to your account or create a new one</p>
        </div>

        {!isForgotPassword && (
          <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="button"
                variant="link"
                className="text-sm text-gray-400 hover:text-white"
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full workspace-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="workspace-button-secondary"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="workspace-button-secondary"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-black/20 border-white/10 hover:bg-black/30"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-black/20 border-white/10 hover:bg-black/30"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
              </div>
            </form>
          </TabsContent>
          </Tabs>
        )}

        {/* Forgot Password Form */}
        {isForgotPassword && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 workspace-button-secondary"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1 workspace-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}