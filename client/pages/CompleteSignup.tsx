import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';

export default function CompleteSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const completeSignup = async () => {
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const role = searchParams.get('role');
      const department = searchParams.get('department');
      
      if (!email || !name || !role) {
        toast.error('Invalid signup link');
        navigate('/signup');
        return;
      }

      setLoading(true);
      
      try {
        // Check if the link is a valid email sign-in link
        if (isSignInWithEmailLink(auth, window.location.href)) {
          // Get the stored signup data
          const pendingSignup = localStorage.getItem('pendingSignup');
          if (!pendingSignup) {
            toast.error('Signup data not found. Please try again.');
            navigate('/signup');
            return;
          }
          
          const signupData = JSON.parse(pendingSignup);
          
          // Sign in with email link
          const result = await signInWithEmailLink(auth, email, window.location.href);
          
          // Create account in backend
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: signupData.name,
              email: signupData.email,
              password: signupData.password,
              role: signupData.role,
              department: signupData.department,
              verificationMethod: 'email',
              firebaseUid: result.user.uid,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error || 'Failed to create account');
            return;
          }

          // Clear stored data
          localStorage.removeItem('pendingSignup');
          
          setCompleted(true);
          toast.success('Account created successfully!');
          
          // Redirect to login after delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          toast.error('Invalid or expired link');
          navigate('/signup');
        }
      } catch (error: any) {
        console.error('Error completing signup:', error);
        toast.error(error.message || 'Failed to complete signup');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    completeSignup();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Creating Your Account</h2>
              <p className="text-muted-foreground">Please wait while we set up your account...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
              <p className="text-muted-foreground">
                Your account has been successfully created. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-muted-foreground">
              Something went wrong. Redirecting you back to signup...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
