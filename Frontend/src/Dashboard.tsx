import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Phone, Settings, Plus, Trash2, Play, Square, CheckCircle, AlertCircle, Home, CalendarDays, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({ date: '', checkin: '09:00', checkout: '17:00', totalTokens: 10 });
  const [settings, setSettings] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [selectedWeeklyHoliday, setSelectedWeeklyHoliday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveSummary, setLiveSummary] = useState(null);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchInitialData();
    fetchLiveSummary();
    const interval = setInterval(fetchLiveSummary, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchSessions(),
      fetchSettings()
    ]);
    setLoading(false);
  };

  const fetchLiveSummary = async () => {
    try {
      const res = await fetch('http://localhost:4000/sessions/live-summary');
      const data = await res.json();
      setLiveSummary(data);
    } catch (error) {
      console.error('Failed to fetch live summary:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:4000/sessions');
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
        fetchPatients(data[0]._id);
      }
    } catch {
      setError('Failed to load sessions');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:4000/settings');
      const data = await res.json();
      setSettings(data);
      setHolidays(data.holidays || []);
      setWeeklyHolidays(data.weeklyHolidays || []);
    } catch {
      setError('Failed to load settings');
    }
  };

  const fetchPatients = async (sessionId) => {
    if (!sessionId) return setPatients([]);
    try {
      const res = await fetch(`http://localhost:4000/patients?sessionId=${sessionId}`);
      const data = await res.json();
      setPatients(data);
    } catch {
      setPatients([]);
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    fetchPatients(session._id);
  };

  const createSession = async () => {
    try {
      const res = await fetch('http://localhost:4000/sessions', {
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

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This will also delete all associated patient bookings.')) return;
    
    try {
      const res = await fetch(`http://localhost:4000/sessions/${sessionId}`, {
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

  const startSession = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:4000/sessions/${sessionId}/start`, {
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

  const stopSession = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:4000/sessions/${sessionId}/stop`, {
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

  const updatePatientStatus = async (patientId, status) => {
    try {
      const res = await fetch(`http://localhost:4000/patients/${patientId}/status`, {
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

  const addHoliday = async () => {
    if (!holidayDate) {
      alert('Please select a date');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/holidays', {
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

  const deleteHoliday = async (date) => {
    try {
      await fetch(`http://localhost:4000/holidays/${date}`, { method: 'DELETE' });
      fetchSettings();
      fetchSessions();
    } catch {
      alert('Failed to remove holiday');
    }
  };

  const addWeeklyHoliday = async () => {
    if (!selectedWeeklyHoliday) {
      alert('Please select a day');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/weekly-holidays', {
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

  const deleteWeeklyHoliday = async (day) => {
    try {
      await fetch(`http://localhost:4000/weekly-holidays/${day}`, { method: 'DELETE' });
      fetchSettings();
      fetchSessions();
    } catch {
      alert('Failed to remove weekly holiday');
    }
  };

  const getStatusColor = (status) => {
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Clinic Dashboard</h1>
          {liveSummary && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                liveSummary.todayStatus === 'Active' ? 'bg-green-100 text-green-800' :
                liveSummary.todayStatus === 'Holiday' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {liveSummary.todayStatus === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus === 'Holiday' && <AlertCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus === 'Offline' && <AlertCircle className="w-3 h-3 mr-1" />}
                {liveSummary.todayStatus}
              </span>
            </div>
          )}
        </div>
        
        <nav className="mt-6">
          <div className="px-6 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'sessions' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-5 h-5 mr-3" />
              Manage Sessions
            </button>
            
            <button
              onClick={() => setActiveTab('create-session')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'create-session' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              Create Session
            </button>
            
            <button
              onClick={() => setActiveTab('holidays')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'holidays' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Holiday Management
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'patients' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-5 h-5 mr-3" />
              Patient Management
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">{sessions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sessions.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CalendarDays className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Holidays</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {holidays.length + weeklyHolidays.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Session Info */}
            {liveSummary?.liveSession && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Session Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Session Date</p>
                    <p className="text-lg font-semibold">{liveSummary.liveSession.date}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-lg font-semibold">
                      {liveSummary.liveSession.checkin} - {liveSummary.liveSession.checkout}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Completed Patients</p>
                    <p className="text-lg font-semibold">{liveSummary.completedPatients}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Recent Sessions</h3>
              </div>
              <div className="p-6">
                {sessions.slice(0, 5).map(session => (
                  <div key={session._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{session.date}</p>
                      <p className="text-sm text-gray-500">{session.checkin} - {session.checkout}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Scheduled'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.currentToken}/{session.totalTokens} tokens
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No sessions scheduled</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sessions Management Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Sessions</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tokens
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map(session => (
                      <tr key={session._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{session.date}</div>
                            <div className="text-sm text-gray-500">{session.checkin} - {session.checkout}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {session.currentToken} / {session.totalTokens}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(session.currentToken / session.totalTokens) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.isActive ? 'Active' : 'Scheduled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {session.isActive ? (
                            <button
                              onClick={() => stopSession(session._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => startSession(session._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => deleteSession(session._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
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
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No sessions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Session Tab */}
        {activeTab === 'create-session' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Session</h2>
            
            <div className="bg-white rounded-lg shadow p-6 max-w-md">
              <form onSubmit={(e) => { e.preventDefault(); createSession(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={sessionForm.checkin}
                      onChange={(e) => setSessionForm(prev => ({ ...prev, checkin: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={sessionForm.checkout}
                      onChange={(e) => setSessionForm(prev => ({ ...prev, checkout: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sessionForm.totalTokens}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, totalTokens: parseInt(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
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
            <h2 className="text-2xl font-bold text-gray-800">Holiday Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Specific Date Holidays */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specific Date Holidays</h3>
                
                <div className="flex space-x-3 mb-4">
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addHoliday}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {holidays.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No specific holidays set</p>
                  )}
                  {holidays.map(date => (
                    <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{date}</span>
                      <button
                        onClick={() => deleteHoliday(date)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Holidays */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Holidays</h3>
                
                <div className="flex space-x-3 mb-4">
                  <select
                    value={selectedWeeklyHoliday}
                    onChange={(e) => setSelectedWeeklyHoliday(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a day</option>
                    {weekDays.filter(day => !weeklyHolidays.includes(day)).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <button
                    onClick={addWeeklyHoliday}
                    disabled={!selectedWeeklyHoliday}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {weeklyHolidays.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No weekly holidays set</p>
                  )}
                  {weeklyHolidays.map(day => (
                    <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Every {day}</span>
                      <button
                        onClick={() => deleteWeeklyHoliday(day)}
                        className="text-red-600 hover:text-red-800 p-1"
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
              <div className="flex items-center space-x-4">
                <select
                  onChange={(e) => {
                    const session = sessions.find(s => s._id === e.target.value);
                    if (session) {
                      setSelectedSession(session);
                      fetchPatients(session._id);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Session: {selectedSession.date}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedSession.checkin} - {selectedSession.checkout}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedSession.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedSession.isActive ? 'Active' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map(patient => (
                        <tr key={patient._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{patient.tokenNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {patient.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updatePatientStatus(patient._id, 'complete')}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => updatePatientStatus(patient._id, 'cancelled')}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {patient.status === 'complete' && (
                                <button
                                  onClick={() => updatePatientStatus(patient._id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-800"
                                >
                                  Revert
                                </button>
                              )}
                              {patient.status === 'cancelled' && (
                                <button
                                  onClick={() => updatePatientStatus(patient._id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-800"
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
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients found for this session</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select a session to view patients</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}