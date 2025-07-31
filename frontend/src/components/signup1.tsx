// Majority of code comes from shadcn component
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";

interface Signup1Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Signup1 = ({
  heading,
  // logo = {
  //   url: "https://www.shadcnblocks.com",
  //   src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
  //   alt: "logo",
  //   title: "shadcnblocks.com",
  // },
  googleText = "Sign up with Google",
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login",
}: Signup1Props) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
            credentials: "include",
          }
        );
        const parsedResponse = await response.json();

        if (response.ok) {
          console.log("User registered successfully:", parsedResponse);
          navigate("/onboarding");
        } else {
          setError(parsedResponse.error || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Error registering user:", error);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, [navigate]
  );
  return (
    <section className="h-screen bg-muted">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* TODO: May create logo later */}
            {/* Logo */}
            {/* <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-10"
                />
              </a>
            </div> */}
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <div className="flex w-full flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  minLength={8}
                  autoComplete="current-password"
                  required
                  className="bg-white"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="cursor-pointer mt-2 w-full">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Creating account...
                    </div>
                  ) : (
                    signupText
                  )}
                </Button>
                <Button variant="outline" disabled={isLoading} className="cursor-pointer w-full">
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </form>
          </div>
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{loginText}</p>
            <a
              onClick={() => navigate(loginUrl)}
              className="font-medium text-primary hover:underline"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup1 };
