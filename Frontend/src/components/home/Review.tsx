import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Users, MessageSquare, X, User, Phone } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
}

interface TestimonialsProps {
  isDark: boolean;
}

const TestimonialsSection: React.FC<TestimonialsProps> = ({ isDark }) => {
  const [reviews] = useState<Review[]>([
    {
      _id: "67f8d2a1b4c3e5f9a1234567",
      name: "Sunita Agarwal", 
      rating: 5,
      review: "Dr. Singh helped me with my diabetes management. Very knowledgeable and caring approach.",
      date: "2025-01-20"
    },
    {
      _id: "67f8d2a1b4c3e5f9a1234568",
      name: "Ramesh Gupta",
      rating: 4,
      review: "Good consultation for my back pain. Treatment is working well.",
      date: "2025-01-18"
    },
    {
      _id: "67f8d2a1b4c3e5f9a1234569",
      name: "Kavita Jain",
      rating: 5,
      review: "Excellent care during my pregnancy. Doctor was always available for queries.",
      date: "2025-01-15"
    },
    {
      _id: "67f8d2a1b4c3e5f9a1234570", 
      name: "Mohit Sharma",
      rating: 4,
      review: "Professional service. Got proper medication for my hypertension.",
      date: "2025-01-12"
    },
    {
      _id: "67f8d2a1b4c3e5f9a1234571",
      name: "Deepika Mathur",
      rating: 5,
      review: "Best doctor in the area. Helped with my thyroid issues effectively.",
      date: "2025-01-10"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    rating: 0,
    review: ""
  });

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSubmit = async () => {
    if (formData.rating === 0) return;
    
    // MongoDB submission logic would go here
    const newReview = {
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    
    console.log('Submitting review:', newReview);
    // await submitReviewToMongoDB(newReview);
    
    // Reset form and close modal
    setFormData({ name: "", phone: "", rating: 0, review: "" });
    setShowForm(false);
    alert('Thank you for your review!');
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : isDark ? 'text-gray-600' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return "0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What Our Patients Say
          </h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(parseFloat(getAverageRating())))}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getAverageRating()}
              </span>
            </div>
            <div className={`flex items-center space-x-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Users className="w-4 h-4" />
              <span>{reviews.length} reviews</span>
            </div>
          </div>
        </div>

        {/* Review Carousel */}
        <div className="relative">
          <div className={`p-6 md:p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-center">
              <div className="mb-4">
                {renderStars(currentReview.rating)}
              </div>
              
              <blockquote className={`text-lg md:text-xl italic mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{currentReview.review}"
              </blockquote>
              
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-semibold text-base">{currentReview.name}</p>
                <p className="text-sm">
                  {new Date(currentReview.date).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-600'
            } shadow-lg transition-colors`}
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextReview}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-600'
            } shadow-lg transition-colors`}
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share Your Experience</span>
          </button>
        </div>

        {/* Review Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 relative`}>
              <button
                onClick={() => setShowForm(false)}
                className={`absolute top-4 right-4 p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Share Your Experience
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4 inline mr-1" />
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </label>
                  <div className="py-1">
                    {renderStars(formData.rating, true, (rating) => 
                      setFormData({...formData, rating})
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.review}
                    onChange={(e) => setFormData({...formData, review: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Share your experience..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className={`flex-1 py-2.5 px-4 rounded-md border transition-colors ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={formData.rating === 0}
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Your review will be published shortly.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;