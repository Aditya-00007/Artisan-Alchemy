import { useState } from "react";
import { useLocation } from "wouter";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(registerData);
      toast({
        title: "Welcome to Artisan Alley!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="text-primary text-3xl" />
            <h1 className="text-2xl font-serif font-bold text-primary">Artisan Alley</h1>
          </div>
          <CardTitle>Welcome to our community</CardTitle>
          <CardDescription>Join our community of artists and art lovers</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    data-testid="input-register-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="input-register-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    data-testid="input-register-password"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>I am a:</Label>
                  <RadioGroup
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                    data-testid="radio-group-role"
                  >
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <RadioGroupItem value="customer" id="customer" data-testid="radio-customer" />
                      <Label htmlFor="customer" className="flex-1 cursor-pointer">
                        <div className="font-medium">Customer</div>
                        <div className="text-sm text-muted-foreground">Buy art</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <RadioGroupItem value="artist" id="artist" data-testid="radio-artist" />
                      <Label htmlFor="artist" className="flex-1 cursor-pointer">
                        <div className="font-medium">Artist</div>
                        <div className="text-sm text-muted-foreground">Sell art</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
