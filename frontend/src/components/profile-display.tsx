import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import type { User } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function ProfileDisplay() {
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setError("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to fetch profile. Please try again later.");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-700 mb-4">{error}</div>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div>No profile data found</div>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Following ({profile.followingCount || 0})</h3>
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
            <h3 className="text-lg font-semibold mb-3">Followers ({profile.followersCount || 0})</h3>
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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Username
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {profile.username}
              </div>
            </div>
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
          <h2 className="text-xl font-semibold mb-4">Interests</h2>
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
              <span className="text-gray-500">No interests selected</span>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate("/edit-profile")}
            className="cursor-pointer px-8 py-2"
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="cursor-pointer px-8 py-2"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
