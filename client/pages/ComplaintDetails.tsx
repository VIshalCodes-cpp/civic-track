import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Complaint, useComplaints } from '@/context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ComplaintDetails() {
  const { complaintId } = useParams<{ complaintId: string }>();
  const { getComplaintById } = useComplaints();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (complaintId) {
        setLoading(true);
        try {
          const response = await fetch(`/api/complaints/id/${complaintId}`);
          if (response.ok) {
            const data = await response.json();
            setComplaint(data.complaint);
          } else {
            console.error('Failed to fetch complaint');
          }
        } catch (error) {
          console.error('Error fetching complaint:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    // First, try to get the complaint from the context to avoid a network request
    if (complaintId) {
      const complaintFromContext = getComplaintById(complaintId);
      if (complaintFromContext) {
        setComplaint(complaintFromContext);
        setLoading(false);
      } else {
        fetchComplaint();
      }
    }
  }, [complaintId, getComplaintById]);

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (!complaint) {
    return <div className="container mx-auto p-8">Complaint not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Complaint ID</h3>
            <p>{complaint.id}</p>
          </div>
          <div>
            <h3 className="font-semibold">Category</h3>
            <p>{complaint.category}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <Badge variant="outline">{complaint.status}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Description</h3>
            <p>{complaint.description}</p>
          </div>
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{complaint.location}</p>
          </div>
          <div>
            <h3 className="font-semibold">Date Submitted</h3>
            <p>{new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
          {complaint.officerRemarks && (
            <div>
              <h3 className="font-semibold">Officer Remarks</h3>
              <p>{complaint.officerRemarks}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
