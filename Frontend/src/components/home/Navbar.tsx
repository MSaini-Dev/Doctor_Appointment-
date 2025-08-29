import { CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Session {
  _id: string;
  date: string;
  checkin: string;
  checkout: string;
  totalTokens: number;
  currentToken: number;
  isActive: boolean;
}

interface NavbarProps {
  setDarkMode: (value: boolean) => void;
  darkMode: boolean;
  liveSummary?: {
    liveSession?: Session;
    completedPatients?: number;
    isTodayHoliday?: boolean;
  } | null;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, liveSummary }) => {
  const getClinicStatus = () => {
    if (!liveSummary) return { status: 'Loading...', color: 'bg-gray-100 text-gray-950', icon: AlertCircle };

    if (liveSummary.isTodayHoliday) {
      return { status: 'Holiday', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }

    if (liveSummary.liveSession) {
      return { status: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }

    return { status: 'Offline', color: 'bg-gray-100 text-gray-950', icon: AlertCircle };
  };

  const clinicStatus = getClinicStatus();
  const StatusIcon = clinicStatus.icon; // ✅ Capitalized so React treats it as a component

  return (
    <nav
      className={`shadow-sm border-b transition-colors duration-300 fixed top-0 right-0 left-0  h-16  ${
        darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            
            <div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Dr. Smith's Clinic
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className={`${clinicStatus.color} flex items-center space-x-1`}>
              <StatusIcon className="h-3 w-3" />
              <span>{clinicStatus.status}</span>
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className={`${
                darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
