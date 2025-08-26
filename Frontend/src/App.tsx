// // import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Home from './Home';
// import Dashboard from './Dashboard';

// const App: React.FC = () => {
//   return (
//     <Router>
//       <nav className="p-4 bg-blue-600 text-white flex gap-4">
//         <Link to="/">Home</Link>
//         <Link to="/dashboard">Dashboard</Link>
//       </nav>
//       <div className="p-4 max-w-4xl mx-auto">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import DoctorLogin from './components/DoctorLogin';
import Dashboard from './Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<DoctorLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
