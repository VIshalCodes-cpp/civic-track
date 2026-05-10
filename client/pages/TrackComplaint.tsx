import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import {
  AlertCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Home,
  MapPin,
  FileText,
  User,
} from 'lucide-react';
import { getCategoryIcon, getCategoryLabel, getStatusLabel, formatDate, formatDateShort, validateComplaintId } from '@/lib/validation';

export default function TrackComplaint() {
  const { getComplaintById } = useComplaints();
  const [complaintId, setComplaintId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaintId.trim()) {
      toast.error('Please enter a Complaint ID');
      return;
    }

    if (!validateComplaintId(complaintId.toUpperCase())) {
      toast.error('Invalid Complaint ID format (e.g., PG-2026-0001)');
      return;
    }

    setSearching(true);
    setTimeout(() => {
      const complaint = getComplaintById(complaintId.toUpperCase());
      if (complaint) {
        setTrackedComplaint(complaint);
        toast.success('Complaint found');
      } else {
        setTrackedComplaint(null);
        toast.error('Complaint not found');
      }
      setSearching(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'text-blue-600';
      case 'in-progress':
        return 'text-orange-600';
      case 'resolved':
        return 'text-green-600';
      case 'flagged':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'bg-orange-50 border-orange-200';
      case 'resolved':
        return 'bg-green-50 border-green-200';
      case 'flagged':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const statuses = ['received', 'in-progress', 'resolved'];

  const getStatusPosition = (status: string) => {
    if (status === 'flagged') return 1; // Flagged is separate
    return statuses.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">CityVoice</span>
          </Link>
          <Link to="/">
            <Button variant="outline">← Back Home</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="card-base p-8 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-4">
              Track Your Complaint
            </h1>
            <p className="text-lg text-slate-600">
              Enter your Complaint ID to check the status and updates
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="e.g., PG-2026-0001"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              disabled={searching}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {!trackedComplaint && (
            <div className="text-center text-slate-600">
              <p>The Complaint ID can be found in your confirmation email or SMS</p>
              <p className="text-sm text-slate-500 mt-2">Format: PG-YYYY-XXXX (e.g., PG-2026-0001)</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {trackedComplaint && (
          <div className="space-y-8 animate-in fade-in">
            {/* Status Overview */}
            <div className={`card-base p-8 border-l-4 ${
              trackedComplaint.status === 'received' ? 'border-blue-500 bg-blue-50' :
              trackedComplaint.status === 'in-progress' ? 'border-orange-500 bg-orange-50' :
              trackedComplaint.status === 'resolved' ? 'border-green-500 bg-green-50' :
              'border-red-500 bg-red-50'
            }`}>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Complaint ID</p>
                  <p className="text-3xl font-bold text-primary">{trackedComplaint.id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Current Status</p>
                  <p className={`text-3xl font-bold ${getStatusColor(trackedComplaint.status)}`}>
                    {getStatusLabel(trackedComplaint.status)}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(trackedComplaint.category)}</span>
                    <span className="text-lg font-semibold">{getCategoryLabel(trackedComplaint.category)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Submitted On</p>
                  <p className="text-lg font-semibold">{formatDateShort(trackedComplaint.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Trust Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${trackedComplaint.trustScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{trackedComplaint.trustScore}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-base p-6">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-secondary mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Location</p>
                    <p className="text-lg text-slate-900">{trackedComplaint.location}</p>
                  </div>
                </div>
              </div>

              {trackedComplaint.departmentAssigned && (
                <div className="card-base p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <User className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Assigned To</p>
                      <p className="text-lg text-slate-900">{trackedComplaint.departmentAssigned}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-base p-6">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-secondary mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2">Issue Description</p>
                  <p className="text-slate-900 leading-relaxed">{trackedComplaint.description}</p>
                </div>
              </div>
            </div>

            {/* Image if available */}
            {trackedComplaint.imageUrl && (
              <div className="card-base p-6">
                <p className="text-sm font-semibold text-slate-600 mb-4">Uploaded Image</p>
                <img
                  src={trackedComplaint.imageUrl}
                  alt="complaint"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Status Timeline */}
            <div className="card-base p-6">
              <h3 className="text-lg font-bold text-primary mb-6">Status Timeline</h3>

              <div className="space-y-6">
                {/* Timeline Items */}
                {trackedComplaint.status === 'flagged' ? (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-red-600">Flagged for Verification</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        This complaint has been flagged and requires additional verification.
                        Please contact us for more information.
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDate(trackedComplaint.lastUpdated)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Received */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        {statuses.indexOf(trackedComplaint.status) >= 0 && (
                          <div className="w-1 h-8 bg-slate-300 my-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-bold text-blue-600">Complaint Received</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Your complaint has been successfully submitted and recorded in the system.
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDate(trackedComplaint.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* In Progress */}
                    {statuses.indexOf(trackedComplaint.status) >= 1 && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                            <Clock className="w-6 h-6" />
                          </div>
                          {statuses.indexOf(trackedComplaint.status) >= 2 && (
                            <div className="w-1 h-8 bg-slate-300 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="font-bold text-orange-600">Under Investigation</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {trackedComplaint.departmentAssigned ? (
                              <>
                                Your complaint has been assigned to <strong>{trackedComplaint.departmentAssigned}</strong>.
                                Our team is actively investigating the issue.
                              </>
                            ) : (
                              'Your complaint is being processed and investigated.'
                            )}
                          </p>
                          {trackedComplaint.officerRemarks && (
                            <p className="text-sm bg-orange-50 p-2 rounded mt-2 border border-orange-200">
                              <strong>Officer Notes:</strong> {trackedComplaint.officerRemarks}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            {formatDate(trackedComplaint.lastUpdated)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Resolved */}
                    {statuses.indexOf(trackedComplaint.status) >= 2 && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="font-bold text-green-600">Resolved</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            The issue has been successfully resolved. Thank you for reporting it!
                          </p>
                          {trackedComplaint.estimatedResolution && (
                            <p className="text-xs text-slate-500 mt-2">
                              Resolved on: {formatDateShort(trackedComplaint.estimatedResolution)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {trackedComplaint.estimatedResolution && trackedComplaint.status !== 'resolved' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Estimated Resolution:</strong> {formatDateShort(trackedComplaint.estimatedResolution)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { setTrackedComplaint(null); setComplaintId(''); }} variant="outline">
                Search Another
              </Button>
              <Link to="/">
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  Report New Issue
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80">
            &copy; 2026 CityVoice. Making communities better, one complaint at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
