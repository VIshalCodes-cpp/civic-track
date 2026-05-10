import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useComplaints } from "@/context/ComplaintContext";

type Message = {
  sender: "user" | "bot";
  text: string;
  grievanceId?: string;
  department?: string;
};

const initialBotMessage: Message = {
  sender: "bot",
  text: "Hello! I am your public grievance assistant. Describe your issue (water, electricity, roads, garbage, drainage, transport etc.) and I will register a complaint for you.",
};

const Chatbot: React.FC = () => {
  const { user, refetchComplaints } = useComplaints();

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingLocation, setAwaitingLocation] = useState(false);
  const [awaitingImage, setAwaitingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (awaitingLocation) {
      if (!navigator.geolocation) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Geolocation is not supported by your browser.",
          },
        ]);
        setAwaitingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          sendLocation(lat, lng);
        },
        () => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "I was unable to detect your location. Please ensure you have given location permissions.",
            },
          ]);
          setAwaitingLocation(false);
        }
      );
    }
  }, [awaitingLocation]);

  const sendLocation = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        sender: "bot",
        text: data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    } finally {
      setLoading(false);
      setAwaitingLocation(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { sender: "user", text: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let imageUrl = null;

      // Handle image upload if awaiting image
      if (awaitingImage && selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Failed to upload image. Please try again or type 'skip' to continue without an image.",
            },
          ]);
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          userId: user?.id,
          imageUrl,
        }),
      });

      const data: {
        reply?: string;
        grievanceId?: string;
        department?: string;
        error?: string;
        askLocation?: boolean;
        askImage?: boolean;
      } = await response.json();

      if (data.grievanceId) {
        refetchComplaints();
      }

      if (data.askLocation) {
        setAwaitingLocation(true);
      }

      if (data.askImage) {
        setAwaitingImage(true);
      } else {
        setAwaitingImage(false);
        setSelectedImage(null);
      }

      const botMessage: Message = {
        sender: "bot",
        text:
          data.reply ||
          "Your complaint has been received and will be processed shortly.",
        grievanceId: data.grievanceId,
        department: data.department,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Your complaint has been received and will be processed shortly.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-[480px] max-h-[80vh] w-80 rounded-2xl shadow-xl border border-slate-200 bg-white overflow-hidden relative">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-primary">
            Grievance Chatbot
          </h2>
          <p className="text-xs text-slate-500">
            Ask anything about your public grievance.
          </p>
        </div>
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100">
        {messages.map((message, idx) => {
          const isUser = message.sender === "user";

          return (
            <div
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isUser
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white text-slate-800 rounded-bl-sm border border-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>

                {message.grievanceId && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Grievance ID: {message.grievanceId}
                    </Badge>

                    {message.department && (
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-700"
                      >
                        Department: {message.department}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Typing</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white px-3 py-2 flex flex-col gap-2"
      >
        {awaitingImage && (
          <div className="flex items-center gap-2 p-2 border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImage(file);
                  setInput("Image selected: " + file.name);
                }
              }}
              className="flex-1 text-sm text-slate-600"
              disabled={loading}
            />
            {selectedImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedImage(null);
                  setInput("");
                }}
                disabled={loading}
              >
                Remove
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              awaitingImage
                ? "Type 'skip' or select an image above..."
                : "Describe your grievance..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-sm"
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading || (!input.trim() && !selectedImage)}
            className="shrink-0"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;

