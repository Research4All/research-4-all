import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();
  //   const [error, setError] = useState<string | null>(null);

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
        if (data.role) setSelectedRole(data.role);
        if (data.interests) setSelectedInterests(data.interests);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
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
        } else {
          console.error("Error saving interests:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error saving interests:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="font-bold mb-4 text-center">Edit Profile</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Role</h2>
          <div className="flex gap-4">
            <Button
              variant={selectedRole === "Student" ? "default" : "outline"}
              onClick={() => setSelectedRole("Student")}
              className="flex-1"
            >
              Student
            </Button>
            <Button
              variant={selectedRole === "Mentor" ? "default" : "outline"}
              onClick={() => setSelectedRole("Mentor")}
              className="flex-1"
            >
              Mentor
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Interests</h2>
          <p className="mb-4 text-muted-foreground">
            Select all fields that interest you. This will help us recommend
            papers!
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
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            className="cursor-pointer px=8 py-2"
            type="button"
            variant="default"
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button
            className="cursor-pointer px-8 py-2"
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
