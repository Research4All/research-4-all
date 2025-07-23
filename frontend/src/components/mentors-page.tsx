import { MentorGrid } from './mentor-grid';

export function MentorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Mentor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced mentors who share your research interests. 
            Our recommendation system matches you with mentors based on your areas of study.
          </p>
        </div>
        
        <MentorGrid />
      </div>
    </div>
  );
} 