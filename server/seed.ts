import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./db";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env file");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create test users
    const users = [
      {
        name: 'Test Officer Water',
        email: 'officer.water@example.com',
        phone: '+1234567890',
        password: await bcrypt.hash('password123', 10),
        role: 'officer',
        department: 'Water Department',
        isVerified: true,
        verificationMethod: 'email',
      },
      {
        name: 'Test Officer Electricity',
        email: 'officer.electricity@example.com',
        phone: '+1234567891',
        password: await bcrypt.hash('password123', 10),
        role: 'officer',
        department: 'Electricity Board',
        isVerified: true,
        verificationMethod: 'email',
      },
      {
        name: 'Test Admin',
        email: 'admin@example.com',
        phone: '+1234567892',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        isVerified: true,
        verificationMethod: 'email',
      },
      {
        name: 'Test Civilian',
        email: 'civilian@example.com',
        phone: '+1234567893',
        password: await bcrypt.hash('password123', 10),
        role: 'civilian',
        isVerified: true,
        verificationMethod: 'email',
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (!existingUser) {
        await User.create(userData);
        console.log(`Created user: ${userData.name}`);
      } else {
        console.log(`User already exists: ${userData.name}`);
      }
    }

    console.log("Seeding completed");

  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
