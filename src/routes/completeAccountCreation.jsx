import {useState} from 'react';
import {callBackend} from '../lib/usebackend';
import {Label} from '../components/ui/label';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {useToast} from '../hooks/use-toast';
import {Toaster} from '../components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../components/ui/dialog';
import {CloudCog} from 'lucide-react';

export default function CreatePasswordPage() {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const {toast} = useToast();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }
    if (!fullName.trim()) {
      toast({
        title: 'Full Name Required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await callBackend({
        packageName: 'core',
        className: 'login',
        methodName: 'createAccount',
        args: {token, password, fullName},
        auth: false,
        supressDialog: true,
      });
      toast({
        title: 'Account creation successful',
        description:
          'Please check your email for an invitation to create your account.',
        variant: 'success',
      });
      setShowSuccessDialog(true);
    } catch (error) {
      toast({
        title: 'Account Creation Failed',
        description:
          error?.message ??
          'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-6">
              Complete the signup
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {password !== confirmPassword && password && confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <Link to="/" className="block text-center my-4">
              Go to login page
            </Link>
          </div>
        </div>
        <Toaster />
      </div>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Account creation successful</DialogTitle>
          <DialogDescription>
            Your account has been created successfully.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => navigate('/')}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
