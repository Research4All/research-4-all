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
    "Linguistics"
];

// const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";

export function EditProfile() {

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full bg-white rounded-lg shadow-md p-8">
                <p className="font-bold mb-4 text-center">Edit your profile information below.</p>
                <p className="mb-6 text-center text-muted-foreground">
                    Select all fields that you are interested in. This will help us recommend papers relevant to you!
                </p>
                { (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {INTEREST_OPTIONS.map((interest) => (
                            <Button
                                key={interest}
                                type="button"
                            >
                                {interest}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}