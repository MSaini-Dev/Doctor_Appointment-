import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Play, Square, CheckCircle, AlertCircle, Home, CalendarDays, UserCheck } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
export default function Dashboard(): JSX.Element {
;
 const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(localStorage.getItem('activeTab') || 'overview');
  const [patients, setPatients] = useState<Array<any>>([]);
  const [sessions, setSessions] = useState<Array<any>>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionForm, setSessionForm] = useState<{ date: string; checkin: string; checkout: string; totalTokens: number }>({ date: '', checkin: '09:00', checkout: '17:00', totalTokens: 10 });
  // const [settings, setSettings] = useState<any | null>(null);
  const [holidays, setHolidays] = useState<Array<string>>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<Array<string>>([]);
  const [holidayDate, setHolidayDate] = useState<string>('');
  const [selectedWeeklyHoliday, setSelectedWeeklyHoliday] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const [liveSummary, setLiveSummary] = useState<any | null>(null);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchInitialData();
    fetchLiveSummary();
    const interval = setInterval(fetchLiveSummary, 30000);
    return () => clearInterval(interval);
  }, []);
 useEffect(() => {
  localStorage.setItem('activeTab', activeTab);
 },[activeTab])
  const fetchInitialData = async (): Promise<void> => {
    await Promise.all([
      fetchSessions(),
      fetchSettings()
    ]);
    setLoading(false);
  };

  const fetchLiveSummary = async (): Promise<void> => {
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/sessions/live-summary');
      const data = await res.json();
      setLiveSummary(data);
    } catch (error) {
      console.error('Failed to fetch live summary:', error);
    }
  };

  const fetchSessions = async (): Promise<void> => {
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/sessions');
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
        fetchPatients(data[0]._id);
      }
    } catch {
      // setError('Failed to load sessions');
      console.error('Failed to load sessions');
    }
  };

  const fetchSettings = async (): Promise<void> => {
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/settings');
      const data = await res.json();
      // setSettings(data);
      setHolidays(data.holidays || []);
      setWeeklyHolidays(data.weeklyHolidays || []);
    } catch {
      // setError('Failed to load settings');
      console.error('Failed to load settings');
    }
  };

  const fetchPatients = async (sessionId: string): Promise<void> => {
    if (!sessionId) return setPatients([]);
    try {
      const res = await fetch(`https://doctor-appointment-bfjd.onrender.com/patients?sessionId=${sessionId}`);
      const data = await res.json();
      setPatients(data);
    } catch {
      setPatients([]);
    }
  };

  // const handleSessionSelect = (session: any): void => {
  //   setSelectedSession(session);
  //   fetchPatients(session._id);
  // };

  const createSession = async (): Promise<void> => {
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      fetchSessions();
      setSessionForm({ date: '', checkin: '09:00', checkout: '17:00', totalTokens: 10 });
      alert('Session created successfully!');
    } catch {
      alert('Failed to create session');
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this session? This will also delete all associated patient bookings.')) return;
    
    try {
      const res = await fetch(`https://doctor-appointment-bfjd.onrender.com/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchSessions();
        if (selectedSession?._id === sessionId) {
          setSelectedSession(null);
          setPatients([]);
        }
        alert('Session deleted successfully!');
      }
    } catch {
      alert('Failed to delete session');
    }
  };

  const startSession = async (sessionId: string): Promise<void> => {
    try {
      const res = await fetch(`https://doctor-appointment-bfjd.onrender.com/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      fetchSessions();
      fetchLiveSummary();
      alert('Session started successfully!');
    } catch {
      alert('Failed to start session');
    }
  };

  const stopSession = async (sessionId: string): Promise<void> => {
    try {
      const res = await fetch(`https://doctor-appointment-bfjd.onrender.com/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchSessions();
        fetchLiveSummary();
        alert('Session stopped successfully!');
      }
    } catch {
      alert('Failed to stop session');
    }
  };

  const updatePatientStatus = async (patientId: string, status: string): Promise<void> => {
    try {
      const res = await fetch(`https://doctor-appointment-bfjd.onrender.com/patients/${patientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPatients(selectedSession._id);
        fetchLiveSummary();
      }
    } catch {
      alert('Failed to update patient status');
    }
  };

  const addHoliday = async (): Promise<void> => {
    if (!holidayDate) {
      alert('Please select a date');
      return;
    }
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: holidayDate }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        fetchSettings();
        fetchSessions();
        setHolidayDate('');
      }
    } catch {
      alert('Failed to add holiday');
    }
  };

  const deleteHoliday = async (date: string): Promise<void> => {
    try {
      await fetch(`https://doctor-appointment-bfjd.onrender.com/holidays/${date}`, { method: 'DELETE' });
      fetchSettings();
      fetchSessions();
    } catch {
      alert('Failed to remove holiday');
    }
  };

  const addWeeklyHoliday = async (): Promise<void> => {
    if (!selectedWeeklyHoliday) {
      alert('Please select a day');
      return;
    }
    try {
      const res = await fetch('https://doctor-appointment-bfjd.onrender.com/weekly-holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: selectedWeeklyHoliday }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        fetchSettings();
        fetchSessions();
        setSelectedWeeklyHoliday('');
      }
    } catch {
      alert('Failed to add weekly holiday');
    }
  };

  const deleteWeeklyHoliday = async (day: string): Promise<void> => {
    try {
      await fetch(`https://doctor-appointment-bfjd.onrender.com/weekly-holidays/${day}`, { method: 'DELETE' });
      fetchSettings();
      fetchSessions();
    } catch {
      alert('Failed to remove weekly holiday');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'complete': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }


return (
    <div className="flex min-h-screen bg-sky-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-xl border-r border-sky-100 flex-col justify-between min-h-screen">
        <div className="p-6 border-b border-sky-100 h-fit">
          <h1 className="text-2xl font-bold text-sky-900">Clinic Dashboard</h1>
          {liveSummary && (
            <div className="mt-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                liveSummary.todayStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                liveSummary.todayStatus === 'Holiday' ? 'bg-red-100 text-red-700' :
                'bg-sky-100 text-sky-700'
              }`}>
                {liveSummary.todayStatus === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus === 'Holiday' && <AlertCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus === 'Offline' && <AlertCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus}
              </span>
            </div>
          )}
        </div>
        
        <nav className="my-8 px-4 flex-1 flex  flex-col justify-between">
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'overview' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'sessions' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Clock className="w-5 h-5 mr-3" />
              Manage Sessions
            </button>
            
            <button
              onClick={() => setActiveTab('create-session')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'create-session' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              Create Session
            </button>
            
            <button
              onClick={() => setActiveTab('holidays')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'holidays' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Holiday Management
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'patients' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <UserCheck className="w-5 h-5 mr-3" />
              Patient Management
            </button>
          </div>
          <div>
            <button
            onClick={()=>{logout()}}
              className={`w-full flex items-center  justify-center bg-sky-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 `}

            >Logout</button>
          </div>
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sky-100 z-50">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'text-sky-600' 
                : 'text-sky-400 hover:text-sky-600'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex flex-col items-center px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === 'sessions' 
                ? 'text-sky-600' 
                : 'text-sky-400 hover:text-sky-600'
            }`}
          >
            <Clock className="w-5 h-5 mb-1" />
            Sessions
          </button>
          
          <button
            onClick={() => setActiveTab('create-session')}
            className={`flex flex-col items-center px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === 'create-session' 
                ? 'text-sky-600' 
                : 'text-sky-400 hover:text-sky-600'
            }`}
          >
            <Plus className="w-5 h-5 mb-1" />
            Create
          </button>
          
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex flex-col items-center px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === 'holidays' 
                ? 'text-sky-600' 
                : 'text-sky-400 hover:text-sky-600'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            Holidays
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex flex-col items-center px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === 'patients' 
                ? 'text-sky-600' 
                : 'text-sky-400 hover:text-sky-600'
            }`}
          >
            <UserCheck className="w-5 h-5 mb-1" />
            Patients
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto mb-20 lg:mb-0">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Dashboard Overview</h2>
              <div className="text-sm text-sky-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-sky-100">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-sky-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-sky-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-sky-900">{sessions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-sky-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-sky-900">
                      {sessions.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-sky-600">Total Patients</p>
                    <p className="text-2xl font-bold text-sky-900">{patients.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <CalendarDays className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-sky-600">Holidays</p>
                    <p className="text-2xl font-bold text-sky-900">
                      {holidays.length + weeklyHolidays.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Session Info */}
            {liveSummary?.liveSession && (
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
                <h3 className="text-lg font-bold text-sky-900 mb-4">Live Session Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-sky-600 mb-1">Session Date</p>
                    <p className="text-lg font-bold text-sky-900">{liveSummary.liveSession.date}</p>
                  </div>
                  <div className="text-center p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-sky-600 mb-1">Time</p>
                    <p className="text-lg font-bold text-sky-900">
                      {liveSummary.liveSession.checkin} - {liveSummary.liveSession.checkout}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-sky-600 mb-1">Completed Patients</p>
                    <p className="text-lg font-bold text-sky-900">{liveSummary.completedPatients}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
              <div className="p-6 border-b border-sky-100">
                <h3 className="text-lg font-bold text-sky-900">Recent Sessions</h3>
              </div>
              <div className="p-6">
                {sessions.slice(0, 5).map(session => (
                  <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-sky-50 last:border-b-0 gap-3">
                    <div>
                      <p className="font-semibold text-sky-900">{session.date}</p>
                      <p className="text-sm text-sky-600">{session.checkin} - {session.checkout}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        session.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {session.isActive ? 'Active' : 'Scheduled'}
                      </span>
                      <p className="text-sm text-sky-600 font-medium">
                        {session.currentToken}/{session.totalTokens} tokens
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-sky-500 py-8">No sessions scheduled</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sessions Management Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Manage Sessions</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sky-100">
                  <thead className="bg-sky-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Tokens
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-sky-50">
                    {sessions.map(session => (
                      <tr key={session._id} className="hover:bg-sky-25">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-sky-900">{session.date}</div>
                            <div className="text-sm text-sky-600">{session.checkin} - {session.checkout}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-sky-900">
                            {session.currentToken} / {session.totalTokens}
                          </div>
                          <div className="w-full bg-sky-100 rounded-full h-2 mt-2">
                            <div 
                              className="bg-sky-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(session.currentToken / session.totalTokens) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            session.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                          }`}>
                            {session.isActive ? 'Active' : 'Scheduled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {session.isActive ? (
                            <button
                              onClick={() => stopSession(session._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                            >
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => startSession(session._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => deleteSession(session._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sessions.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-sky-300 mx-auto mb-4" />
                    <p className="text-sky-500">No sessions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Session Tab */}
        {activeTab === 'create-session' && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Create New Session</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 max-w-md mx-auto">
              <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); createSession(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-sky-700 mb-2">
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-sky-700 mb-2">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={sessionForm.checkin}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm(prev => ({ ...prev, checkin: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-sky-700 mb-2">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={sessionForm.checkout}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm(prev => ({ ...prev, checkout: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-sky-700 mb-2">
                    Total Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sessionForm.totalTokens}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm(prev => ({ ...prev, totalTokens: parseInt(e.target.value) }))}
                    required
                    className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-sky-500 text-white py-3 px-4 rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors font-semibold"
                >
                  Create Session
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Holiday Management Tab */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Holiday Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Specific Date Holidays */}
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
                <h3 className="text-lg font-bold text-sky-900 mb-4">Specific Date Holidays</h3>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHolidayDate(e.target.value)}
                    className="flex-1 px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    onClick={addHoliday}
                    className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors font-semibold"
                  >
                    Add
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {holidays.length === 0 && (
                    <p className="text-sm text-sky-500 text-center py-8">No specific holidays set</p>
                  )}
                  {holidays.map(date => (
                    <div key={date} className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                      <span className="text-sm font-semibold text-sky-900">{date}</span>
                      <button
                        onClick={() => deleteHoliday(date)}
                        className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Holidays */}
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
                <h3 className="text-lg font-bold text-sky-900 mb-4">Weekly Holidays</h3>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                  <select
                    value={selectedWeeklyHoliday}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedWeeklyHoliday(e.target.value)}
                    className="flex-1 px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Select a day</option>
                    {weekDays.filter(day => !weeklyHolidays.includes(day)).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <button
                    onClick={addWeeklyHoliday}
                    disabled={!selectedWeeklyHoliday}
                    className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:bg-sky-300 font-semibold"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-3">
                  {weeklyHolidays.length === 0 && (
                    <p className="text-sm text-sky-500 text-center py-8">No weekly holidays set</p>
                  )}
                  {weeklyHolidays.map(day => (
                    <div key={day} className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                      <span className="text-sm font-semibold text-sky-900">Every {day}</span>
                      <button
                        onClick={() => deleteWeeklyHoliday(day)}
                        className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Management Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Patient Management</h2>
              <div className="flex items-center">
                <select
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const session = sessions.find(s => s._id === e.target.value);
                    if (session) {
                      setSelectedSession(session);
                      fetchPatients(session._id);
                    }
                  }}
                  className="px-4 py-3 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent min-w-0"
                  value={selectedSession?._id || ''}
                >
                  <option value="">Select a session</option>
                  {sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      {session.date} ({session.checkin} - {session.checkout})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSession ? (
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-sky-900">
                        Session: {selectedSession.date}
                      </h3>
                      <p className="text-sm text-sky-600">
                        {selectedSession.checkin} - {selectedSession.checkout}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedSession.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {selectedSession.isActive ? 'Active' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-sky-100">
                    <thead className="bg-sky-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-sky-50">
                      {patients.map(patient => (
                        <tr key={patient._id} className="hover:bg-sky-25">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-900">
                            #{patient.tokenNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-900">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-600">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-wrap gap-2">
                              {patient.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updatePatientStatus(patient._id, 'complete')}
                                    className="text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => updatePatientStatus(patient._id, 'cancelled')}
                                    className="text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors font-semibold"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {patient.status === 'complete' && (
                                <button
                                  onClick={() => updatePatientStatus(patient._id, 'pending')}
                                  className="text-amber-600 hover:text-amber-800 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                                >
                                  Revert
                                </button>
                              )}
                              {patient.status === 'cancelled' && (
                                <button
                                  onClick={() => updatePatientStatus(patient._id, 'pending')}
                                  className="text-amber-600 hover:text-amber-800 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                                >
                                  Restore
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {patients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-sky-300 mx-auto mb-4" />
                      <p className="text-sky-500">No patients found for this session</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-12 text-center">
                <Users className="w-16 h-16 text-sky-300 mx-auto mb-4" />
                <p className="text-sky-500 text-lg">Please select a session to view patients</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

}
