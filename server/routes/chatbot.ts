import { getSession, resetSession, IntentKey } from "../services/chatSessions";
import { Complaint } from "../db";
import { generateChatbotResponse } from "../services/gemini";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import { mapCategory } from "../services/categoryMapper";

/* ---------------- INTENT KEYWORDS ---------------- */

const intentKeywords: Record<Exclude<IntentKey, "general">, string[]> = {
  water_supply_issue: ["water", "pipeline", "no water"],
  electricity_issue: ["electricity", "power", "blackout"],
  road_damage: ["road", "pothole"],
  garbage_collection: ["garbage", "trash"],
  sewerage_problem: ["drain", "sewer"],
  public_transport_issue: ["bus", "transport"],
  noise_complaint: ["noise", "loud"],
  streetlight_issue: ["street light", "streetlight", "lamp", "light pole", "street lamp", "street lights", "streetlights"],
};

/* ---------------- INTENT DETECTOR ---------------- */

function detectIntent(message: string): IntentKey {
  const lower = message.toLowerCase();

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`);
      if (regex.test(lower)) {
        return intent as IntentKey;
      }
    }
  }

  return "general";
}

/* ---------------- GRIEVANCE ID GENERATOR ---------------- */

function generateGrievanceId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `GRV-${year}${month}${day}-${random}`;
}

/* ---------------- DEPARTMENT MAPPING ---------------- */

const intentDepartmentMap: Record<IntentKey, string> = {
  water_supply_issue: "Water Department",
  electricity_issue: "Electricity Board",
  road_damage: "Public Works Department",
  garbage_collection: "Sanitation Department",
  sewerage_problem: "Sewerage Department",
  public_transport_issue: "Transport Department",
  noise_complaint: "Police Department",
  streetlight_issue: "Street Lighting Department",
  general: "General Administration",
};

/* ---------------- CHATBOT HANDLER ---------------- */

export const handleChatbot: RequestHandler = async (req, res) => {
  const { message, userId, latitude, longitude, imageUrl } = req.body;

  const session = getSession(userId);

  if (session.step === "idle") {
    if (typeof message !== "string") {
      return res.json({
        reply: "Please describe your issue.",
      });
    }
    const intent = detectIntent(message);

    if (intent === "general") {
      const { response, intent: newIntent } = await generateChatbotResponse(message);
      if (newIntent && newIntent !== "general") {
        session.category = newIntent;
        session.step = "ask_location";
        return res.json({
          reply: response,
          askLocation: true,
        });
      }
      return res.json({ reply: response });
    }

    session.category = intent;
    session.step = "ask_location";

    return res.json({
      reply: "I understand you have an issue with " + intent.replace(/_/g, " ") + ". To help you, I need to know your location.",
      askLocation: true,
    });
  } else if (session.step === "ask_location") {
    if (!latitude || !longitude) {
      if (message) {
        return res.json({
          reply: "I am detecting your location. Please allow location access or describe your location manually.",
          askLocation: true,
        });
      }
      return res.json({});
    }
    session.latitude = latitude;
    session.longitude = longitude;
    session.step = "ask_description";

    return res.json({
      reply: `📍 I have detected your location automatically.

Coordinates: (${latitude}, ${longitude})

Please describe the issue in detail.`,
    });
  } else if (session.step === "ask_description") {
    if (typeof message !== "string" || message.length < 15) {
      return res.json({
        reply:
          "Please provide a more detailed description so the department can properly understand the issue.",
      });
    }

    session.description = message;
    session.step = "ask_image";

    return res.json({
      reply: "If you have an image upload it, otherwise type 'skip'.",
      askImage: true,
    });
  } else if (session.step === "ask_image") {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        reply: "Invalid user ID.",
      });
    }

    // Handle skip or image upload
    let finalImageUrl = session.imageUrl;
    if (imageUrl) {
      finalImageUrl = imageUrl;
    } else if (message && message.toLowerCase() !== 'skip') {
      return res.json({
        reply: "Please upload an image or type 'skip' to continue without an image.",
        askImage: true,
      });
    }

    const grievanceId = generateGrievanceId();

    const department =
      intentDepartmentMap[session.category || "general"];

    const newComplaint = new Complaint({
      complaintId: grievanceId,
      userId: new mongoose.Types.ObjectId(userId),
      category: mapCategory(session.category),
      latitude: session.latitude,
      longitude: session.longitude,
      location: `(${session.latitude}, ${session.longitude})`,
      description: session.description,
      imageUrl: finalImageUrl,
      departmentAssigned: department,
    });

    await newComplaint.save();

    resetSession(userId);

    return res.json({
      reply: "✅ Your complaint has been registered successfully.",
      grievanceId,
      department,
    });
  } else {
    // Handle unexpected step value
    resetSession(userId);
    return res.status(400).json({
      reply: "An unexpected error occurred. Please start over.",
    });
  }
};

