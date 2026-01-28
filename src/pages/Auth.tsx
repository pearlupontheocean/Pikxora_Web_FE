import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser, useSignUp, useSignIn } from "@/lib/api-hooks";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import spiderman from "@/assets/login.jpg";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["studio", "artist", "investor", "admin"]),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("studio");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // React Query hooks - disable if no token to prevent re-render loops
  const hasToken = !!localStorage.getItem('token');
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const signUpMutation = useSignUp();
  const signInMutation = useSignIn();

  const loading = signUpMutation.isPending || signInMutation.isPending;

  useEffect(() => {
    // Only navigate if we have a current user and not loading
    if (!userLoading && currentUser && hasToken) {
      navigate("/dashboard");
    }
  }, [currentUser, userLoading, hasToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        // Validate signup data
        const validatedData = signupSchema.parse({ email, password, name, role });
        
        const result = await signUpMutation.mutateAsync({
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.name,
          role: validatedData.role,
        });

        if (result) {
          toast.success("Account created! Welcome to PIKXORA");
          navigate("/dashboard");
        }
      } else {
        const result = await signInMutation.mutateAsync({ email, password });
        
        if (result) {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } })?.response?.data?.error
          : error instanceof Error
          ? error.message
          : "An error occurred";
        toast.error(errorMessage || "An error occurred");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-between px-6 md:px-12 lg:px-20 p-4 overflow-hidden">
      {/* Responsive full-bleed background image */}
      <img
        src={spiderman}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Readability overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70" /> */}

      <div className="relative z-10 w-full max-w-md gap-6">
        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-0 border-none bg-transparent backdrop-blur-md">
            <h1 className="text-3xl font-bold text-center mb-2">
              {isSignUp ? "Join PIKXORA" : "Welcome Back"}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {isSignUp
                ? "Create your account to start connecting globally"
                : "Sign in to your account"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-border focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="artist">Artist/Freelancer</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border focus:border-primary pr-10" // Add padding-right for the icon
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  isSignUp ? "Sign Up" : "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Right-side quote (hidden on very small screens) */}
      <div className="relative z-10 hidden md:flex flex-1 items-center justify-center text-right">
        <div className="max-w-lg text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
          <p
            className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug mt-28"
            style={{
              fontFamily:
                '"Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Pikxora awaits: Pixels reimagined, futures forged in VFX infinity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
