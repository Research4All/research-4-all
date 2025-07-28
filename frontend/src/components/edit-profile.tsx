import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";

const INTEREST_OPTIONS = [
  "Computer Science",
  "Medicine",
  "Chemistry",
  "Biology",
  "Materials Science",
  "Physics",
  "Geology",
  "Psychology",
  "Art",
  "History",
  "Geography",
  "Sociology",
  "Business",
  "Political Science",
  "Economics",
  "Philosophy",
  "Mathematics",
  "Engineering",
  "Environmental Science",
  "Agricultural and Food Sciences",
  "Education",
  "Law",
  "Linguistics",
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function EditProfile() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<"Student" | "Mentor" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.role) setSelectedRole(data.role);
        if (data.interests) setSelectedInterests(data.interests);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setError(null);
    
    fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: selectedRole,
        interests: selectedInterests,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          console.log("Interests saved successfully:", data);
          navigate("/");
        } else {
          console.error("Error saving interests:", data.error);
          setError(data.error || "Failed to save changes. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error saving interests:", error);
        setError("An error occurred while saving. Please try again.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Spinner size="lg" text="Loading profile..." showText />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="font-bold mb-4 text-center">Edit Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Role</h2>
          <div className="flex gap-4">
            <Button
              variant={selectedRole === "Student" ? "default" : "outline"}
              onClick={() => setSelectedRole("Student")}
              className="flex-1"
              disabled={isSaving}
            >
              Student
            </Button>
            <Button
              variant={selectedRole === "Mentor" ? "default" : "outline"}
              onClick={() => setSelectedRole("Mentor")}
              className="flex-1"
              disabled={isSaving}
            >
              Mentor
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Interests</h2>
          <p className="mb-4 text-muted-foreground">
            Select all fields that interest you. This will help us recommend
            relevant papers!
          </p>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <Button
                key={interest}
                className="cursor-pointer"
                type="button"
                variant={
                  selectedInterests.includes(interest) ? "secondary" : "outline"
                }
                onClick={() => toggleInterest(interest)}
                disabled={isSaving}
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            className="cursor-pointer px-8 py-2"
            type="button"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            className="cursor-pointer px-8 py-2"
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
