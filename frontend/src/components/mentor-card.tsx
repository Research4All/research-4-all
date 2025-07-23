import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Mentor } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface MentorCardProps {
  mentor: Mentor;
  onMentorClick: (mentor: Mentor) => void;
  onFollowUpdate?: (mentorId: string, isFollowing: boolean) => void;
}

export function MentorCard({ mentor, onMentorClick, onFollowUpdate }: MentorCardProps) {
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (followLoading) return;

    try {
      setFollowLoading(true);
      const method = mentor.isFollowing ? "DELETE" : "POST";
      
      const response = await fetch(`${BACKEND_URL}/api/users/follow/${mentor._id}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        await response.json();
        mentor.isFollowing = !mentor.isFollowing;
        if (onFollowUpdate) {
          onFollowUpdate(mentor._id, mentor.isFollowing);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setFollowLoading(false);
    } 
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onMentorClick(mentor)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {mentor.username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{mentor.username}</h3>
          <p className="text-sm text-gray-600">{mentor.email}</p>
        </div>
        <Button
          onClick={handleFollowToggle}
          disabled={followLoading}
          variant={mentor.isFollowing ? "outline" : "default"}
          size="sm"
          className="ml-2 w-20"
        >
          {followLoading ? "..." : mentor.isFollowing ? "Unfollow" : "Follow"}
        </Button>
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