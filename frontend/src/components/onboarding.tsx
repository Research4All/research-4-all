import { useState } from "react";
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

export function Onboarding() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<"Student" | "Mentor" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          interests: selectedInterests,
        }),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Welcome to Research4All!</h1>
          <p className="text-muted-foreground">
            Let's get to know you better to personalize your experience.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
          <div className="flex justify-center gap-4">
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
          <h2 className="text-xl font-semibold mb-4">Select Your Interests</h2>
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
                  selectedInterests.includes(interest) ? "default" : "outline"
                }
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 text-red-700 border border-red-400 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={handleSubmit} className="cursor-pointer px-8 py-2">
            Complete Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
