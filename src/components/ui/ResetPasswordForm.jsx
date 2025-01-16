import {useState} from 'react';
import {Label} from './label';
import {Input} from './input';
import {Button} from './button';
import z from 'zxcvbn';

import {useToast} from '../../hooks/use-toast';
import {useNavigate, useNavigation, useSearchParams} from 'react-router-dom';
import {callBackend} from '../../lib/usebackend';
import {PasswordStrengthBar} from './PasswordStrengthBar';

export const MINIMUM_REQUIRED_STRENGTH = 3;

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  let passwordStrength = null;

  if (password) passwordStrength = z(password).score;

  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setIsLoading(true);
    try {
      const response = await callBackend({
        packageName: 'core',
        className: 'login',
        methodName: 'resetPassword',
        args: {token, password},
        auth: false,
      });
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been successfully reset.',
        variant: 'success',
      });
      // Optionally redirect to login page
      navigate('/');
    } catch (error) {
      toast({
        title: 'Password Reset Failed',
        description:
          'There was an error resetting your password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmPasswordDisabled =
    passwordStrength < MINIMUM_REQUIRED_STRENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div>
          <PasswordStrengthBar strength={passwordStrength} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          disabled={isConfirmPasswordDisabled}
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {password !== confirmPassword &&
        password.length > 0 &&
        confirmPassword.length > 0 && (
          <p className="text-sm text-red-500">Passwords do not match</p>
        )}
      <Button
        type="submit"
        className="w-full"
        disabled={!passwordsMatch || isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
