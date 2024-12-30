import {Link} from 'react-router-dom';
import ResetPasswordForm from '../components/ui/ResetPasswordForm';
import {Toaster} from '../components/ui/toaster';

export default function ResetPassword() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-center text-gray-600 mb-8">
        Enter your new password below to reset your account.
      </p>
      <ResetPasswordForm />
      <Link to="/" className="block text-center mt-4 text-blue-600">
        Go back to login page
      </Link>
      <Toaster />
    </div>
  );
}
