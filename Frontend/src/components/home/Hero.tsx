import {Button} from '../ui/button';
import {CheckCircle} from 'lucide-react';
import profile_pic from "../../assets/vecteezy_ai-generated-portrait-of-young-doctor-man-happy-smiling_41642113.png";

interface Session {
  _id: string;
  date: string;
  checkin: string;
  checkout: string;
  totalTokens: number;
  currentToken: number;
  isActive: boolean;
}

interface HeroProps {
  darkMode: boolean;
  liveSummary?: {
    liveSession?: Session;
    completedPatients?: number;
    isTodayHoliday?: boolean;
  } | null;
}
const Hero: React.FC<HeroProps> = ({darkMode, liveSummary}) => {
  
  return (
   <div
        className={` ${
          darkMode ? "bg-black-800" : "bg-white"
        } shadow-sm min-h-screen flex items-center justify-center`}
      >
        <div className="w-full   h-screen flex flex-col gap-4 lg:flex-row  lg:items-center lg:justify-between transition-colors duration-300">
          <div className="flex justify-center items-center h-full lg:w-1/2 ">
            <div
              className="flex justify-center items-end   h-full  aspect-[1/2] overflow-hidden "
              style={{
                backgroundImage: `url(${profile_pic})`,
                backgroundSize: "contain",
                backgroundPosition: "bottom",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </div>
          <div className="text-center lg:w-1/2 lg:text-left ">
            {liveSummary?.liveSession && (
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2  my-4  rounded-full ${
                  darkMode
                    ? "bg-green-900 text-green-100"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {liveSummary.completedPatients} patients served today
                </span>
              </div>
            )}
            <h2
              className={`text-3xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to Dr. Smith's Clinic
            </h2>
            <p
              className={`text-xl ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } mb-8 max-w-3xl mx-auto`}
            >
              Providing exceptional healthcare services with a focus on patient
              comfort and comprehensive care. Book your appointment online and
              experience quality medical treatment.
            </p>

            <Button>Book Appointment</Button>
          </div>
        </div>
      </div>
  );
};

export default Hero;