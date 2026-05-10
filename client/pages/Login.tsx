import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { AlertCircle, Mail, Phone, Lock } from 'lucide-react';

type Role = 'civilian' | 'officer' | 'admin';
type LoginMethod = 'email' | 'phone';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useComplaints();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clear form fields to prevent browser autofill
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
      setPhone('');
      setOtp('');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

 const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Invalid credentials');
      return;
    }

    toast.success(`Welcome back, ${data.user.name}!`, { duration: 1500 });

    // Use the login function from context
    login(data.user);

    // Redirect based on role
    switch (data.user.role) {
      case 'officer':
        navigate('/officer/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/civilian/dashboard');
        break;
    }

  } catch (error) {
    console.error(error);
    toast.error('Login failed');
  } finally {
    setLoading(false);
  }
};

 const handlePhoneOTP = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!showOTP) {
    // Step 1: Request OTP
    const response = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: phone, purpose: 'login' }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Failed to send OTP');
      return;
    }

    setShowOTP(true);
    toast.success('OTP sent');
  } else {
    // Step 2: Verify and login with OTP
    const response = await fetch('/api/auth/login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: phone, code: otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Invalid OTP');
      return;
    }

    login(data.user);

    // Redirect based on role
    switch (data.user.role) {
      case 'officer':
        navigate('/officer/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/civilian/dashboard');
        break;
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary font-display">CityVoice</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Sign In</h1>
          <p className="text-muted-foreground">Report issues and track progress</p>
        </div>

        <div className="card-base p-8 space-y-6">
          {/* Login Method Toggle */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {(['email', 'phone'] as const).map((method) => (
              <button
                key={method}
                onClick={() => {
                  setLoginMethod(method);
                  setShowOTP(false);
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all font-medium capitalize text-sm ${
                  loginMethod === method
                    ? 'bg-background text-primary shadow-sm border'
                    : 'text-muted-foreground'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Email Login */}
          {loginMethod === 'email' && (
            <form
              onSubmit={handleEmailLogin}
              className="space-y-4"
              autoComplete="off"
              data-form-type="login"
              key="login-form"
            >
              {/* Hidden fields to capture browser autofill (keeps visible inputs empty) */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                style={{ display: 'none' }}
                tabIndex={-1}
              />
              <input
                type="password"
                name="current-password"
                autoComplete="current-password"
                style={{ display: 'none' }}
                tabIndex={-1}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="off"
                    name="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="off"
                    name="login-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Phone OTP Login */}
          {loginMethod === 'phone' && (
            <form onSubmit={handlePhoneOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={showOTP}
                    required
                  />
                </div>
              </div>

              {showOTP && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Enter OTP</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter any 6 digit code</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium"
              >
                {loading ? 'Verifying...' : showOTP ? 'Verify OTP' : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* Demo Button */}
          <div className="border-t border-border pt-4 space-y-2">
            <Link to="/signup" className="block">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:bg-muted"
              >
                Don't have an account? Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
