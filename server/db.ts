import mongoose, { Schema, Model } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    const result = await mongoose.connect(MONGODB_URI);
    isConnected = result.connections[0].readyState === 1;
    console.log('Connected to MongoDB');
    return result;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/* =========================
   USER SCHEMA
========================= */

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    phone: { type: String, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['civilian', 'officer', 'admin'],
      default: 'civilian',
    },
    department: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationMethod: { type: String, enum: ['email', 'phone', 'email-link'] },
    profileImage: { type: String },
  },
  { collection: 'users', timestamps: true }
);

/* =========================
   COMPLAINT SCHEMA
========================= */

const complaintSchema = new Schema(
  {
    complaintId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['water', 'sanitation', 'electricity', 'roads', 'streetlight', 'noise', 'other'],
    },
    location: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String, required: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ['received', 'in-progress', 'resolved', 'flagged'],
      default: 'received',
    },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    departmentAssigned: { type: String },
    officerId: { type: Schema.Types.ObjectId, ref: 'User' },
    officerRemarks: { type: String },
    estimatedResolution: { type: Date },
  },
  { collection: 'complaints', timestamps: true }
);

/* =========================
   OTP SCHEMA
========================= */

const otpSchema = new Schema(
  {
    contact: { type: String, required: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset'],
      default: 'login',
    },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  {
    collection: 'otps',
    timestamps: true,
  }
);

// TTL index (auto delete after 1 hour)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

/* =========================
   SAFE MODEL EXPORTS
========================= */

export const User: Model<any> =
  (mongoose.models.User as Model<any>) ||
  mongoose.model('User', userSchema);

export const Complaint: Model<any> =
  (mongoose.models.Complaint as Model<any>) ||
  mongoose.model('Complaint', complaintSchema);

export const OTP: Model<any> =
  (mongoose.models.OTP as Model<any>) ||
  mongoose.model('OTP', otpSchema);
