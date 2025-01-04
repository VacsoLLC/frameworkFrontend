import {useState} from 'react';
import {callBackend} from '../lib/usebackend';
import {useToast} from '../hooks/use-toast';
import {Label} from '../components/ui/label';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {Link} from 'react-router-dom';
import {Toaster} from '../components/ui/toaster';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await callBackend({
        packageName: 'core',
        className: 'invite',
        methodName: 'signUpInviteCreate',
        args: {email},
        auth: false,
      });
      toast({
        title: 'Sign Up Successful',
        description:
          'Please check your email for an invitation to create your account.',
        variant: 'success',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Sign Up Failed',
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
