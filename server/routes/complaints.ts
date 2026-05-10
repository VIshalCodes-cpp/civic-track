import { RequestHandler } from 'express';
import { Complaint, User } from '../db';

interface ComplaintBody {
  userId: string;
  category: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface UpdateComplaintBody {
  status?: string;
  officerRemarks?: string;
  departmentAssigned?: string;
}

const departmentAliases: Record<string, string> = {
  'water': 'Water Works',
  'water works': 'Water Works',
  'water department': 'Water Works',
  'sanitation': 'Sanitation',
  'sanitation department': 'Sanitation',
  'electricity': 'Electricity',
  'electricity board': 'Electricity',
  'electricity department': 'Electricity',
  'roads': 'Roads',
  'roads & infrastructure': 'Roads',
  'roads department': 'Roads',
  'streetlight': 'Streetlight',
  'public lighting': 'Streetlight',
  'streetlight department': 'Streetlight',
  'general administration': 'General Administration',
};

const departmentLookupValues: Record<string, string[]> = {
  'Water Works': ['Water Works', 'Water Department', 'water'],
  'Sanitation': ['Sanitation', 'Sanitation Department'],
  'Electricity': ['Electricity', 'Electricity Board', 'Electricity Department'],
  'Roads': ['Roads', 'Roads & Infrastructure', 'Roads Department'],
  'Streetlight': ['Streetlight', 'Public Lighting', 'Streetlight Department'],
  'General Administration': ['General Administration'],
};

function normalizeDepartmentName(department?: string): string {
  if (!department) {
    return '';
  }

  const normalized = department.trim().toLowerCase();
  return departmentAliases[normalized] || department.trim();
}

function getDepartmentLookupValues(department?: string): string[] {
  const normalizedDepartment = normalizeDepartmentName(department);
  return departmentLookupValues[normalizedDepartment] || (normalizedDepartment ? [normalizedDepartment] : []);
}

// Assign department based on category
function assignDepartment(category: string): string {
  const departmentMap: { [key: string]: string } = {
    'water': 'Water Works',
    'sanitation': 'Sanitation',
    'electricity': 'Electricity',
    'roads': 'Roads',
    'streetlight': 'Streetlight',
    'other': 'General Administration'
  };
  return departmentMap[category] || 'General Administration';
}

// Generate complaint ID
function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `PG-${year}-${random}`;
}

// Calculate trust score
function calculateTrustScore(complaint: any): number {
  console.log('Calculating trust score with:', { userId: complaint.userId, imageUrl: complaint.imageUrl, description: complaint.description, descriptionLength: complaint.description?.length });
  
  let score = 0;

  // Verified User (30 points)
  if (complaint.userId) {
    score += 30;
  }

  // Image Uploaded (30 points)
  if (complaint.imageUrl) {
    score += 30;
  }

  // Clear Description (20 points)
  if (complaint.description && complaint.description.length >= 50) {
    score += 20;
  }

  const finalScore = Math.min(score, 100);
  console.log('Trust score calculated:', finalScore);
  
  return finalScore;
}

// Submit a new complaint
export const handleSubmitComplaint: RequestHandler = async (req, res) => {
  try {
    const { userId, category, location, description, imageUrl } = req.body as ComplaintBody;

    if (!userId || !category || !location || !description) {
      return res.status(400).json({
        error: 'Missing required fields: userId, category, location, description',
      });
    }

    // Validate description length
    if (description.length < 15) {
      return res.status(400).json({
        error: 'Description must be at least 15 characters long',
      });
    }

    // Check for duplicate complaints (within 24 hours, same category and location)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Complaint.findOne({
      userId,
      category,
      location,
      createdAt: { $gt: oneDayAgo },
    });

    let trustScore = calculateTrustScore({ userId, imageUrl, description });
    
    console.log('Backend: Creating complaint with:', {
      complaintId: generateComplaintId(),
      userId,
      category,
      location,
      description,
      imageUrl,
      trustScore,
      departmentAssigned: assignDepartment(category)
    });

    // Penalize if duplicate
    if (duplicate) {
      trustScore = Math.max(0, trustScore - 30);
    }

    // Create complaint
    const complaintId = generateComplaintId();
    const departmentAssigned = assignDepartment(category);
    const complaint = new Complaint({
      complaintId,
      userId,
      category,
      location,
      description,
      imageUrl,
      trustScore,
      status: trustScore < 40 ? 'flagged' : 'received',
      departmentAssigned,
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        id: complaint.complaintId,
        complaintId: complaint.complaintId,
        userId: complaint.userId,
        category: complaint.category,
        location: complaint.location,
        description: complaint.description,
        status: complaint.status,
        trustScore: complaint.trustScore,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

// Get all complaints (admin only)
export const handleGetComplaints: RequestHandler = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get user's complaints
export const handleGetUserComplaints: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const complaints = await Complaint.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
};

// Get complaint by ID
export const handleGetComplaint: RequestHandler = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findOne({ complaintId })
      .populate('userId', 'name email phone role')
      .populate('officerId', 'name email role department');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
};

// Update complaint status (officer/admin only)
export const handleUpdateComplaint: RequestHandler = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, officerRemarks, departmentAssigned } = req.body as UpdateComplaintBody;
    const normalizedDepartmentAssigned = normalizeDepartmentName(departmentAssigned);

    console.log('Backend: Updating complaint:', complaintId, 'with body:', req.body);

    if (!complaintId) {
      console.log('Backend: Missing complaint ID');
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    // First, let's find the complaint to see if it exists
    const existingComplaint = await Complaint.findOne({ complaintId });
    console.log('Backend: Existing complaint found:', existingComplaint);

    if (!existingComplaint) {
      console.log('Backend: Complaint not found with ID:', complaintId);
      // Let's list all complaints to see what's in the database
      const allComplaints = await Complaint.find({});
      console.log('Backend: All complaints in database:', allComplaints.map(c => ({ id: c.complaintId, status: c.status, department: c.departmentAssigned })));
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId },
      {
        ...(status && { status }),
        ...(officerRemarks && { officerRemarks }),
        ...(normalizedDepartmentAssigned && { departmentAssigned: normalizedDepartmentAssigned }),
        lastUpdated: new Date(),
      },
      { new: true }
    );

    console.log('Backend: Found and updated complaint:', complaint);

    if (!complaint) {
      console.log('Backend: Complaint not found with ID:', complaintId);
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Backend: Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

// Fix existing complaints with wrong department names
export const handleFixDepartmentNames: RequestHandler = async (req, res) => {
  try {
    console.log('Backend: Fixing department names for existing complaints...');
    
    let totalUpdated = 0;
    
    // Fix all department name mismatches
    const fixes = [
      { old: 'Water Department', new: 'Water Works' },
      { old: 'Sanitation Department', new: 'Sanitation' },
      { old: 'Electricity Department', new: 'Electricity' },
      { old: 'Roads Department', new: 'Roads' },
      { old: 'Streetlight Department', new: 'Streetlight' },
      { old: 'General Administration', new: 'General Administration' }
    ];
    
    for (const fix of fixes) {
      if (fix.old === fix.new) continue; // Skip if same
      
      const result = await Complaint.updateMany(
        { departmentAssigned: fix.old },
        { departmentAssigned: fix.new }
      );
      
      console.log(`Backend: Updated ${result.modifiedCount} complaints from "${fix.old}" to "${fix.new}"`);
      totalUpdated += result.modifiedCount;
    }
    
    console.log(`Backend: Total complaints updated: ${totalUpdated}`);
    
    res.json({
      success: true,
      message: `Fixed ${totalUpdated} complaints with correct department names`,
      updatedCount: totalUpdated
    });
  } catch (error) {
    console.error('Backend: Error fixing department names:', error);
    res.status(500).json({ error: 'Failed to fix department names' });
  }
};

// Auto-fix department names (temporary fix)
export const handleAutoFix: RequestHandler = async (req, res) => {
  try {
    console.log('Backend: Auto-fixing department names...');
    
    let totalUpdated = 0;
    
    // Fix all department name mismatches
    const fixes = [
      { old: 'Water Department', new: 'Water Works' },
      { old: 'Sanitation Department', new: 'Sanitation' },
      { old: 'Electricity Department', new: 'Electricity' },
      { old: 'Roads Department', new: 'Roads' },
      { old: 'Streetlight Department', new: 'Streetlight' },
      { old: 'General Administration', new: 'General Administration' }
    ];
    
    for (const fix of fixes) {
      if (fix.old === fix.new) continue; // Skip if same
      
      const result = await Complaint.updateMany(
        { departmentAssigned: fix.old },
        { departmentAssigned: fix.new }
      );
      
      console.log(`Backend: Updated ${result.modifiedCount} complaints from "${fix.old}" to "${fix.new}"`);
      totalUpdated += result.modifiedCount;
    }
    
    console.log(`Backend: Total complaints updated: ${totalUpdated}`);
    
    res.json({
      success: true,
      message: `Auto-fixed ${totalUpdated} complaints with correct department names`,
      updatedCount: totalUpdated
    });
  } catch (error) {
    console.error('Backend: Error auto-fixing department names:', error);
    res.status(500).json({ error: 'Failed to auto-fix department names' });
  }
};

// Emergency fix - update all water complaints to Water Works
export const handleEmergencyFix: RequestHandler = async (req, res) => {
  try {
    console.log('Backend: Emergency fix - updating water complaints...');
    
    const result = await Complaint.updateMany(
      { 
        category: 'water',
        departmentAssigned: { $ne: 'Water Works' } // Update only if not already Water Works
      },
      { 
        departmentAssigned: 'Water Works'
      }
    );
    
    console.log(`Backend: Emergency fixed ${result.modifiedCount} water complaints`);
    
    res.json({
      success: true,
      message: `Emergency fixed ${result.modifiedCount} water complaints`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Backend: Emergency fix error:', error);
    res.status(500).json({ error: 'Failed to emergency fix' });
  }
};
export const handleCreateTestComplaint: RequestHandler = async (req, res) => {
  try {
    console.log('Backend: Creating test complaint...');
    
    const complaintId = generateComplaintId();
    const departmentAssigned = assignDepartment('water');
    
    const complaint = new Complaint({
      complaintId,
      userId: '69b6d1e26308c1ccb0316b91', // Use the officer's user ID for testing
      category: 'water',
      location: 'Test Location',
      description: 'This is a test complaint to verify the database connection and department assignment.',
      trustScore: 80,
      status: 'received',
      departmentAssigned,
    });

    await complaint.save();
    
    console.log('Backend: Test complaint created:', complaint);
    
    res.json({
      success: true,
      message: 'Test complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Backend: Error creating test complaint:', error);
    res.status(500).json({ error: 'Failed to create test complaint' });
  }
};

// Get complaints for department
export const handleGetDepartmentComplaints: RequestHandler = async (req, res) => {
  try {
    const { department } = req.params;
    const normalizedDepartment = normalizeDepartmentName(department);

    console.log('Backend: Fetching complaints for department:', department, 'normalized to:', normalizedDepartment);

    // First, let's get ALL complaints to see what's in the database
    const allComplaints = await Complaint.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log('Backend: ALL complaints in database:', allComplaints.length);
    console.log('Backend: Complaints with departments:', allComplaints.map(c => ({ id: c.complaintId, dept: c.departmentAssigned, status: c.status })));

    if (!normalizedDepartment) {
      return res.status(400).json({ error: 'Department is required' });
    }

    const complaints = await Complaint.find({ departmentAssigned: { $in: getDepartmentLookupValues(normalizedDepartment) } })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log('Backend: Found complaints for department:', complaints.length);
    
    // Also check total complaints in database
    const totalComplaints = await Complaint.countDocuments();
    console.log('Backend: Total complaints in database:', totalComplaints);
    
    // List all departments with complaint counts
    const departmentCounts = await Complaint.aggregate([
      { $group: { _id: '$departmentAssigned', count: { $sum: 1 } } }
    ]);
    console.log('Backend: Complaints by department:', departmentCounts);

    res.json({
      success: true,
      complaints,
      allComplaints: allComplaints, // Add this for debugging
    });
  } catch (error) {
    console.error('Get department complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch department complaints' });
  }
};

// Get low trust score complaints
export const handleGetFlaggedComplaints: RequestHandler = async (req, res) => {
  try {
    const complaints = await Complaint.find({ $or: [{ status: 'flagged' }, { trustScore: { $lt: 40 } }] })
      .populate('userId', 'name email phone')
      .sort({ trustScore: 1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Get flagged complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch flagged complaints' });
  }
};

// Delete a complaint
export const handleDeleteComplaint: RequestHandler = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findOneAndDelete({ complaintId });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
};
