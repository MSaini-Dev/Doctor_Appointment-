import { MapPin, Phone, Mail } from "lucide-react";

interface FooterProps {
  isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
  const lat = 26.9124;
  const lon = 75.7873;
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <footer className={`w-full ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-800'} py-8 mt-12`}>
      {/* Map - Full Width */}
      <div className="w-full mb-8 aspect-video">
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <iframe
            title="Clinic Location"
            src={`https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            className="w-full"
          ></iframe>
        </a>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 141 234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>clinic@example.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Medical Center, Malviya Nagar, Jaipur</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-3">Hours</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Mon-Fri</span>
                <span>9 AM - 7 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>10 AM - 2 PM</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <div className="text-sm space-y-1">
              <p>General Medicine</p>
              <p>Health Checkups</p>
              <p>Consultations</p>
              <p>Emergency Care</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-6 pt-6 flex lg:flex-row flex-col justify-between border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>© {new Date().getFullYear()} Dr. Healthcare Clinic</p>
          <p>Design and Developed with ❤️ by MohitSaini</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;