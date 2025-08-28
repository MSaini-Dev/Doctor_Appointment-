import React, { useEffect, useState } from "react";
import {  Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Footer from "./components/home/Footer";
import Navbar from "./components/home/Navbar";
import Hero from "./components/home/Hero";
import TestimonialsSection from "./components/home/Review";
import Feature from "./components/home/Feature";
import Statics from "./components/home/Statics";
interface Session {
  _id: string;
  date: string;
  checkin: string;
  checkout: string;
  totalTokens: number;
  currentToken: number;
  isActive: boolean;
}

// interface PatientForm {
//   name: string;
//   phone: string;
// }

interface LiveSummary {
  liveSession?: Session;
  completedPatients?: number;
  isTodayHoliday?: boolean;
}

export default function DoctorPortfolio() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [token, setToken] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveSummary, setLiveSummary] = useState<LiveSummary | null>(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [phoneError, setPhoneError] = useState("");

  const backend = import.meta.env.VITE_API_BACKEND;

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    async function fetchLiveSummary() {
      try {
        const res = await fetch(backend + "/sessions/live-summary");
        const data: LiveSummary = await res.json();
        setLiveSummary(data);
      } catch {
        // Handle error silently
      }
    }
    fetchLiveSummary();
    const interval = setInterval(fetchLiveSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(backend + "/sessions");
        const data: Session[] = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0]._id);
          setSelectedSession(data[0]);
        }
      } catch {
        setError("Failed to load sessions");
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    const session = sessions.find((s) => s._id === selectedSessionId);
    setSelectedSession(session || null);
  }, [selectedSessionId, sessions]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: digitsOnly }));
      if (digitsOnly.length > 0) {
        validatePhoneNumber(digitsOnly);
      } else {
        setPhoneError("");
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
    setToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      setError("Please select a session first.");
      return;
    }
    if (!form.name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!validatePhoneNumber(form.phone)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(backend + "/patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          sessionId: selectedSession._id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setToken(data.tokenNo);
        setForm({ name: "", phone: "" });
        setPhoneError("");
        // Refresh sessions
        const sessionsRes = await fetch(backend + "/sessions");
        const sessionsData: Session[] = await sessionsRes.json();
        setSessions(sessionsData);
        const updatedSession = sessionsData.find(
          (s) => s._id === selectedSessionId
        );
        setSelectedSession(updatedSession || null);
      }
    } catch {
      setError("Failed to book appointment. Please try again.");
    }
    setSubmitting(false);
  };

  // Group sessions by date
  const sessionsByDate = sessions.reduce(
    (acc: Record<string, Session[]>, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading clinic information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Navigation */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} liveSummary={liveSummary} />

      {/* Hero Section */}
      <Hero darkMode={darkMode} liveSummary={liveSummary} />
      <Statics />

      {/* Booking Section */}
      <section id="booking-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="text-center border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-3xl font-bold text-black dark:text-white">
                Book Your Appointment
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Select a session and provide your details to book an appointment
              </CardDescription>
              
              {/* Important Information */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 border border-sky-200 dark:border-gray-800 rounded-lg">
                <h4 className="font-semibold text-sky-700 dark:text-sky-400 mb-2">Important Guidelines:</h4>
                <ul className="text-sm text-sky-600 dark:text-sky-400 space-y-1 text-left">
                  <li>• Please arrive 15 minutes before your scheduled time</li>
                  <li>• Bring valid ID and insurance documents</li>
                  <li>• Wear a mask and maintain social distancing</li>
                  <li>• Cancel at least 2 hours in advance if unable to attend</li>
                </ul>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Success Message */}
              {token && (
                <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Appointment booked successfully! Your token number is{" "}
                    <span className="font-bold">#{token}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Available Sessions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                  Available Sessions
                </h3>
                {Object.keys(sessionsByDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No sessions available at the moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                      <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-black dark:text-white">
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {dateSessions.map((session) => (
                            <div
                              key={session._id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedSessionId === session._id
                                  ? "border-sky-500 bg-sky-50 dark:bg-gray-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600"
                              }`}
                              onClick={() => setSelectedSessionId(session._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                  <span className="font-medium text-black dark:text-white">
                                    {session.checkin} - {session.checkout}
                                  </span>
                                  {session.isActive && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      Live
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {session.currentToken}/{session.totalTokens} booked
                                  </span>
                                  <Badge
                                    className={`${
                                      session.currentToken >= session.totalTokens
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : "bg-green-100 text-green-800 border-green-200"
                                    }`}
                                  >
                                    {session.currentToken >= session.totalTokens ? "Full" : "Available"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Form */}
              {selectedSession && selectedSession.currentToken < selectedSession.totalTokens && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </Button>
                </form>
              )}

              {selectedSession && selectedSession.currentToken >= selectedSession.totalTokens && (
                <div className="text-center py-8">
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      This session is fully booked. Please select another session.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <Feature  />
      {/* Testimonials */}
      <TestimonialsSection isDark={darkMode} />

      {/* Footer */}
      <Footer isDark={darkMode} />
    </div>
  );
}
