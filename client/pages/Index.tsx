import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, TrendingUp, Users, Zap, MapPin } from 'lucide-react';
import { useComplaints } from '@/context/ComplaintContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Index() {
  const { isLoggedIn } = useComplaints();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl dark:opacity-[0.05]" />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient font-display">CityVoice</span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <Link to="/civilian/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link to="/my-complaints">
                  <Button variant="outline">My Complaints</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gradient leading-tight">
              Your City, Your Voice
            </h1>
            <p className="text-2xl md:text-3xl font-heading text-muted-foreground font-medium">
              Report Civic Issues Instantly
            </p>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Fast, transparent, and accountable grievance reporting for local communities.
            Report water problems, sanitation complaints, electricity faults, road damage,
            and streetlight failures directly to your local government.
          </p>

          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/signup">
                <Button size="lg" className="hover:shadow-xl hover:scale-105 text-white text-lg h-14 px-8 transition-all duration-300">
                  Report an Issue
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                  Track Complaint
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Civic Icons Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {[
            { icon: '💧', label: 'Water Supply' },
            { icon: '🚰', label: 'Sanitation' },
            { icon: '⚡', label: 'Electricity' },
            { icon: '🛣️', label: 'Roads' },
            { icon: '💡', label: 'Streetlights' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card-base p-6 md:p-8 text-center group cursor-pointer"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-lg">
                {item.icon}
              </div>
              <p className="text-foreground font-medium text-sm md:text-base group-hover:text-primary transition-colors duration-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 dark:to-muted/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gradient text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <AlertCircle className="w-12 h-12 text-secondary" />,
                title: 'Report Issues',
                description: 'Easily submit complaints with location, photos, and detailed descriptions through our chat interface.',
              },
              {
                icon: <TrendingUp className="w-12 h-12 text-secondary" />,
                title: 'Track Progress',
                description: 'Monitor your complaint status in real-time with updates from assigned government officials.',
              },
              {
                icon: <CheckCircle2 className="w-12 h-12 text-secondary" />,
                title: 'Get Results',
                description: 'Transparent communication and accountability ensure issues are resolved efficiently.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="card-hover p-8 text-center group">
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gradient text-center">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of citizens helping build better communities through transparent governance.
          </p>
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="hover:shadow-xl hover:scale-105 text-white text-lg h-14 px-8 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Chatbot Section – only visible after login */}
      {false && isLoggedIn && (
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-transparent dark:from-muted/10" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gradient">
                Chat with our grievance assistant
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Not sure how to describe your issue or which department it belongs to?
                Our AI assistant will understand your complaint, assign it to the right
                department, and generate a grievance ID for tracking.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Get instant confirmation with a grievance ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Automatically routed to the correct department
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Simple, conversational experience like ChatGPT
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="gradient-primary text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <p className="text-white/80 text-sm">Making civic participation transparent and effective.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/track" className="hover:text-white">Track</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
            <p>&copy; 2026 CityVoice. Making communities better, one complaint at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
