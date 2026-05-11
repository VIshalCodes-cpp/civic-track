import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  LogOut,
  Menu,
  X,
  AlertCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  UserX,
  Shield,
  Activity,
} from 'lucide-react';
import { getCategoryIcon, getCategoryLabel, getStatusLabel, formatDate } from '@/lib/validation';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, complaints, updateComplaintStatus, assignComplaintToDepartment } = useComplaints();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [assignDepartment, setAssignDepartment] = useState('');
  const [trustScoreFilter, setTrustScoreFilter] = useState<'all' | 'low'>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'complaints' | 'flagged' | 'departments'>('analytics');

  // Real users data from database
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch real users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/auth/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const departmentList = ['Water Works', 'Sanitation', 'Electricity', 'Roads', 'Streetlight'];

  const departments = ['Water Works', 'Sanitation', 'Electricity', 'Roads', 'Streetlight'];

  // Analytics data
  const categoryData = [
    { name: 'Water', value: complaints.filter(c => c.category === 'water').length },
    { name: 'Sanitation', value: complaints.filter(c => c.category === 'sanitation').length },
    { name: 'Electricity', value: complaints.filter(c => c.category === 'electricity').length },
    { name: 'Roads', value: complaints.filter(c => c.category === 'roads').length },
    { name: 'Streetlight', value: complaints.filter(c => c.category === 'streetlight').length },
    { name: 'Other', value: complaints.filter(c => c.category === 'other').length },
  ];

  const statusData = [
    { name: 'Received', value: complaints.filter(c => c.status === 'received').length },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length },
    { name: 'Flagged', value: complaints.filter(c => c.status === 'flagged').length },
  ];

  // Weekly trend data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const count = Math.floor(Math.random() * 15) + 5;
    return {
      name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      complaints: count,
    };
  });

  const filteredComplaints = trustScoreFilter === 'low'
    ? complaints.filter(c => c.trustScore < 40)
    : complaints;

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    flagged: complaints.filter(c => c.status === 'flagged').length,
    lowTrust: complaints.filter(c => c.trustScore < 40).length,
  };

  const COLORS = ['#0D9488', '#F97316', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6'];
  const STATUS_COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444'];

  const handleAssignDepartment = (complaintId: string) => {
    if (!assignDepartment) {
      toast.error('Please select a department');
      return;
    }
    try {
      assignComplaintToDepartment(complaintId, assignDepartment);
      toast.success(`Complaint assigned to ${assignDepartment}`);
      setAssignDepartment('');
      setSelectedComplaint(null);
    } catch (error) {
      toast.error('Failed to assign complaint');
    }
  };

  const handleBlockUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error('You cannot suspend yourself');
      return;
    }
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
    toast.success(`User has been suspended`);
    setSelectedComplaint(null);
  };

  const handleActivateUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error('You cannot activate yourself');
      return;
    }
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    toast.success(`User has been activated`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error('You cannot delete yourself');
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
    toast.success(`User has been deleted`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-6 space-y-8 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-display">CityVoice</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-primary-foreground/10 rounded-xl p-4 border border-primary-foreground/20">
              <p className="text-sm text-primary-foreground/70">Logged in as</p>
              <p className="font-semibold text-lg text-primary-foreground">{user?.name}</p>
              <p className="text-sm text-primary-foreground/60">Administrator</p>
            </div>

            <nav className="space-y-2">
                <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'analytics' 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'text-primary-foreground/90 hover:bg-primary-foreground/20 hover:text-primary-foreground'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('flagged')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'flagged' 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'text-primary-foreground/90 hover:bg-primary-foreground/20 hover:text-primary-foreground'
                }`}
              >
                ⚠️ Flagged Cases
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'departments' 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'text-primary-foreground/90 hover:bg-primary-foreground/20 hover:text-primary-foreground'
                }`}
              >
                🏢 Departments
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'complaints' 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'text-primary-foreground/90 hover:bg-primary-foreground/20 hover:text-primary-foreground'
                }`}
              >
                📋 All Complaints
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeTab === 'users' 
                    ? 'bg-primary-foreground text-primary shadow-lg' 
                    : 'text-primary-foreground/90 hover:bg-primary-foreground/20 hover:text-primary-foreground'
                }`}
              >
                👥 Users
              </button>
            </nav>

            <div className="pt-4 space-y-2">
              <p className="text-xs text-primary-foreground/60 uppercase font-semibold">System Stats</p>
              {[
                { label: 'Total', count: stats.total, icon: AlertCircle },
                { label: 'Resolved', count: stats.resolved, icon: CheckCircle2 },
                { label: 'Flagged', count: stats.flagged, icon: AlertTriangle },
                { label: 'Low Trust', count: stats.lowTrust, icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="bg-primary-foreground/10 rounded-lg p-3 border border-primary-foreground/10">
                  <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                  <p className="text-lg font-bold text-primary-foreground">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-h-screen md:ml-0">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-poppins">
              {activeTab === 'analytics' ? 'Admin Analytics' :
               activeTab === 'users' ? 'User Management' :
               activeTab === 'complaints' ? 'Complaint Management' :
               activeTab === 'flagged' ? 'Flagged Cases' :
               activeTab === 'departments' ? 'Department Overview' :
               'Admin Dashboard'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/30">
          {activeTab === 'analytics' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Complaints', value: stats.total, icon: AlertCircle, color: 'bg-blue-500' },
                  { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'bg-green-500' },
                  { label: 'Flagged', value: stats.flagged, icon: AlertTriangle, color: 'bg-red-500' },
                  { label: 'Low Trust Score', value: stats.lowTrust, icon: TrendingUp, color: 'bg-orange-500' },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
                        </div>
                        <div className={`${kpi.color} p-3 rounded-xl shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Bar Chart */}
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Complaints by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="40%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Trend */}
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Weekly Complaint Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="complaints"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">{loadingUsers ? '...' : users.length}</p>
                    </div>
                    <div className="bg-blue-500 p-4 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                      <p className="text-3xl font-bold text-foreground">{loadingUsers ? '...' : users.filter(u => u.status === 'active').length}</p>
                    </div>
                    <div className="bg-green-500 p-4 rounded-lg">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Suspended Users</p>
                      <p className="text-3xl font-bold text-foreground">{loadingUsers ? '...' : users.filter(u => u.status === 'suspended').length}</p>
                    </div>
                    <div className="bg-red-500 p-4 rounded-lg">
                      <UserX className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/50">
                  <h3 className="text-lg font-bold text-foreground">User Management</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Complaints</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((mappedUser) => (
                          <tr key={mappedUser.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-primary">
                                    {mappedUser.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{mappedUser.name}</p>
                                  {mappedUser.id === user?.id && (
                                    <span className="text-xs text-muted-foreground italic">Current User</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{mappedUser.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mappedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                mappedUser.role === 'officer' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {mappedUser.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mappedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {mappedUser.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {complaints.filter(c => c.userId === mappedUser.id).length}
                            </td>
                            <td className="px-6 py-4">
                              {mappedUser.id === user?.id ? (
                                <span className="text-xs text-muted-foreground italic">Current User</span>
                              ) : (
                                <>
                                  {mappedUser.status === 'active' ? (
                                    <Button
                                      onClick={() => handleBlockUser(mappedUser.id)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      Suspend
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleActivateUser(mappedUser.id)}
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                      Activate
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleDeleteUser(mappedUser.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50 ml-2"
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">All Complaints</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Total: {filteredComplaints.length}
                    </span>
                    <select
                      value={trustScoreFilter}
                      onChange={(e) => setTrustScoreFilter(e.target.value as any)}
                      className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    >
                      <option value="all">All Complaints</option>
                      <option value="low">Low Trust (&lt;40)</option>
                    </select>
                  </div>
                </div>

                {filteredComplaints.length === 0 ? (
                  <div className="bg-card rounded-xl p-12 text-center shadow-lg border border-border">
                    <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No complaints found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="bg-card rounded-xl p-6 hover:shadow-lg transition cursor-pointer border border-border border-l-4 border-l-primary"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-3xl">{getCategoryIcon(complaint.category)}</div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground">{complaint.complaintId}</h3>
                              <p className="text-muted-foreground text-sm mb-1">
                                {getCategoryLabel(complaint.category)} - {complaint.location}
                              </p>
                              <p className="text-muted-foreground text-sm line-clamp-2">{complaint.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              Score: {complaint.trustScore}
                            </span>
                            <p className="text-xs text-muted-foreground mt-2">{getStatusLabel(complaint.status)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'flagged' && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/50">
                  <h3 className="text-lg font-bold text-foreground">Flagged Complaints</h3>
                  <p className="text-sm text-muted-foreground mt-1">Complaints with low trust scores that need review</p>
                </div>
                <div className="p-6">
                  {complaints.filter(c => c.trustScore < 40).length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No flagged complaints</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.filter(c => c.trustScore < 40).map((complaint) => (
                        <div key={complaint.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="text-2xl">{getCategoryIcon(complaint.category)}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">{complaint.complaintId}</h4>
                              <p className="text-muted-foreground text-sm mb-1">
                                {getCategoryLabel(complaint.category)} - {complaint.location}
                              </p>
                              <p className="text-muted-foreground text-sm line-clamp-2">{complaint.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-muted-foreground">Trust Score: {complaint.trustScore}/100</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  complaint.status === 'received' ? 'bg-blue-100 text-blue-800' :
                                  complaint.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {getStatusLabel(complaint.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentList.map((dept) => {
                  // Map department names to complaint categories
                  const categoryMap: Record<string, string[]> = {
                    'Water Works': ['water'],
                    'Sanitation': ['sanitation'],
                    'Electricity': ['electricity'],
                    'Roads': ['roads'],
                    'Streetlight': ['streetlight']
                  };
                  const categories = categoryMap[dept] || [];
                  // Count complaints by assigned department OR by category
                  const deptComplaints = complaints.filter(c => 
                    c.departmentAssigned === dept || categories.includes(c.category)
                  );
                  return (
                    <div key={dept} className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border">
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4">{dept}</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground">Total Complaints</span>
                            <span className="font-bold text-foreground">{deptComplaints.length}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Resolved</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {deptComplaints.filter(c => c.status === 'resolved').length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              {deptComplaints.filter(c => c.status === 'received' || c.status === 'in-progress').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Complaint ID</label>
                  <p className="text-lg font-bold text-foreground">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Trust Score</label>
                  <p className={`text-lg font-bold ${selectedComplaint.trustScore < 40 ? 'text-orange-600' : 'text-green-600'}`}>
                    {selectedComplaint.trustScore}/100
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Category</label>
                  <p className="text-lg">{getCategoryLabel(selectedComplaint.category)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Status</label>
                  <p className="text-lg capitalize">{getStatusLabel(selectedComplaint.status)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-muted-foreground">Location</label>
                  <p className="text-lg">{selectedComplaint.location}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Description</label>
                <p className="text-foreground bg-muted p-4 rounded-lg">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.imageUrl && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Uploaded Image</label>
                  <img src={selectedComplaint.imageUrl} alt="complaint" className="w-full max-h-48 object-cover rounded-lg" />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Assign to Department</label>
                <div className="flex gap-2">
                  <select
                    value={assignDepartment}
                    onChange={(e) => setAssignDepartment(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  >
                    <option value="">Select Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => handleAssignDepartment(selectedComplaint.complaintId)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Assign
                  </Button>
                </div>
              </div>

              {selectedComplaint.trustScore < 40 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <p className="text-sm text-orange-900 dark:text-orange-200 mb-3">
                    This complaint has a low trust score. Consider verification or action.
                  </p>
                  <Button
                    onClick={() => handleBlockUser(selectedComplaint.userId)}
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Block User
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedComplaint(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
