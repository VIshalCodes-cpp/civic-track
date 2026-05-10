import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LogOut,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { getCategoryIcon, getCategoryLabel, getStatusLabel, formatDate, formatDateShort } from '@/lib/validation';

type StatusFilter = 'all' | 'received' | 'in-progress' | 'resolved' | 'flagged';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { user, logout, complaints, updateComplaintStatus, getComplaintsForDepartment, refetchComplaints } = useComplaints();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'flagged' | 'profile'>('dashboard');

  console.log('OfficerDashboard - user:', user);
  console.log('OfficerDashboard - complaints:', complaints);

  useEffect(() => {
    // Force refetch on mount and when user changes
    refetchComplaints();
  }, [user]);

  const departmentComplaints = complaints;

  const filteredComplaints = statusFilter === 'all'
    ? departmentComplaints
    : departmentComplaints.filter(c => c.status === statusFilter);

  const stats = {
    total: departmentComplaints.length,
    received: departmentComplaints.filter(c => c.status === 'received').length,
    inProgress: departmentComplaints.filter(c => c.status === 'in-progress').length,
    resolved: departmentComplaints.filter(c => c.status === 'resolved').length,
    flagged: departmentComplaints.filter(c => c.status === 'flagged').length,
    avgResolutionTime: 2.5, // days
    resolutionRate: departmentComplaints.length > 0 ? Math.round((departmentComplaints.filter(c => c.status === 'resolved').length / departmentComplaints.length) * 100) : 0,
    pendingThisWeek: departmentComplaints.filter(c => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return c.createdAt > weekAgo && c.status !== 'resolved';
    }).length,
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      console.log('Updating complaint:', complaintId, 'to status:', newStatus, 'with remarks:', remarks);
      await updateComplaintStatus(complaintId, newStatus as any, remarks);
      console.log('Update successful');
      toast.success(`Complaint ${complaintId} updated to ${newStatus}`);
      setRemarks('');
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update complaint');
    }
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
              <p className="text-sm text-primary-foreground/60">Officer - {user?.department}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'dashboard' ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'complaints' ? 'bg-primary-foreground/20 font-medium' : 'hover:bg-primary-foreground/10'
                }`}
              >
                📋 My Complaints
              </button>
              <button
                onClick={() => setActiveTab('flagged')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'flagged' ? 'bg-primary-foreground/20 font-medium' : 'hover:bg-primary-foreground/10'
                }`}
              >
                ⚠️ Flagged Cases
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'profile' ? 'bg-primary-foreground/20 font-medium' : 'hover:bg-primary-foreground/10'
                }`}
              >
                👤 Profile
              </button>
            </nav>

            <div className="pt-4 space-y-2">
              <p className="text-xs text-primary-foreground/60 uppercase font-semibold">Department KPIs</p>
              {[
                { label: 'Total', count: stats.total },
                { label: 'Received', count: stats.received },
                { label: 'In Progress', count: stats.inProgress },
                { label: 'Resolved', count: stats.resolved },
                { label: 'Resolution Rate', count: `${stats.resolutionRate}%` },
                { label: 'Avg Resolution', count: `${stats.avgResolutionTime}d` },
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
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <h2 className="text-2xl font-bold text-foreground font-poppins">
              {activeTab === 'dashboard' ? 'Department Dashboard' :
               activeTab === 'complaints' ? 'My Complaints' :
               activeTab === 'flagged' ? 'Flagged Cases' :
               'Profile'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user?.department} Department
            </div>
            <Button
              onClick={refetchComplaints}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-muted/30">
          {activeTab === 'dashboard' && (
            <>
              {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Complaints', value: stats.total, icon: AlertCircle, color: 'bg-blue-500' },
              { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: CheckCircle2, color: 'bg-green-500' },
              { label: 'Avg Resolution Time', value: `${stats.avgResolutionTime} days`, icon: Clock, color: 'bg-orange-500' },
              { label: 'Pending This Week', value: stats.pendingThisWeek, icon: AlertTriangle, color: 'bg-red-500' },
            ].map((kpi, idx) => {
              const IconComp = kpi.icon;
              return (
                <div key={idx} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    </div>
                    <div className={`${kpi.color} p-4 rounded-lg`}>
                      <IconComp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'received', 'in-progress', 'resolved', 'flagged'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition capitalize ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'in-progress' ? 'In Progress' : status}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="grid gap-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center shadow-lg border border-border">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No complaints found</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="card-base p-6 hover:shadow-card-hover transition cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{getCategoryIcon(complaint.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-foreground">{complaint.complaintId}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                            complaint.status === 'received' ? 'bg-blue-500' :
                            complaint.status === 'in-progress' ? 'bg-orange-500' :
                            complaint.status === 'resolved' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}>
                            {getStatusLabel(complaint.status)}
                          </span>
                          <span className="text-sm text-muted-foreground">Score: {complaint.trustScore}</span>
                        </div>
                        <p className="text-muted-foreground mb-2">{getCategoryLabel(complaint.category)} - {complaint.location}</p>
                        <p className="text-muted-foreground text-sm line-clamp-2">{complaint.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted: {formatDate(complaint.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {complaint.officerRemarks && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Remarks:</strong> {complaint.officerRemarks}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          </>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">My Assigned Complaints</h3>
                <div className="text-sm text-muted-foreground">
                  {departmentComplaints.length} total complaints
                </div>
              </div>

              <div className="grid gap-4">
                {departmentComplaints.length === 0 ? (
                  <div className="bg-card rounded-xl p-12 text-center shadow-lg border border-border">
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No complaints assigned to your department</p>
                  </div>
                ) : (
                  departmentComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="card-base p-6 hover:shadow-card-hover transition cursor-pointer"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">{getCategoryIcon(complaint.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-foreground">{complaint.complaintId}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                                complaint.status === 'received' ? 'bg-blue-500' :
                                complaint.status === 'in-progress' ? 'bg-orange-500' :
                                complaint.status === 'resolved' ? 'bg-green-500' :
                                'bg-red-500'
                              }`}>
                                {getStatusLabel(complaint.status)}
                              </span>
                              <span className="text-sm text-muted-foreground">Score: {complaint.trustScore}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{getCategoryLabel(complaint.category)} - {complaint.location}</p>
                            <p className="text-muted-foreground text-sm line-clamp-2">{complaint.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {formatDate(complaint.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {complaint.officerRemarks && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <strong>Remarks:</strong> {complaint.officerRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'flagged' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Flagged Complaints</h3>
                <div className="text-sm text-muted-foreground">
                  {complaints.filter(c => c.status === 'flagged' || c.trustScore < 40).length} flagged complaints
                </div>
              </div>

              <div className="grid gap-4">
                {complaints.filter(c => c.status === 'flagged' || c.trustScore < 40).length === 0 ? (
                  <div className="bg-card rounded-xl p-12 text-center shadow-lg border border-border">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No flagged complaints</p>
                  </div>
                ) : (
                  complaints.filter(c => c.status === 'flagged' || c.trustScore < 40).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="card-base p-6 hover:shadow-card-hover transition cursor-pointer border-l-4 border-red-500"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">{getCategoryIcon(complaint.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-foreground">{complaint.complaintId}</h3>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {complaint.status === 'flagged' ? 'Flagged' : 'Low Trust'}
                              </span>
                              <span className="text-sm text-muted-foreground">Score: {complaint.trustScore}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{getCategoryLabel(complaint.category)} - {complaint.location}</p>
                            <p className="text-muted-foreground text-sm line-clamp-2">{complaint.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {formatDate(complaint.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {complaint.officerRemarks && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <strong>Remarks:</strong> {complaint.officerRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h3 className="text-lg font-bold text-foreground mb-6">Officer Profile</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Name</label>
                    <p className="text-lg font-bold text-foreground mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Email</label>
                    <p className="text-lg text-foreground mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                    <p className="text-lg text-foreground mt-1">{user?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Department</label>
                    <p className="text-lg text-foreground mt-1">{user?.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Role</label>
                    <p className="text-lg text-foreground mt-1 capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Assigned Complaints</label>
                    <p className="text-lg font-bold text-primary mt-1">{departmentComplaints.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Assigned</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.inProgress}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.resolutionRate}%</p>
                    <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  </div>
                </div>
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
                  <label className="text-sm font-semibold text-muted-foreground">Status</label>
                  <p className="text-lg font-bold capitalize">{getStatusLabel(selectedComplaint.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Category</label>
                  <p className="text-lg">{getCategoryLabel(selectedComplaint.category)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Trust Score</label>
                  <p className="text-lg font-bold text-primary">{selectedComplaint.trustScore}/100</p>
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
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Add Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your investigation remarks or update..."
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background text-foreground"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-3">Update Status</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['received', 'in-progress', 'resolved', 'flagged'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedComplaint.complaintId, status)}
                      className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                        selectedComplaint.status === status
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {status === 'in-progress' ? 'In Progress' : status}
                    </button>
                  ))}
                </div>
              </div>

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
