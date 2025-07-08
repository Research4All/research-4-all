import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface userProfile {
  username: string;
  email: string;
  role: "Student" | "Mentor";
  interests: string[];
}

export function ProfileDisplay() {
  const [profile, setProfile] = useState<userProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setProfile(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError("Failed to fetch profile. Please try again later.");
      });
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
