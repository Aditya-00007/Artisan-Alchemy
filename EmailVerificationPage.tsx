import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Mail, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function EmailVerificationPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("pendingUserId") || "");

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/verify-email", {
        userId,
        otp,
      });
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      localStorage.removeItem("pendingUserId");
      toast({
        title: "Email Verified!",
        description: "Your account has been successfully verified.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/resend-otp", { userId });
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to your email address. Please enter it below to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              data-testid="input-otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
          </div>
          
          <Button 
            data-testid="button-verify"
            onClick={handleVerify}
            disabled={verifyOtpMutation.isPending || otp.length !== 6}
            className="w-full"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="flex items-center justify-center space-x-4">
            <Button
              data-testid="button-resend"
              variant="ghost"
              onClick={handleResendOtp}
              disabled={resendOtpMutation.isPending}
              className="flex items-center"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {resendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
            </Button>
          </div>

          <Button
            data-testid="link-back"
            variant="outline"
            onClick={() => navigate("/auth/signup")}
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Signup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}