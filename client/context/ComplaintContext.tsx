import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Complaint {
  id: string;
  complaintId: string;
  category: 'water' | 'sanitation' | 'electricity' | 'roads' | 'streetlight' | 'other';
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  imageUrl?: string;
  status: 'received' | 'in-progress' | 'resolved' | 'flagged';
  trustScore: number;
  createdAt: Date;
  userId: string;
  user?: User; // Populated user data
  departmentAssigned?: string;
  officerRemarks?: string;
  lastUpdated: Date;
  estimatedResolution?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'civilian' | 'officer' | 'admin';
  profileImage?: string;
  department?: string;
}

export interface AuthContextType {
  user: User | null;
  complaints: Complaint[];
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  submitComplaint: (complaint: Omit<Complaint, 'id' | 'complaintId' | 'createdAt' | 'lastUpdated' | 'status' | 'trustScore'>) => Complaint;
  updateComplaintStatus: (complaintId: string, status: Complaint['status'], remarks?: string) => void;
  deleteComplaint: (complaintId: string) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  assignComplaintToDepartment: (complaintId: string, department: string) => void;
  getComplaintsForDepartment: (department: string) => Complaint[];
  refetchComplaints: () => void;
}

const ComplaintContext = createContext<AuthContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const fetchComplaints = async () => {
    if (!user) {
      return;
    }

    try {
      let response;
      if (user.role === 'officer' && user.department) {
        // Officers see complaints assigned to their department
        const url = `/api/complaints/department/${encodeURIComponent(user.department)}`;
        console.log('Fetching complaints for department:', user.department, 'URL:', url);
        try {
          response = await fetch(url);
          console.log('API response received:', response.status, response.statusText);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          return;
        }
      } else if (user.role === 'admin') {
        // Admins see all complaints
        response = await fetch('/api/complaints');
      } else {
        // Civilians see their own complaints
        response = await fetch(`/api/complaints/user/${user.id}`);
      }

      if (!response) {
        console.error('No response received');
        return;
      }

        if (response.ok) {
          const data = await response.json();
          console.log('Raw complaints data:', data);
          // Handle different response formats
          let complaintsData = Array.isArray(data) ? data : (data.complaints || data);
          
          // Ensure complaintsData is an array
          if (!Array.isArray(complaintsData)) {
            complaintsData = [];
          }
          
          console.log('Raw complaints data:', complaintsData);

          // Normalize complaint data - ensure userId is always a string
          const normalizedComplaints = (complaintsData || []).map((complaint: any) => {
            if (!complaint) return null;
            
            return {
              ...complaint,
              id: complaint._id || complaint.id,
              userId: complaint.userId && typeof complaint.userId === 'object' 
                ? (complaint.userId._id || complaint.userId.id) 
                : complaint.userId,
              user: complaint.userId,
            };
          }).filter((c: any) => c !== null);

          console.log('Normalized complaints:', normalizedComplaints);
          setComplaints(normalizedComplaints);
        } else {
          const errorData = await response.json();
          console.error('API error:', response.status, errorData);
          console.error('Failed to fetch complaints, status:', response.status, 'response:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
  };

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      return;
    }

    fetchComplaints();
  }, [user]);

  // Poll for complaint updates for civilians (every 30 seconds)
  useEffect(() => {
    if (user?.role === 'civilian') {
      const interval = setInterval(() => {
        fetchComplaints();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const refetchComplaints = () => {
    fetchComplaints();
  };

  const generateComplaintId = (): string => {
    const year = new Date().getFullYear();
    const nextNumber = complaints.length + 1;
    return `PG-${year}-${String(nextNumber).padStart(4, '0')}`;
  };

  const calculateTrustScore = (complaint: Omit<Complaint, 'id' | 'createdAt' | 'lastUpdated' | 'status' | 'trustScore'>): number => {
    let score = 0;

    // Verified User (30 points)
    if (user && user.id) {
      score += 30;
    }

    // Image Uploaded (30 points)
    if (complaint.imageUrl) {
      score += 30;
    }

    // Clear Description (20 points)
    if (complaint.description.length >= 50) {
      score += 20;
    }

    // Similar complaints from others (20 points)
   const similarComplaints = complaints.filter(
  c =>
    c.category === complaint.category &&
    c.location === complaint.location
);
    if (similarComplaints.length > 0) {
      score += 20;
    }

    return Math.min(score, 100);
  };

 const login = (userData: User) => {
  console.log('Setting user:', userData);
  setUser(userData);
};

  const logout = () => {
    setUser(null);
  };

  const submitComplaint = (complaint: Omit<Complaint, 'id' | 'createdAt' | 'lastUpdated' | 'status' | 'trustScore'>): Complaint => {
    const trustScore = calculateTrustScore(complaint);
    const newComplaint: Complaint = {
      ...complaint,
      id: generateComplaintId(),
      createdAt: new Date(),
      lastUpdated: new Date(),
      status: trustScore < 40 ? 'flagged' : 'received',
      trustScore,
    };

    // Check for duplicates
    const isDuplicate = complaints.some(
      c => c.userId === complaint.userId &&
           c.category === complaint.category &&
           c.location === complaint.location &&
           (new Date().getTime() - c.createdAt.getTime()) < 24 * 60 * 60 * 1000 // within 24 hours
    );

    if (isDuplicate) {
      newComplaint.trustScore = Math.max(0, newComplaint.trustScore - 30);
      newComplaint.status = 'flagged';
    }

    setComplaints([...complaints, newComplaint]);
    return newComplaint;
  };

  const updateComplaintStatus = async (complaintId: string, status: Complaint['status'], remarks?: string) => {
    try {
      console.log('Context: Updating complaint:', complaintId, 'to status:', status, 'with remarks:', remarks);
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          officerRemarks: remarks,
        }),
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const updatedComplaints = complaints.map(c => {
          if (c.complaintId === complaintId) {
            return {
              ...c,
              status,
              officerRemarks: remarks || c.officerRemarks,
              lastUpdated: new Date(),
            };
          }
          return c;
        });
        console.log('Updated complaints array:', updatedComplaints);
        setComplaints(updatedComplaints);
      } else {
        const errorData = await response.json();
        console.error('Failed to update complaint status:', errorData);
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const deleteComplaint = async (complaintId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComplaints(complaints.filter(c => c.complaintId !== complaintId));
      } else {
        console.error('Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
    }
  };

  const getComplaintById = (id: string): Complaint | undefined => {
    return complaints.find(c => c.id === id);
  };

  const assignComplaintToDepartment = async (complaintId: string, department: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentAssigned: department,
        }),
      });

      if (response.ok) {
        setComplaints(complaints.map(c => {
          if (c.complaintId === complaintId) {
            return {
              ...c,
              departmentAssigned: department,
              lastUpdated: new Date(),
            };
          }
          return c;
        }));
      } else {
        console.error('Failed to assign complaint to department');
      }
    } catch (error) {
      console.error('Error assigning complaint to department:', error);
    }
  };

  const getComplaintsForDepartment = (department: string): Complaint[] => {
    // For officers, complaints are already filtered by department in fetchComplaints
    // For admins, return all complaints
    // For civilians, this shouldn't be called but return empty array as fallback
    if (user?.role === 'officer' || user?.role === 'admin') {
      return complaints;
    }
    return [];
  };

  const value: AuthContextType = {
    user,
    complaints,
    isLoggedIn: !!user,
    login,
    logout,
    submitComplaint,
    updateComplaintStatus,
    deleteComplaint,
    getComplaintById,
    assignComplaintToDepartment,
    getComplaintsForDepartment,
    refetchComplaints,
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = (): AuthContextType => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within ComplaintProvider');
  }
  return context;
};
