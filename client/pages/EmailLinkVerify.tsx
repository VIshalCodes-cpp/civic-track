import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useComplaints } from '@/context/ComplaintContext';

const PENDING_SIGNUP_KEY = 'civic-issue-pending-signup';

export default function EmailLinkVerify() {
  const navigate = useNavigate();
  const { login } = useComplaints();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const verifyLink = async () => {
      const auth = getAuth();
      const url = window.location.href;

      if (!isSignInWithEmailLink(auth, url)) {
        setStatus('failed');
        return;
      }

      const pending = localStorage.getItem(PENDING_SIGNUP_KEY);
      if (!pending) {
        setStatus('failed');
        return;
      }

      let signupData: {
        name: string;
        email: string;
        password: string;
        role: string;
        department?: string;
      };

      try {
        signupData = JSON.parse(pending);
      } catch {
        setStatus('failed');
        return;
      }

      if (!signupData.email) {
        setStatus('failed');
        return;
      }

      try {
        await signInWithEmailLink(auth, signupData.email, url);

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: signupData.name,
            email: signupData.email,
            password: signupData.password,
            role: signupData.role,
            department: signupData.department,
            verificationMethod: 'email-link',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create account');
        }

        if (data?.user) {
          login(data.user);
        }

        setStatus('success');
        localStorage.removeItem(PENDING_SIGNUP_KEY);

        // Navigate to the correct dashboard based on role
        const role = signupData.role;
        if (role === 'officer') {
          navigate('/officer/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/civilian/dashboard');
        }
      } catch (error: any) {
        console.error('Email link verification failed:', error);
        toast.error(error?.message || 'Email link verification failed');
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    verifyLink();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-base p-8 space-y-6 text-center">
          {loading && <p className="text-slate-600">Verifying your sign-in link…</p>}
          {!loading && status === 'success' && (
            <div>
              <h1 className="text-2xl font-bold">Welcome aboard!</h1>
              <p className="mt-2 text-slate-600">Your account has been created and you're now signed in.</p>
            </div>
          )}
          {!loading && status === 'failed' && (
            <div>
              <h1 className="text-2xl font-bold">Unable to verify link</h1>
              <p className="mt-2 text-slate-600">We couldn't validate the sign-in link. Please try signing up again.</p>
              <Button
                className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white h-11 font-medium"
                onClick={() => navigate('/signup')}
              >
                Back to Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
