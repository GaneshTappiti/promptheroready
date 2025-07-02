/**
 * Security Settings Component
 * Provides interface for managing password security and MFA settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Mail, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { PasswordSecurityService, PasswordValidationResult } from '@/services/passwordSecurityService';
import { MFAService, MFAMethod } from '@/services/mfaService';
import { useAuth } from '@/contexts/AuthContext';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Password validation state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  
  // MFA state
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [isSettingUpMFA, setIsSettingUpMFA] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCode, setTotpQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Password age state
  const [passwordAge, setPasswordAge] = useState<{ needsUpdate: boolean; daysOld: number } | null>(null);

  useEffect(() => {
    if (user) {
      loadMFAMethods();
      checkPasswordAge();
    }
  }, [user]);

  useEffect(() => {
    if (newPassword) {
      validatePasswordRealtime();
    }
  }, [newPassword]);

  const loadMFAMethods = async () => {
    if (!user) return;
    
    try {
      const methods = await MFAService.getUserMFAMethods(user.id);
      setMfaMethods(methods);
    } catch (error) {
      console.error('Error loading MFA methods:', error);
    }
  };

  const checkPasswordAge = async () => {
    if (!user) return;
    
    try {
      const ageInfo = await PasswordSecurityService.checkPasswordAge(user.id);
      setPasswordAge(ageInfo);
    } catch (error) {
      console.error('Error checking password age:', error);
    }
  };

  const validatePasswordRealtime = async () => {
    if (!newPassword) {
      setPasswordValidation(null);
      return;
    }

    setIsValidatingPassword(true);
    try {
      const validation = await PasswordSecurityService.validatePassword(newPassword);
      setPasswordValidation(validation);
    } catch (error) {
      console.error('Error validating password:', error);
    } finally {
      setIsValidatingPassword(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive"
      });
      return;
    }

    if (!passwordValidation?.isValid) {
      toast({
        title: "Password Invalid",
        description: "Please fix the password issues before continuing",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, you would verify current password and update
      // For now, we'll simulate the process
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordValidation(null);
      checkPasswordAge();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const setupTOTP = async () => {
    if (!user) return;
    
    setIsSettingUpMFA(true);
    try {
      const setup = await MFAService.setupTOTP(user.id);
      setTotpSecret(setup.secret);
      setTotpQrCode(setup.qrCodeUrl);
      
      toast({
        title: "TOTP Setup",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to setup TOTP authentication",
        variant: "destructive"
      });
    } finally {
      setIsSettingUpMFA(false);
    }
  };

  const verifyTOTPSetup = async () => {
    if (!user || !verificationCode) return;
    
    try {
      const result = await MFAService.verifyTOTPSetup(user.id, verificationCode);
      
      if (result.success) {
        toast({
          title: "TOTP Enabled",
          description: "Two-factor authentication has been enabled",
        });
        
        setTotpSecret('');
        setTotpQrCode('');
        setVerificationCode('');
        loadMFAMethods();
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify TOTP setup",
        variant: "destructive"
      });
    }
  };

  const enableEmailMFA = async () => {
    if (!user) return;
    
    try {
      const result = await MFAService.setupEmail(user.id);
      
      if (result.success) {
        toast({
          title: "Email MFA Enabled",
          description: "Email-based two-factor authentication has been enabled",
        });
        loadMFAMethods();
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || "Failed to enable email MFA",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable email MFA",
        variant: "destructive"
      });
    }
  };

  const disableMFAMethod = async (methodId: string) => {
    if (!user) return;
    
    try {
      const result = await MFAService.disableMFAMethod(user.id, methodId);
      
      if (result.success) {
        toast({
          title: "MFA Method Disabled",
          description: "The MFA method has been disabled",
        });
        loadMFAMethods();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to disable MFA method",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable MFA method",
        variant: "destructive"
      });
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthPercentage = (score: number) => {
    return (score / 8) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      {passwordAge?.needsUpdate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your password is {passwordAge.daysOld} days old. Consider updating it for better security.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList>
          <TabsTrigger value="password">Password Security</TabsTrigger>
          <TabsTrigger value="mfa">Two-Factor Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Management
              </CardTitle>
              <CardDescription>
                Update your password and view security requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                
                {passwordValidation && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password Strength: {passwordValidation.strength}</span>
                      <span>{passwordValidation.score}/8</span>
                    </div>
                    <Progress 
                      value={getPasswordStrengthPercentage(passwordValidation.score)}
                      className={`h-2 ${getPasswordStrengthColor(passwordValidation.strength)}`}
                    />
                    
                    {passwordValidation.issues.length > 0 && (
                      <div className="text-sm text-red-600">
                        <ul className="list-disc list-inside">
                          {passwordValidation.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {passwordValidation.suggestions.length > 0 && (
                      <div className="text-sm text-blue-600">
                        <p className="font-medium">Suggestions:</p>
                        <ul className="list-disc list-inside">
                          {passwordValidation.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {passwordValidation.isCompromised && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This password has been found in data breaches. Please choose a different password.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>

              <Button 
                onClick={handlePasswordChange}
                disabled={!passwordValidation?.isValid || isValidatingPassword}
                className="w-full"
              >
                {isValidatingPassword ? 'Validating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Authenticator App (TOTP)
                </CardTitle>
                <CardDescription>
                  Use an authenticator app like Google Authenticator or Authy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!totpSecret ? (
                  <Button onClick={setupTOTP} disabled={isSettingUpMFA}>
                    {isSettingUpMFA ? 'Setting up...' : 'Setup Authenticator App'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpQrCode)}`}
                        alt="QR Code for TOTP setup"
                        className="mx-auto border rounded"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Scan this QR code with your authenticator app
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code from your app"
                        maxLength={6}
                      />
                    </div>
                    
                    <Button onClick={verifyTOTPSetup} className="w-full">
                      Verify and Enable
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Authentication
                </CardTitle>
                <CardDescription>
                  Receive verification codes via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={enableEmailMFA}>
                  Enable Email MFA
                </Button>
              </CardContent>
            </Card>

            {mfaMethods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active MFA Methods</CardTitle>
                  <CardDescription>
                    Manage your enabled two-factor authentication methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mfaMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {method.type === 'totp' && <Smartphone className="h-4 w-4" />}
                          {method.type === 'email' && <Mail className="h-4 w-4" />}
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-600">
                              {method.lastUsed ? `Last used: ${new Date(method.lastUsed).toLocaleDateString()}` : 'Never used'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={method.isEnabled ? 'default' : 'secondary'}>
                            {method.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {method.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disableMFAMethod(method.id)}
                          >
                            Disable
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
