import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";

interface Login1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
}

const Login1 = ({
  heading,
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Login",
  googleText = "Log in with Google",
  signupText = "Don't have an account?",
  signupUrl = "/signup",
}: Login1Props) => {
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Handle form submission logic here
    const loginUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const parsedResponse = await response.json();
        if (response.ok) {
          console.log("User logged in successfully:", parsedResponse);
          navigate("/home");
        }
      } catch (error) {
        console.error("Error logging in user:", error);
      }
    };
    loginUser();
  };
  return (
    <section className="h-screen bg-muted">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-10"
                />
              </a>
            </div>
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <div className="flex w-full flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  type="text"
                  name="password"
                  placeholder="Password"
                  required
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="cursor-pointer mt-2 w-full">
                  {buttonText}
                </Button>
                <Button variant="outline" className="cursor-pointer w-full">
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </form>
          </div>
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{signupText}</p>
            <a
                            onClick={() => navigate(signupUrl)}

              className="font-medium text-primary hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login1 };
