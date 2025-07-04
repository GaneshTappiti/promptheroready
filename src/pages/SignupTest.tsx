import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testSignupFlow, testRandomSignup } from '@/utils/signupTest';
import { isValidEmail } from '@/shared/utils/validation';

export default function SignupTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const testResult = await testSignupFlow(email, password);
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'Test failed with unexpected error',
        error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const testResult = await testRandomSignup();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'Random test failed with unexpected error',
        error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailValidation = () => {
    const isValid = isValidEmail(email);
    setResult({
      success: isValid,
      message: `Email validation: ${isValid ? 'VALID' : 'INVALID'}`,
      data: { email, isValid }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Signup Testing Tool</CardTitle>
            <CardDescription className="text-gray-300">
              Test the signup functionality and debug issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Manual Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Manual Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email" className="text-white">Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-password" className="text-white">Password</Label>
                  <Input
                    id="test-password"
                    type="password"
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleTestSignup}
                  disabled={loading || !email || !password}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Testing...' : 'Test Signup'}
                </Button>
                <Button 
                  onClick={handleEmailValidation}
                  disabled={!email}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Validate Email
                </Button>
              </div>
            </div>

            {/* Random Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Random Test</h3>
              <Button 
                onClick={handleRandomSignup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Testing...' : 'Test with Random Email'}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Test Results</h3>
                <Alert className={result.success ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}>
                  <AlertDescription className={result.success ? "text-green-400" : "text-red-400"}>
                    <div className="space-y-2">
                      <div><strong>Status:</strong> {result.success ? 'SUCCESS' : 'FAILED'}</div>
                      <div><strong>Message:</strong> {result.message}</div>
                      {result.error && (
                        <div><strong>Error:</strong> {(result.error as Error).message || JSON.stringify(result.error)}</div>
                      )}
                      {result.data && (
                        <div><strong>Data:</strong> <pre className="text-xs mt-2 p-2 bg-black/20 rounded">{JSON.stringify(result.data, null, 2)}</pre></div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Debug Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Debug Information</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</div>
                <div>Environment: {import.meta.env.NODE_ENV}</div>
                <div>Current URL: {window.location.origin}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
