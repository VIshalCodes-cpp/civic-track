import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertCircle, Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebase';
type SignupStep = 'details' | 'link-sent' | 'success';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>('details');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'civilian' | 'officer' | 'admin';
    department: string;
  }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'civilian',
    department: '',
  });

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.role === 'officer' && !formData.department) {
      toast.error('Please select your department');
      return false;
    }

    return true;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Email signup - send Firebase email link
      const actionCodeSettings = {
        url: `${window.location.origin}/complete-signup?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}&role=${formData.role}&department=${formData.department || ''}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);

      // Store signup data in localStorage for completion
      localStorage.setItem('pendingSignup', JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
      }));

      toast.success('Sign-up link sent to your email!');
      setStep('link-sent');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send sign-up link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-slate-800 dark:bg-white rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white dark:text-slate-800" />
            </div>
            <span className="text-3xl font-bold text-slate-800 dark:text-white font-poppins">
              CityVoice
            </span>
          </div>
          <h1 className="text-4xl font-poppins font-bold text-slate-800 dark:text-white mb-3">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Join our community and report civic issues</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              step === 'details' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800' :
              step === 'link-sent' || step === 'success' ? 'bg-green-500 text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {step === 'details' ? <User className="w-5 h-5" /> :
               step === 'link-sent' || step === 'success' ? <CheckCircle className="w-5 h-5" /> :
               <CheckCircle className="w-5 h-5" />}
            </div>
            <div className={`w-12 h-0.5 transition-all duration-300 ${
              step === 'link-sent' || step === 'success' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              step === 'link-sent' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800' :
              step === 'success' ? 'bg-green-500 text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className={`w-12 h-0.5 transition-all duration-300 ${
              step === 'success' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              step === 'success' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 transition-all duration-300">
          {step === 'details' && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-12 h-12 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 bg-background text-foreground"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-12 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 bg-background text-foreground"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-12 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 bg-background text-foreground"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sign up as</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any, department: e.target.value === 'officer' ? formData.department : '' })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="civilian">Civilian (Report Issues)</option>
                  <option value="officer">Department Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {formData.role === 'officer' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select your department</option>
                    <option value="Water Works">Water Works</option>
                    <option value="Sanitation">Sanitation</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Roads">Roads</option>
                      <option value="Streetlight">Streetlight</option>
                  </select>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-medium"
              >
                {loading ? 'Creating account...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'link-sent' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-4">
                  We've sent a sign-up link to <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to complete your account creation. The link will expire in 24 hours.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => {
                    setStep('details');
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Signup
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
                <p className="text-muted-foreground">Your account has been successfully created. You will be redirected to login shortly.</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
