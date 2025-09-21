import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Mail, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/api";
import { signInWithGoogle, handleGoogleRedirect } from "../lib/firebase";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as "customer" | "artist",
  });

  // Google OAuth mutation
  const googleSignupMutation = useMutation({
    mutationFn: async () => {
      const googleResult = await signInWithGoogle();
      return apiRequest("POST", "/api/auth/google-signup", {
        email: googleResult.user.email,
        name: googleResult.user.name,
        googleId: googleResult.user.uid,
        photoURL: googleResult.user.photoURL,
        role: formData.role
      });
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        toast({
          title: "Welcome!",
          description: "You've been successfully signed in with Google.",
        });
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Google Sign-up Failed",
        description: error.message || "Failed to sign up with Google. Please try again.",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/register", formData);
    },
    onSuccess: (data) => {
      if (data.userId && data.requiresVerification) {
        localStorage.setItem("pendingUserId", data.userId);
        localStorage.setItem("pendingEmail", formData.email);
        toast({
          title: "Registration Successful!",
          description: "Please check your email for the verification code.",
        });
        navigate("/auth/verify-email");
      } else if (data.token) {
        // Direct login for existing OAuth users
        localStorage.setItem("token", data.token);
        toast({
          title: "Welcome!",
          description: "You've been successfully signed in.",
        });
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle Google redirect on component mount
  useEffect(() => {
    handleGoogleRedirect().then((result) => {
      if (result) {
        // User completed Google OAuth, now register them
        apiRequest("POST", "/api/auth/google-signup", {
          email: result.user.email,
          name: result.user.name,
          googleId: result.user.uid,
          photoURL: result.user.photoURL,
          role: "customer" // Default role
        }).then((data) => {
          if (data.token) {
            localStorage.setItem("token", data.token);
            toast({
              title: "Welcome!",
              description: "You've been successfully signed in with Google.",
            });
            navigate("/");
          }
        }).catch((error) => {
          toast({
            title: "Authentication Failed",
            description: error.message || "Failed to complete Google sign-up.",
            variant: "destructive",
          });
        });
      }
    }).catch((error) => {
      console.error('Google redirect error:', error);
    });
  }, [navigate, toast]);

  const handleGoogleSignup = () => {
    if (!formData.role) {
      toast({
        title: "Account Type Required",
        description: "Please select whether you're signing up as a customer or artist.",
        variant: "destructive",
      });
      return;
    }
    googleSignupMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Artisan Alley</CardTitle>
          <p className="text-muted-foreground">
            Create your account to discover authentic handcrafted art
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                data-testid="input-name"
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                data-testid="input-email"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                data-testid="input-password"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Create a strong password"
                minLength={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: "customer" | "artist") => setFormData({...formData, role: value})}
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Choose account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer - Buy handcrafted art</SelectItem>
                  <SelectItem value="artist">Artist - Sell my creations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              data-testid="button-signup"
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full"
            >
              {signupMutation.isPending ? (
                "Creating Account..."
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button
              data-testid="button-google-signup"
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={googleSignupMutation.isPending}
              className="w-full"
            >
              {googleSignupMutation.isPending ? (
                "Connecting..."
              ) : (
                <>
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Sign up with Google
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </div>
            
            <Button
              data-testid="link-back"
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}