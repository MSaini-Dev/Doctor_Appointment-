import {Button} from '../ui/button';
// import {CheckCircle} from 'lucide-react';
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
  }|null ;
}
const Hero: React.FC<HeroProps> = ({darkMode, liveSummary}) => {
  
  return (
    <>

      <div className={`flex flex-col justify-between max-w-xl ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} px-4 mx-auto lg:pt-16 lg:flex-row md:px-8 lg:max-w-screen-xl`}>
      <div className="pt-16 mb-16 lg:mb-0 lg:pt-32 lg:max-w-lg lg:pr-5">
        <div className="max-w-xl mb-6">
          <div>
            <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-teal-accent-400">
              {liveSummary?liveSummary?.completedPatients:"0" } patients served today
            </p>
          </div>
          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight  sm:text-4xl sm:leading-none">
            Welcome to Dr. Smith's Clinic
          </h2>
          <p className="text-base  md:text-lg">
            Providing exceptional healthcare services with a focus on patient
              comfort and comprehensive care. Book your appointment online and
              experience quality medical treatment.
          </p>
        </div>
        <div className="flex items-center">
          <Button>Book Appointment</Button>
         
        </div>
      </div>
      <div>
        <img
          src={profile_pic}
          className="object-cover object-top w-full h-64 mx-auto lg:h-auto xl:mr-24 md:max-w-sm"
          alt=""
        />
      </div>
    </div>
      </>
  );
};

export default Hero;