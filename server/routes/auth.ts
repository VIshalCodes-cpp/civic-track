import { RequestHandler } from 'express';
import { User, OTP } from '../db';
import { validateFirebaseToken, generateOTP, getOTPExpiryTime } from '../services/firebase';
import { sendEmailOTP } from '../services/email';
import bcrypt from 'bcryptjs';

/* ============================
   REQUEST OTP
============================ */
export const handleRequestOTP: RequestHandler = async (req, res) => {
  try {
    const { contact, purpose } = req.body;

    if (!contact || !purpose) {
      return res.status(400).json({ error: 'Contact and purpose are required' });
    }

    const normalizedContact = contact.toLowerCase();
    const isEmail = normalizedContact.includes('@');
    const isPhone = /^\+?[1-9]\d{1,14}$/.test(normalizedContact);

    if (!isEmail && !isPhone) {
      return res.status(400).json({ error: 'Invalid email or phone number' });
    }

    // Prevent duplicate signup
    if (purpose === 'signup') {
      const existingUser = isEmail
        ? await User.findOne({ email: normalizedContact })
        : await User.findOne({ phone: normalizedContact });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    const code = generateOTP();
    const expiresAt = getOTPExpiryTime();

    await OTP.create({
      contact: normalizedContact,
      code,
      purpose,
      expiresAt,
    });

    let sent = false;

    if (isPhone) {
      // For frontend Firebase, we don't send OTP from backend
      // Frontend will handle Firebase phone auth directly
      sent = true;
      console.log(`🔥 Frontend will handle Firebase OTP for ${normalizedContact}`);
    } else {
      sent = await sendEmailOTP(normalizedContact, code);
    }

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({
      success: true,
      message: `OTP sent to ${normalizedContact}`,
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
};

/* ============================
   VERIFY OTP
============================ */
export const handleVerifyOTP: RequestHandler = async (req, res) => {
  try {
    const { contact, code, purpose } = req.body;

    if (!contact || !code || !purpose) {
      return res.status(400).json({ error: 'Contact, code, and purpose are required' });
    }

    const normalizedContact = contact.toLowerCase();

    const otp = await OTP.findOne({
      contact: normalizedContact,
      code,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Verify with Firebase (for future implementation)
    // For frontend Firebase, we'll just validate the OTP exists
    console.log(`🔥 Validating OTP for ${normalizedContact}: ${code}`);
    
    // You can implement actual Firebase token verification here:
    // const firebaseVerify = await validateFirebaseToken(code);
    // if (!firebaseVerify.success) {
    //   return res.status(400).json({ error: firebaseVerify.error || 'Invalid or expired OTP' });
    // }

    otp.isUsed = true;
    await otp.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

/* ============================
   COMPLETE SIGNUP
============================ */
export const handleSignupComplete: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, password, role, department, verificationMethod, firebaseUid } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ error: 'Name, password, and role are required' });
    }

    if (role === 'officer' && !department) {
      return res.status(400).json({ error: 'Department is required for officers' });
    }

    const normalizedEmail = email ? email.toLowerCase() : null;

    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phone || null,
      password: hashedPassword,
      role,
      department: role === 'officer' ? department : undefined,
      isVerified: true,
      verificationMethod,
      firebaseUid: firebaseUid || null,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup complete error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

/* ============================
   LOGIN WITH PASSWORD
============================ */
export const handleLoginWithPassword: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("Searching for:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password
    );

    console.log("Password match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: 'Login failed' });
  }
};
export const handleGetOTPForTesting: RequestHandler = async (req, res) => {
  // 🚨 Never allow in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  try {
    const { contact } = req.query as { contact: string };

    if (!contact) {
      return res.status(400).json({ error: 'Contact is required' });
    }

    const normalizedContact = contact.toLowerCase();

    const otp = await OTP.findOne({
      contact: normalizedContact,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(404).json({ error: 'No valid OTP found' });
    }

    res.json({
      success: true,
      contact: normalizedContact,
      code: otp.code,
      expiresAt: otp.expiresAt,
    });
  } catch (error) {
    console.error('Get OTP error:', error);
    res.status(500).json({ error: 'Failed to retrieve OTP' });
  }
};
/* ============================
   LOGIN WITH OTP
============================ */
export const handleLoginWithOTP: RequestHandler = async (req, res) => {
  try {
    const { contact, code } = req.body;

    if (!contact || !code) {
      return res.status(400).json({ error: 'Contact and OTP are required' });
    }

    const normalizedContact = contact.toLowerCase();
    const isEmail = normalizedContact.includes('@');

    const user = isEmail
      ? await User.findOne({ email: normalizedContact })
      : await User.findOne({ phone: normalizedContact });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const otp = await OTP.findOne({
      contact: normalizedContact,
      code,
      purpose: 'login',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    otp.isUsed = true;
    await otp.save();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Login OTP error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/* ============================
   GET ALL USERS (ADMIN ONLY)
============================ */
export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    // Count complaints for each user
    const usersWithComplaintCount = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      status: user.isVerified ? 'active' : 'inactive',
      createdAt: user.createdAt,
      complaintsCount: 0 // Will be populated later
    }));

    res.json({
      success: true,
      users: usersWithComplaintCount
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
