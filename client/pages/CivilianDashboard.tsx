import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LogOut,
  Plus,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Menu,
  X,
  RefreshCw,
  Home,
  FileText,
  User,
  Bot,
} from 'lucide-react';
import { getCategoryIcon, getCategoryLabel, getStatusLabel, formatDate } from '@/lib/validation';
import Chatbot from '@/components/Chatbot';

export default function CivilianDashboard() {
  const navigate = useNavigate();
  const { user, logout, complaints, refetchComplaints } = useComplaints();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userComplaints = complaints.filter((c) => c.userId === user?.id);
  const pendingComplaints = userComplaints.filter((c) => c.status === 'received' || c.status === 'in-progress');
  const resolvedComplaints = userComplaints.filter((c) => c.status === 'resolved');
  const totalComplaints = userComplaints.length;

  useEffect(() => {
    refetchComplaints();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const recentComplaints = userComplaints.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-primary-foreground/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">CityVoice</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/civilian/dashboard">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-primary-foreground/20 font-medium flex items-center gap-3 hover:bg-primary-foreground/30 transition">
                <Home className="w-5 h-5" />
                Dashboard
              </button>
            </Link>
            <Link to="/civilian/dashboard/my-complaints">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition flex items-center gap-3">
                <FileText className="w-5 h-5" />
                My Complaints
              </button>
            </Link>
            <Link to="/civilian/dashboard/profile">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition flex items-center gap-3">
                <User className="w-5 h-5" />
                Profile
              </button>
            </Link>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-primary-foreground/20 space-y-3">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-primary-foreground/70 text-xs">{user?.email}</p>
            </div>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-lg transition font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-primary text-primary-foreground p-2 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64 bg-background min-h-screen">
        {/* Top Bar */}
        <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground font-display">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={refetchComplaints}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 bg-background">
          <Outlet />
        </div>
      </div>

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Chatbot />
      </div>
    </div>
  );
}
