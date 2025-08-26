// import React, { useEffect, useState } from 'react';
// import { Calendar, Clock, Users, Phone, User, MapPin, Award, Stethoscope, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// export default function DoctorPortfolio() {
//   const [sessions, setSessions] = useState([]);
//   const [selectedSessionId, setSelectedSessionId] = useState('');
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [form, setForm] = useState({ name: '', phone: '' });
//   const [token, setToken] = useState(null);
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [liveSummary, setLiveSummary] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);

//   // Apply theme to document
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [darkMode]);

//   useEffect(() => {
//     async function fetchLiveSummary() {
//       try {
//         const res = await fetch('http://localhost:4000/sessions/live-summary');
//         const data = await res.json();
//         setLiveSummary(data);
//       } catch {
//         // Handle error silently
//       }
//     }
//     fetchLiveSummary();
//     const interval = setInterval(fetchLiveSummary, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     async function fetchSessions() {
//       try {
//         const res = await fetch('http://localhost:4000/sessions');
//         const data = await res.json();
//         setSessions(data);
//         if (data.length > 0) {
//           setSelectedSessionId(data[0]._id);
//           setSelectedSession(data[0]);
//         }
//       } catch {
//         setError('Failed to load sessions');
//       }
//       setLoading(false);
//     }
//     fetchSessions();
//   }, []);

//   useEffect(() => {
//     const session = sessions.find(s => s._id === selectedSessionId);
//     setSelectedSession(session || null);
//   }, [selectedSessionId, sessions]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//     setError(null);
//     setToken(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedSession) {
//       setError('Please select a session first.');
//       return;
//     }
//     if (!form.name.trim() || !form.phone.trim()) {
//       setError('Please fill all fields');
//       return;
//     }
//     setSubmitting(true);
//     setError(null);
//     try {
//       const res = await fetch('http://localhost:4000/patient', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: form.name.trim(),
//           phone: form.phone.trim(),
//           sessionId: selectedSession._id,
//         }),
//       });
//       const data = await res.json();
//       setToken(data.tokenNo);
//       setForm({ name: '', phone: '' });

//       // Refresh sessions
//       const sessionsRes = await fetch('http://localhost:4000/sessions');
//       const sessionsData = await sessionsRes.json();
//       setSessions(sessionsData);
//       const updatedSession = sessionsData.find(s => s._id === selectedSessionId);
//       setSelectedSession(updatedSession || null);
//     } catch {
//       setError('Failed to register for session');
//     }
//     setSubmitting(false);
//   };

//   // Group sessions by date
//   const sessionsByDate = sessions.reduce((acc, session) => {
//     const date = session.date;
//     if (!acc[date]) {
//       acc[date] = [];
//     }
//     acc[date].push(session);
//     return acc;
//   }, {});

//   if (loading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="text-center">
//           <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
//           <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading sessions...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
//       {/* Navigation */}
//       <nav className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="flex-shrink-0">
//                 <Stethoscope className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//               </div>
//               <div>
//                 <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dr. Sarah Johnson</h1>
//                 <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Internal Medicine Specialist</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               {liveSummary && liveSummary.liveSession ? (
//                 <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                   <CheckCircle className="h-3 w-3 mr-1" />
//                   Available
//                 </Badge>
//               ) : (
//                 <Badge variant="outline" className={`${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-300'}`}>
//                   <AlertCircle className="h-3 w-3 mr-1" />
//                   Offline
//                 </Badge>
//               )}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setDarkMode(!darkMode)}
//                 className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
//               >
//                 {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Hero Section */}
//         <section className="mb-12">
//           <div className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
//             <div className="md:flex">
//               <div className="md:w-1/3">
//                 <img 
//                   src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop&crop=face" 
//                   alt="Dr. Sarah Johnson"
//                   className="w-full h-64 md:h-full object-cover"
//                 />
//               </div>
//               <div className="md:w-2/3 p-6 md:p-8">
//                 <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to My Practice</h2>
//                 <p className={`mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                   With over 15 years of experience in internal medicine, I am dedicated to providing 
//                   comprehensive healthcare services. I specialize in preventive care, chronic disease 
//                   management, and wellness optimization for patients of all ages.
//                 </p>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="flex items-center space-x-2">
//                     <Award className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Board Certified Internal Medicine</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <MapPin className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Downtown Medical Center</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Users className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>15+ Years Experience</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Phone className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>(555) 123-4567</span>
//                   </div>
//                 </div>

//                 <Button 
//                   onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
//                   className={`transition-colors duration-300 ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
//                 >
//                   Book Appointment
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Live Status */}
//         {liveSummary && liveSummary.liveSession && (
//           <section className="mb-8">
//             <Alert className={`transition-colors duration-300 ${darkMode ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
//               <CheckCircle className="h-4 w-4 text-green-600" />
//               <AlertDescription className={darkMode ? 'text-green-300' : 'text-green-800'}>
//                 <strong>Live Session Active:</strong> {liveSummary.liveSession.date} 
//                 ({liveSummary.liveSession.checkin} - {liveSummary.liveSession.checkout}) • 
//                 Patients Completed: {liveSummary.completedPatients}
//               </AlertDescription>
//             </Alert>
//           </section>
//         )}

//         {/* Booking Section */}
//         <section id="booking-section" className="mb-12">
//           <Card className={`max-w-md mx-auto transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
//             <CardHeader>
//               <CardTitle className={`flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                 <Calendar className="h-5 w-5" />
//                 <span>Book Your Appointment</span>
//               </CardTitle>
//               <CardDescription className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
//                 Select a session and register for your appointment
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Select Session
//                 </label>
//                 <select
//                   value={selectedSessionId}
//                   onChange={(e) => setSelectedSessionId(e.target.value)}
//                   className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
//                     darkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   }`}
//                 >
//                   {sessions.map(session => (
//                     <option key={session._id} value={session._id}>
//                       {session.date} ({session.checkin} - {session.checkout})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedSession && (
//                 <div className={`p-3 rounded-md transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                   <div className="flex justify-between items-center mb-2">
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available Tokens:</span>
//                     <Badge variant="outline" className={darkMode ? 'border-gray-500 text-gray-300' : ''}>
//                       {selectedSession.totalTokens - selectedSession.currentToken}
//                     </Badge>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status:</span>
//                     <Badge variant={selectedSession.isActive ? "default" : "secondary"}>
//                       {selectedSession.isActive ? 'Active' : 'Inactive'}
//                     </Badge>
//                   </div>
//                   {selectedSession.totalTokens - selectedSession.currentToken <= 0 && (
//                     <p className="text-red-500 text-sm mt-2">No tokens available for this session</p>
//                   )}
//                 </div>
//               )}

//               <div onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <Input
//                     type="text"
//                     name="name"
//                     placeholder="Your Full Name"
//                     value={form.name}
//                     onChange={handleInputChange}
//                     required
//                     disabled={submitting}
//                     className={`transition-colors duration-300 ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     type="tel"
//                     name="phone"
//                     placeholder="Phone Number"
//                     value={form.phone}
//                     onChange={handleInputChange}
//                     required
//                     disabled={submitting}
//                     className={`transition-colors duration-300 ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     }`}
//                   />
//                 </div>
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={submitting || (selectedSession && (selectedSession.totalTokens - selectedSession.currentToken <= 0))}
//                   className={`w-full transition-colors duration-300 ${
//                     darkMode 
//                       ? 'bg-blue-500 hover:bg-blue-600 text-white' 
//                       : 'bg-blue-600 hover:bg-blue-700 text-white'
//                   }`}
//                 >
//                   {submitting ? 'Booking...' : 'Book Appointment'}
//                 </Button>
//               </div>

//               {error && (
//                 <Alert variant="destructive" className={darkMode ? 'bg-red-900/20 border-red-800' : ''}>
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription className={darkMode ? 'text-red-300' : ''}>{error}</AlertDescription>
//                 </Alert>
//               )}

//               {token && (
//                 <Alert className={`transition-colors duration-300 ${darkMode ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                   <AlertDescription className={darkMode ? 'text-green-300' : 'text-green-800'}>
//                     <strong>Booking Confirmed!</strong> Your token number is: <strong>{token}</strong>
//                   </AlertDescription>
//                 </Alert>
//               )}
//             </CardContent>
//           </Card>
//         </section>

//         {/* Sessions by Date */}
//         <section>
//           <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Available Sessions</h2>
//           <div className="space-y-6">
//             {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
//               <Card key={date} className={`transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
//                 <CardHeader>
//                   <CardTitle className={`flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                     <Calendar className="h-5 w-5" />
//                     <span>{date}</span>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {dateSessions.map(session => (
//                       <div key={session._id} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
//                         darkMode 
//                           ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
//                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                       }`}>
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-2">
//                             <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
//                             <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
//                               {session.checkin} - {session.checkout}
//                             </span>
//                           </div>
//                           <Badge variant={session.isActive ? "default" : "secondary"}>
//                             {session.isActive ? 'Live' : 'Scheduled'}
//                           </Badge>
//                         </div>
                        
//                         <div className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Available:</span>
//                             <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
//                               {session.totalTokens - session.currentToken}/{session.totalTokens}
//                             </span>
//                           </div>
//                           <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
//                             <div 
//                               className={`h-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
//                               style={{ 
//                                 width: `${((session.totalTokens - session.currentToken) / session.totalTokens) * 100}%` 
//                               }}
//                             ></div>
//                           </div>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className={`w-full mt-3 transition-colors duration-300 ${
//                               darkMode 
//                                 ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
//                                 : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                             }`}
//                             disabled={session.totalTokens - session.currentToken <= 0}
//                             onClick={() => {
//                               setSelectedSessionId(session._id);
//                               document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
//                             }}
//                           >
//                             {session.totalTokens - session.currentToken <= 0 ? 'Full' : 'Select Session'}
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
          
//           {Object.keys(sessionsByDate).length === 0 && (
//             <Card className={`transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
//               <CardContent className="text-center py-8">
//                 <Calendar className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                 <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>No sessions available at the moment.</p>
//                 <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please check back later or contact us directly.</p>
//               </CardContent>
//             </Card>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Phone, User, MapPin, Award, Stethoscope, CheckCircle, AlertCircle, Moon, Sun, Star, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DoctorPortfolio() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveSummary, setLiveSummary] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    async function fetchLiveSummary() {
      try {
        const res = await fetch('http://localhost:4000/sessions/live-summary');
        const data = await res.json();
        setLiveSummary(data);
      } catch {
        // Handle error silently
      }
    }
    fetchLiveSummary();
    const interval = setInterval(fetchLiveSummary, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('http://localhost:4000/sessions');
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0]._id);
          setSelectedSession(data[0]);
        }
      } catch {
        setError('Failed to load sessions');
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    const session = sessions.find(s => s._id === selectedSessionId);
    setSelectedSession(session || null);
  }, [selectedSessionId, sessions]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, [name]: digitsOnly }));
      
      if (digitsOnly.length > 0) {
        validatePhoneNumber(digitsOnly);
      } else {
        setPhoneError('');
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
    setToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSession) {
      setError('Please select a session first.');
      return;
    }
    
    if (!form.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!validatePhoneNumber(form.phone)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:4000/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        setForm({ name: '', phone: '' });
        setPhoneError('');
        // Refresh sessions to get updated token counts
        const sessionsRes = await fetch('http://localhost:4000/sessions');
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
        const updatedSession = sessionsData.find(s => s._id === selectedSessionId);
        setSelectedSession(updatedSession || null);
      }
    } catch {
      setError('Failed to book appointment. Please try again.');
    }
    
    setSubmitting(false);
  };

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  const getClinicStatus = () => {
    if (!liveSummary) return { status: 'Loading...', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    
    if (liveSummary.isTodayHoliday) {
      return { status: 'Holiday', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    
    if (liveSummary.liveSession) {
      return { status: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    
    return { status: 'Offline', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  const clinicStatus = getClinicStatus();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading clinic information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Stethoscope className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dr. Smith's Clinic
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Quality Healthcare Services
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`${clinicStatus.color} flex items-center space-x-1`}>
                <clinicStatus.icon className="h-3 w-3" />
                <span>{clinicStatus.status}</span>
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <Star className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <Star className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <Star className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <Star className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Dr. Smith's Clinic
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-3xl mx-auto`}>
              Providing exceptional healthcare services with a focus on patient comfort and comprehensive care. 
              Book your appointment online and experience quality medical treatment.
            </p>
            
            {liveSummary?.liveSession && (
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Currently accepting patients • {liveSummary.completedPatients} patients served today
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader className="text-center">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <User className={`h-12 w-12 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <CardTitle className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dr. Smith</CardTitle>
                <CardDescription className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  General Practitioner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>15+ years experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Board Certified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient-focused care</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Downtown Medical Center</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>+1 (555) 123-4567</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-2">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Calendar className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span>Book Your Appointment</span>
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Select a session and provide your details to book an appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Message */}
                {token && (
                  <Alert className={`border-green-200 ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50'}`}>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Appointment booked successfully! Your token number is <span className="font-bold">#{token}</span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {error && (
                  <Alert className={`border-red-200 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50'}`}>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className={`${darkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Available Sessions */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Available Sessions</h3>
                  
                  {Object.keys(sessionsByDate).length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No sessions available at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                        <div key={date} className="space-y-2">
                          <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {dateSessions.map((session) => (
                              <div
                                key={session._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedSessionId === session._id
                                    ? darkMode
                                      ? 'border-blue-500 bg-blue-900/20'
                                      : 'border-blue-500 bg-blue-50'
                                    : darkMode
                                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                }`}
                                onClick={() => setSelectedSessionId(session._id)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {session.checkin} - {session.checkout}
                                    </span>
                                  </div>
                                  {session.isActive && (
                                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Users className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {session.currentToken}/{session.totalTokens} booked
                                    </span>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    session.currentToken >= session.totalTokens
                                      ? darkMode
                                        ? 'bg-red-900/50 text-red-300'
                                        : 'bg-red-100 text-red-800'
                                      : darkMode
                                      ? 'bg-green-900/50 text-green-300'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {session.currentToken >= session.totalTokens ? 'Full' : 'Available'}
                                  </span>
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          placeholder="1234567890"
                          required
                          className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} ${
                            phoneError ? 'border-red-500' : ''
                          }`}
                        />
                        {phoneError && (
                          <p className="text-sm text-red-600">{phoneError}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={submitting || !form.name || !form.phone || phoneError}
                      className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {submitting ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  </form>
                )}

                {selectedSession && selectedSession.currentToken >= selectedSession.totalTokens && (
                  <Alert className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className={`${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      This session is fully booked. Please select another session.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 Dr. Smith's Clinic. All rights reserved.
            </p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              For emergencies, please call 911 or visit the nearest emergency room.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
