import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import type { Mentor } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function MentorProfile() {
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();
  const { mentorId } = useParams();

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/users/mentor/${mentorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          setError("Mentor not found");
        } else {
          setError("Failed to fetch mentor profile");
        }
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
        setError("Failed to fetch mentor profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorProfile();
    } else {
      setError("No mentor ID provided");
      setLoading(false);
    }
  }, [mentorId]);

  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;

    try {
      setFollowLoading(true);
      const method = profile.isFollowing ? "DELETE" : "POST";
      
      const response = await fetch(`${BACKEND_URL}/api/users/follow/${mentorId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        await response.json();
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      setError("Failed to update follow status. Please try again later.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleContactMentor = () => {
    navigate(`/messages?mentor=${mentorId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-lg">Loading mentor profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-700 mb-4">{error}</div>
        <Button onClick={() => navigate("/mentors")}>Back to Mentors</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div>No mentor profile data found</div>
        <Button onClick={() => navigate("/mentors")}>Back to Mentors</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <p className="text-muted-foreground">Mentor Profile</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Email
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {profile.email}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Role</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {profile.role}
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Areas of Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No interests listed</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Following ({profile.followingCount})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {profile.following && profile.following.length > 0 ? (
                profile.following.map((user) => (
                  <div key={user._id} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.username}</div>
                      <div className="text-xs text-gray-600">{user.role}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Not following anyone yet</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Followers ({profile.followersCount})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {profile.followers && profile.followers.length > 0 ? (
                profile.followers.map((user) => (
                  <div key={user._id} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.username}</div>
                      <div className="text-xs text-gray-600">{user.role}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No followers yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleFollowToggle}
            disabled={followLoading}
            variant={profile.isFollowing ? "outline" : "default"}
            className="cursor-pointer px-8 py-2 w-24"
          >
            {followLoading ? "..." : profile.isFollowing ? "Unfollow" : "Follow"}
          </Button>
          <Button
            onClick={handleContactMentor}
            className="cursor-pointer px-8 py-2 bg-blue-500 hover:bg-blue-600"
          >
            Contact Mentor
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/mentors")}
            className="cursor-pointer px-8 py-2"
          >
            Back to Mentors
          </Button>
        </div>
      </div>
    </div>
  );
} 