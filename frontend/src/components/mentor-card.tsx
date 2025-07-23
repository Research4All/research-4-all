import { Button } from '@/components/ui/button';
import type { Mentor } from '@/types';

interface MentorCardProps {
  mentor: Mentor;
  onMentorClick: (mentor: Mentor) => void;
}

export function MentorCard({ mentor, onMentorClick }: MentorCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onMentorClick(mentor)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {mentor.username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-lg text-gray-900">{mentor.username}</h3>
          <p className="text-sm text-gray-600">{mentor.email}</p>
        </div>
      </div>

      {mentor.similarity !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Match Score:</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(mentor.similarity * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mentor.similarity * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Areas of Expertise:</h4>
        <div className="flex flex-wrap gap-1">
          {mentor.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {interest}
            </span>
          ))}
          {mentor.interests.length > 3 && (
            <span className="text-xs text-gray-500">
              +{mentor.interests.length - 3} more
            </span>
          )}
        </div>
      </div>

      <Button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        onClick={(e) => {
          e.stopPropagation();
          onMentorClick(mentor);
        }}
      >
        View Profile
      </Button>
    </div>
  );
} 