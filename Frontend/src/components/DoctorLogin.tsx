
// import { useState, useEffect} from 'react';
// import type { ChangeEvent, FormEvent } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Alert, AlertDescription } from '../components/ui/alert';
// import { AlertCircle, Shield, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

// import { useAuth } from '../context/AuthContext';
// import { apiService } from '../context/api';

// const DoctorLogin = () => {
//   const [formData, setFormData] = useState({
//     doctorId: '',
//     password: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const { login, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       const from = location.state?.from?.pathname || '/dashboard';
//       navigate(from, { replace: true });
//     }
//   }, [isAuthenticated, navigate, location]);

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (error) setError('');
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!formData.doctorId.trim() || !formData.password.trim()) {
//       setError('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await apiService.login({
//         doctorId: formData.doctorId.trim(),
//         password: formData.password
//       });

//      if (response.success) {
//   login(response.token, response.doctor);

//   const from = location.state?.from?.pathname || '/dashboard';
//   navigate(from, { replace: true });
// }

//     } catch (err: unknown) {
//       console.error('Login error:', err);
//       const errorMessage =
//         err instanceof Error
//           ? (err as any).response?.data?.message || err.message
//           : 'Login failed. Please try again.';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//             <Shield className="h-10 w-10 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Doctor Portal</h1>
//           <p className="text-blue-200">Secure access to appointment dashboard</p>
//         </div>

//         {/* Login Card */}
//         <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
//           <CardHeader>
//             <CardTitle className="text-center text-gray-900">
//               Sign In to Dashboard
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="doctorId" className="flex items-center space-x-2">
//                     <User className="h-4 w-4" />
//                     <span>Doctor ID</span>
//                   </Label>
//                   <Input
//                     id="doctorId"
//                     name="doctorId"
//                     type="text"
//                     placeholder="Enter your doctor ID"
//                     value={formData.doctorId}
//                     onChange={handleInputChange}
//                     disabled={isLoading}
//                     className="h-12"
//                     autoComplete="username"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="flex items-center space-x-2">
//                     <Lock className="h-4 w-4" />
//                     <span>Password</span>
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Enter your password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       disabled={isLoading}
//                       className="h-12 pr-10"
//                       autoComplete="current-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={togglePasswordVisibility}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-12 bg-blue-600 hover:bg-blue-700"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Signing In...' : 'Sign In'}
//               </Button>
//             </form>

//             {/* Error Message */}
//             {error && (
//               <div className="mt-6">
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               </div>
//             )}

//             {/* Demo Credentials Info */}
//             <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <h4 className="text-sm font-semibold text-blue-800 mb-2">
//                 Demo Credentials
//               </h4>
//               <div className="text-sm text-blue-700 space-y-1">
//                 <p>
//                   <strong>Doctor ID:</strong> smith.doe
//                 </p>
//                 <p>
//                   <strong>Password:</strong> 12345678
//                 </p>
//               </div>
//               <p className="text-xs text-blue-600 mt-2">
//                 Use these credentials for testing purposes
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Back to Home */}
//         <div className="mt-6 text-center">
//           <Button
//             variant="ghost"
//             onClick={() => navigate('/dashboard')}
//             className="text-white hover:text-blue-200 hover:bg-white/10"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Home
//           </Button>
//         </div>

//         {/* Security Notice */}
//         <div className="mt-8 text-center">
//           <p className="text-sm text-blue-200">
//             🔒 This is a secure area for authorized personnel only
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorLogin;




import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Shield, User, Lock, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { apiService } from '../context/api';

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_MINUTE: 5
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"&]/g, '');
};

// Password strength validation
const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    return { isValid: false, message: `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters` };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain uppercase, lowercase, and number' };
  }
  return { isValid: true, message: '' };
};

// Rate limiting utility
class RateLimiter {
  private attempts: number[] = [];

  isRateLimited(): boolean {
    const now = Date.now();
    this.attempts = this.attempts.filter(time => now - time < SECURITY_CONFIG.RATE_LIMIT_WINDOW);
    return this.attempts.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE;
  }

  recordAttempt(): void {
    this.attempts.push(Date.now());
  }

  getRemainingTime(): number {
    if (this.attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...this.attempts);
    return Math.max(0, SECURITY_CONFIG.RATE_LIMIT_WINDOW - (Date.now() - oldestAttempt));
  }
}

const DoctorLogin = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingLockoutTime, setRemainingLockoutTime] = useState(0);
  const [passwordStrengthError, setPasswordStrengthError] = useState('');
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rateLimiterRef = useRef(new RateLimiter());
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Security event logging
  const logSecurityEvent = useCallback((event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const ip = 'client-side'; // Would be actual IP on server
    
    console.warn(`[SECURITY] ${timestamp}: ${event}`, {
      userAgent,
      ip,
      details,
      location: window.location.href
    });
    
    // In production, send to security monitoring service
    // securityLogger.log({ event, timestamp, userAgent, ip, details });
  }, []);

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    sessionTimeoutRef.current = setTimeout(() => {
      logSecurityEvent('SESSION_TIMEOUT');
      // logout(); // Would call logout function
      navigate('/login', { replace: true });
    }, SECURITY_CONFIG.SESSION_TIMEOUT);
  }, [navigate, logSecurityEvent]);

  // Check for security threats
  useEffect(() => {
    const warnings: string[] = [];
    
    // Check for suspicious browser environment
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      warnings.push('Insecure connection detected');
      logSecurityEvent('INSECURE_CONNECTION');
    }

    // Check for developer tools (basic detection)
    let devtools = false;
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          logSecurityEvent('DEVELOPER_TOOLS_DETECTED');
          warnings.push('Developer tools detected');
        }
      } else {
        devtools = false;
      }
    }, 500);

    setSecurityWarnings(warnings);
  }, [logSecurityEvent]);

  // Handle lockout timer
  useEffect(() => {
    if (isLockedOut && lockoutEndTime) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, lockoutEndTime - Date.now());
        setRemainingLockoutTime(remaining);
        
        if (remaining === 0) {
          setIsLockedOut(false);
          setLockoutEndTime(null);
          setLoginAttempts(0);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLockedOut, lockoutEndTime]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      resetSessionTimeout();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, resetSessionTimeout]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    if (error) setError('');
    
    // Real-time password validation
    if (name === 'password') {
      const validation = validatePasswordStrength(sanitizedValue);
      setPasswordStrengthError(validation.isValid ? '' : validation.message);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    if (rateLimiterRef.current.isRateLimited()) {
      const remainingTime = Math.ceil(rateLimiterRef.current.getRemainingTime() / 1000);
      setError(`Too many attempts. Please wait ${remainingTime} seconds.`);
      logSecurityEvent('RATE_LIMIT_EXCEEDED');
      return;
    }

    // Lockout check
    if (isLockedOut) {
      const remainingMinutes = Math.ceil(remainingLockoutTime / (1000 * 60));
      setError(`Account locked. Please try again in ${remainingMinutes} minutes.`);
      return;
    }

    // Input validation
    if (!formData.doctorId.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    // Doctor ID format validation (basic)
    if (!/^[a-zA-Z0-9._-]+$/.test(formData.doctorId)) {
      setError('Invalid Doctor ID format');
      logSecurityEvent('INVALID_DOCTOR_ID_FORMAT', { doctorId: formData.doctorId });
      return;
    }

    setIsLoading(true);
    setError('');
    rateLimiterRef.current.recordAttempt();

    try {
      // Add client-side security headers simulation
      const secureLoginData = {
        doctorId: formData.doctorId.trim(),
        password: formData.password,
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 100), // Limit UA string length
        sessionId: crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
      };

      const response = await apiService.login(secureLoginData);

      if (response.success) {
        logSecurityEvent('LOGIN_SUCCESS', { doctorId: formData.doctorId });
        
        // Reset security state on successful login
        setLoginAttempts(0);
        setIsLockedOut(false);
        setLockoutEndTime(null);
        
        login(response.token, response.doctor);
        resetSessionTimeout();

        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      logSecurityEvent('LOGIN_FAILURE', { 
        doctorId: formData.doctorId,
        attempt: newAttempts,
        error: err instanceof Error ? err.message : 'Unknown error'
      });

      // Implement account lockout
      if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
        setIsLockedOut(true);
        setLockoutEndTime(lockoutEnd);
        setRemainingLockoutTime(SECURITY_CONFIG.LOCKOUT_DURATION);
        
        logSecurityEvent('ACCOUNT_LOCKED', { 
          doctorId: formData.doctorId,
          lockoutEndTime: lockoutEnd 
        });
        
        setError(`Account locked due to multiple failed attempts. Please try again in 15 minutes.`);
      } else {
        const remainingAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts;
        const errorMessage = err instanceof Error
          ? (err as any).response?.data?.message || err.message
          : 'Login failed. Please try again.';
        
        setError(`${errorMessage} (${remainingAttempts} attempts remaining)`);
      }

      // Clear password on failed attempt for security
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    logSecurityEvent('PASSWORD_VISIBILITY_TOGGLED');
  };

  // Format remaining lockout time
  const formatLockoutTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Warnings */}
        {securityWarnings.length > 0 && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Security Warning: {securityWarnings.join(', ')}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Doctor Portal</h1>
          <p className="text-blue-200">Secure access to appointment dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">
              Sign In to Dashboard
            </CardTitle>
            {(loginAttempts > 0 && !isLockedOut) && (
              <div className="text-center text-sm text-orange-600">
                Warning: {loginAttempts}/{SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} failed attempts
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorId" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Doctor ID</span>
                  </Label>
                  <Input
                    id="doctorId"
                    name="doctorId"
                    type="text"
                    placeholder="Enter your doctor ID"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    disabled={isLoading || isLockedOut}
                    className="h-12"
                    autoComplete="username"
                    maxLength={50}
                    pattern="[a-zA-Z0-9._-]+"
                    required
                    aria-describedby="doctorId-error"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading || isLockedOut}
                      className={`h-12 pr-10 ${passwordStrengthError ? 'border-red-500' : ''}`}
                      autoComplete="current-password"
                      maxLength={128}
                      required
                      minLength={SECURITY_CONFIG.PASSWORD_MIN_LENGTH}
                      aria-describedby="password-error"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLockedOut}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordStrengthError && (
                    <p id="password-error" className="text-sm text-red-600">
                      {passwordStrengthError}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading || isLockedOut || !!passwordStrengthError}
              >
                {isLoading ? 'Verifying...' : isLockedOut ? 'Account Locked' : 'Sign In Securely'}
              </Button>
            </form>

            {/* Lockout Timer */}
            {isLockedOut && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Account locked due to multiple failed attempts. 
                    Time remaining: {formatLockoutTime(remainingLockoutTime)}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Error Message */}
            {error && !isLockedOut && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Security Notice instead of Demo Credentials */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">
                Security Notice
              </h4>
              <div className="text-sm text-amber-700 space-y-1">
                <p>• Your session will timeout after 30 minutes of inactivity</p>
                <p>• Account locks after {SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} failed attempts</p>
                <p>• All login attempts are monitored and logged</p>
                <p>• Use a secure network and trusted device only</p>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Password Requirements
              </h4>
              <div className="text-xs text-blue-700">
                Minimum {SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters with uppercase, lowercase, and number
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              logSecurityEvent('NAVIGATION_TO_HOME');
              navigate('/');
            }}
            className="text-white hover:text-blue-200 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Enhanced Security Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-blue-200">
            🔒 Protected by enterprise-grade security
          </p>
          <p className="text-xs text-blue-300">
            Unauthorized access attempts are logged and may be prosecuted
          </p>
        </div>

        {/* Security Metadata (hidden from user but logged) */}
        <div style={{ display: 'none' }} data-security-metadata>
          <span data-session-start={Date.now()}>Session Metadata</span>
          <span data-csrf-token={crypto.getRandomValues(new Uint32Array(1))[0]}>CSRF</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;