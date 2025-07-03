import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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

const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";

export function EditProfile() {
  const [selected, setSelected] = useState<string[]>([]);
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
        if (data.interests) {
          setSelected(data.interests);
        }
      })
      .catch((error) => {
        console.error("Error fetching interests:", error);
      });
  }, []);

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter((i) => i !== interest));
    } else {
      setSelected([...selected, interest]);
    }
  };

  const handleSave = () => {
    fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests: selected }),
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
        <p className="font-bold mb-4 text-center">
          Edit your profile information below.
        </p>
        <p className="mb-6 text-center text-muted-foreground">
          Select all fields that you are interested in. This will help us
          recommend papers relevant to you!
        </p>
        {
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {INTEREST_OPTIONS.map((interest) => (
              <Button
                key={interest}
                className="cursor-pointer"
                type="button"
                variant={selected.includes(interest) ? "secondary" : "outline"}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Button>
            ))}
            <Button
              className="cursor-pointer"
              type="button"
              variant="default"
              onClick={handleSave}
            >
              Save Interest
            </Button>
          </div>
        }
      </div>
    </div>
  );
}
