import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { GenericGrid } from './generic-grid';
import { MentorCard } from './mentor-card';
import { Spinner } from '@/components/ui/spinner';
import type { Mentor } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

export function MentorGrid() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const mentorsResponse = await fetch(`${BACKEND_URL}/api/users/mentors`, {
          method: "GET",
          credentials: "include",
        });

        if (!mentorsResponse.ok) {
          throw new Error(`Failed to fetch mentors: ${mentorsResponse.status}`);
        }

        const mentorsData = await mentorsResponse.json();
        const allMentors = mentorsData.mentors;

        const profileResponse = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (profileResponse.ok) {
          const userProfile = await profileResponse.json();

          if (userProfile.interests && userProfile.interests.length > 0) {
            const recommendationResponse = await fetch(`${FASTAPI_URL}/recommend-users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_interests: userProfile.interests,
                users: allMentors.map((mentor: Mentor) => ({
                  interests: mentor.interests
                }))
              }),
            });

            if (recommendationResponse.ok) {
              const recommendationData = await recommendationResponse.json();

              const mentorsWithScores = allMentors.map((mentor: Mentor, index: number) => ({
                ...mentor,
                similarity: recommendationData.similarities[index]
              }));

              mentorsWithScores.sort((a: Mentor, b: Mentor) =>
                (b.similarity || 0) - (a.similarity || 0)
              );

              setMentors(mentorsWithScores);
            } else {
              setMentors(allMentors);
            }
          } else {
            setMentors(allMentors);
          }
        } else {
          setMentors(allMentors);
        }
      } catch (error) {
        setError("Failed to fetch mentors. Please try again later.");
        throw error;
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleMentorClick = (mentor: Mentor) => {
    navigate(`/mentor-profile/${mentor._id}`, {
      state: { mentor }
    });
  };

  const handleFollowUpdate = (mentorId: string, isFollowing: boolean) => {
    setMentors(prevMentors => 
      prevMentors.map(mentor => 
        mentor._id === mentorId 
          ? { ...mentor, isFollowing } 
          : mentor
      )
    );
  };

  const renderMentorCard = (mentor: Mentor) => (
    <MentorCard
      key={mentor._id}
      mentor={mentor}
      onMentorClick={handleMentorClick}
      onFollowUpdate={handleFollowUpdate}
    />
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" text="Loading mentors..." showText />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-700 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <GenericGrid
      items={mentors}
      renderItem={renderMentorCard}
      emptyMessage="No mentors found. Check back later for available mentors."
      gridCols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
    />
  );
} 