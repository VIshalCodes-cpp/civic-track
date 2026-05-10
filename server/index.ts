import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./db";
import {
  handleRequestOTP,
  handleVerifyOTP,
  handleSignupComplete,
  handleLoginWithPassword,
  handleLoginWithOTP,
  handleGetOTPForTesting,
  handleGetAllUsers,
} from "../api/routes/auth";
import {
  handleSubmitComplaint,
  handleGetComplaints,
  handleGetUserComplaints,
  handleGetComplaint,
  handleUpdateComplaint,
  handleDeleteComplaint,
  handleGetDepartmentComplaints,
  handleGetFlaggedComplaints,
  handleFixDepartmentNames,
  handleCreateTestComplaint,
  handleAutoFix,
  handleEmergencyFix,
} from "../api/routes/complaints";
import { handleChatbot } from "../api/routes/chatbot";
import { handleImageUpload } from "./routes/upload";
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);
console.log("PHONE:", process.env.TWILIO_PHONE_NUMBER);
export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Connect to MongoDB
  connectDB().catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    // Continue running even if DB connection fails (for development)
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Authentication routes
  app.post("/api/auth/request-otp", handleRequestOTP);
  app.post("/api/auth/verify-otp", handleVerifyOTP);
  app.post("/api/auth/signup", handleSignupComplete);
  app.post("/api/auth/login-otp", handleLoginWithOTP);
  app.post("/api/auth/login", handleLoginWithPassword);
  app.get("/api/auth/test-otp", handleGetOTPForTesting); // Development only
  app.get("/api/auth/users", handleGetAllUsers); // Admin only

  // Complaint routes
  app.post("/api/complaints", handleSubmitComplaint);
  app.get("/api/complaints", handleGetComplaints);
  app.get("/api/complaints/user/:userId", handleGetUserComplaints);
  app.get("/api/complaints/id/:complaintId", handleGetComplaint);
  app.patch("/api/complaints/:complaintId", handleUpdateComplaint);
  app.delete("/api/complaints/:complaintId", handleDeleteComplaint);
  app.get("/api/complaints/department/:department", handleGetDepartmentComplaints);
  app.get("/api/complaints/flagged", handleGetFlaggedComplaints);
  app.post("/api/complaints/fix-departments", handleFixDepartmentNames);
  app.post("/api/complaints/test", handleCreateTestComplaint);
  app.post("/api/complaints/auto-fix", handleAutoFix);
  app.post("/api/complaints/emergency-fix", handleEmergencyFix);

  // Chatbot route
  app.post("/api/chatbot", handleChatbot);

  // Upload routes
  app.post("/api/upload/image", ...handleImageUpload);

  return app;
}
