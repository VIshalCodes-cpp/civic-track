const ABUSIVE_KEYWORDS = [
  'abuse',
  'violence',
  'threat',
  'attack',
  'kill',
  'hurt',
  'damage',
];

export const validateComplaintDescription = (description: string): { valid: boolean; error?: string } => {
  if (description.length < 15) {
    return { valid: false, error: 'Description must be at least 15 characters long' };
  }

  const lowerDesc = description.toLowerCase();
  for (const keyword of ABUSIVE_KEYWORDS) {
    if (lowerDesc.includes(keyword)) {
      return { valid: false, error: 'Description contains inappropriate language' };
    }
  }

  return { valid: true };
};

export const validateComplaintId = (id: string): boolean => {
  const pattern = /^PG-\d{4}-\d{4}$/;
  return pattern.test(id);
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    water: '💧',
    sanitation: '🚰',
    electricity: '⚡',
    roads: '🛣️',
    streetlight: '💡',
    other: '📋',
  };
  return icons[category] || '📋';
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    water: 'Water Supply',
    sanitation: 'Sanitation',
    electricity: 'Electricity',
    roads: 'Road Damage',
    streetlight: 'Streetlight',
    other: 'Other',
  };
  return labels[category] || category;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    received: 'blue',
    'in-progress': 'orange',
    resolved: 'green',
    flagged: 'red',
  };
  return colors[status] || 'gray';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    received: 'Received',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    flagged: 'Flagged',
  };
  return labels[status] || status;
};

export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const formatDateShort = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDateShort:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};
