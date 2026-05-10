import { Link } from 'react-router-dom';
import { useComplaints } from '@/context/ComplaintContext';
import { Complaint } from '@/context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';

export default function MyComplaints() {
  const { complaints, user, deleteComplaint, refetchComplaints } = useComplaints();

  const userComplaints = complaints.filter(
    (complaint) => complaint.userId === user?.id
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          My Complaints
        </h1>
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
      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userComplaints.length > 0 ? (
                userComplaints.map((complaint: Complaint) => (
                  <TableRow key={complaint.complaintId}>
                    <TableCell className="font-medium">{complaint.complaintId}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/complaint/${complaint.complaintId}`} className="text-primary hover:underline">
                        View
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => deleteComplaint(complaint.complaintId)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    You have not submitted any complaints yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
