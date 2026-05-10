import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import {
  Plus,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getCategoryIcon, getCategoryLabel, getStatusLabel, formatDate } from '@/lib/validation';

export default function DashboardContent() {
  const { user, complaints, refetchComplaints } = useComplaints();
  const [loading, setLoading] = useState(false);

  const userComplaints = complaints.filter((c) => c.userId === user?.id);
  const pendingComplaints = userComplaints.filter((c) => c.status === 'received' || c.status === 'in-progress');
  const resolvedComplaints = userComplaints.filter((c) => c.status === 'resolved');
  const totalComplaints = userComplaints.length;

  useEffect(() => {
    refetchComplaints();
  }, []);

  const recentComplaints = userComplaints.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's an overview of your civic engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalComplaints}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{pendingComplaints.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{resolvedComplaints.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {totalComplaints > 0 ? Math.round((resolvedComplaints.length / totalComplaints) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => toast.info('Use the chatbot in the bottom-right corner to report new issues!')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Report New Issue
            </Button>
            <Link to="/my-complaints">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View All Complaints
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="flex items-center gap-2">
                👤 Profile Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Complaints */}
      <div className="max-w-2xl">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Complaints</CardTitle>
              <Link to="/my-complaints" className="text-xs text-muted-foreground hover:text-primary">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-medium mb-1">No complaints yet</h3>
                <p className="text-xs text-muted-foreground mb-3">Start by reporting your first civic issue</p>
                <Button size="sm">Report Issue</Button>
              </div>
            ) : (
              <div className="space-y-1">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition">
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{getCategoryIcon(complaint.category)}</div>
                      <div>
                        <p className="font-medium text-xs">{complaint.id}</p>
                        <p className="text-xs text-muted-foreground">{getCategoryLabel(complaint.category)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-1 py-0.5 rounded text-xs font-medium ${
                        complaint.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(complaint.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
