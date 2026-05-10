import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-accent" />
        </div>
        
        <h1 className="text-6xl font-poppins font-bold text-primary">404</h1>
        
        <div>
          <h2 className="text-2xl font-poppins font-bold text-primary mb-2">
            Page Not Found
          </h2>
          <p className="text-slate-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
