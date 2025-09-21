import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileCheck, Shield, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import Header from "../components/Header";

export default function ArtistVerificationPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [productImages, setProductImages] = useState<File[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [toolsUsed, setToolsUsed] = useState("");
  const [creationTime, setCreationTime] = useState("");
  const [undertakingAccepted, setUndertakingAccepted] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductImages(files);
    }
  };

  const verifyProductMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      productImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      formData.append('experienceYears', experienceYears);
      formData.append('specialization', specialization);
      formData.append('toolsUsed', toolsUsed);
      formData.append('creationTime', creationTime);
      formData.append('undertakingAccepted', undertakingAccepted.toString());

      return apiRequest("POST", "/api/artist/verify-product", formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Verification Submitted!",
        description: "Your product verification is under review. We'll notify you within 24-48 hours.",
      });
      setVerificationStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVerification = () => {
    if (productImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one product image.",
        variant: "destructive",
      });
      return;
    }

    if (!undertakingAccepted) {
      toast({
        title: "Undertaking Required",
        description: "Please accept the authenticity undertaking to proceed.",
        variant: "destructive",
      });
      return;
    }

    verifyProductMutation.mutate();
  };

  if (!user || user.role !== "artist") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-8">This page is only accessible to verified artists.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Artist Product Verification</h1>
          <p className="text-muted-foreground">Ensure your handcrafted products meet our authenticity standards</p>
        </div>

        {verificationStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Product Images & Details
              </CardTitle>
              <p className="text-muted-foreground">Upload clear, high-quality images of your handcrafted product</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="product-images">Product Images (Max 5 images)</Label>
                <Input
                  data-testid="input-product-images"
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include different angles, close-ups of details, and work-in-progress shots if available
                </p>
                {productImages.length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    {productImages.length} image(s) selected
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select value={experienceYears} onValueChange={setExperienceYears}>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    data-testid="input-specialization"
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g., Warli Art, Marble Carving, Jewelry"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tools">Tools & Materials Used</Label>
                <Textarea
                  data-testid="textarea-tools"
                  id="tools"
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  placeholder="List the traditional tools, materials, and techniques used in creating this product"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="creation-time">Approximate Creation Time</Label>
                <Select value={creationTime} onValueChange={setCreationTime}>
                  <SelectTrigger data-testid="select-creation-time">
                    <SelectValue placeholder="How long did it take to create?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-7days">1-7 days</SelectItem>
                    <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                    <SelectItem value="3-4weeks">3-4 weeks</SelectItem>
                    <SelectItem value="1-2months">1-2 months</SelectItem>
                    <SelectItem value="3+months">3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                data-testid="button-next-step"
                onClick={() => setVerificationStep(2)} 
                className="w-full"
                disabled={productImages.length === 0 || !experienceYears || !specialization}
              >
                Next: Review Undertaking
              </Button>
            </CardContent>
          </Card>
        )}

        {verificationStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Authenticity Undertaking
              </CardTitle>
              <p className="text-muted-foreground">Please read and accept our authenticity guarantee</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">Authenticity Declaration</h3>
                    <div className="text-sm text-amber-800 space-y-2">
                      <p>By submitting this product for verification, I hereby declare that:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>This product is entirely handcrafted by me and not mass-produced</li>
                        <li>No machine manufacturing or automated processes were used in creation</li>
                        <li>All materials and techniques used are authentic and traditional</li>
                        <li>The product images accurately represent the actual item</li>
                        <li>I take full responsibility for the authenticity of this product</li>
                        <li>I understand that false claims may result in permanent account suspension</li>
                        <li>I agree to provide additional documentation if requested</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Verification Process</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>Our AI-powered verification system will analyze:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Image authenticity and handcraft indicators</li>
                    <li>Tool marks and surface texture analysis</li>
                    <li>Material composition verification</li>
                    <li>Consistency with declared techniques</li>
                    <li>Comparison with known handcraft patterns</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <Checkbox 
                  data-testid="checkbox-undertaking"
                  id="undertaking" 
                  checked={undertakingAccepted}
                  onCheckedChange={(checked) => setUndertakingAccepted(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="undertaking" className="text-sm font-medium cursor-pointer">
                    I have read and agree to the above authenticity declaration. I understand that providing false information may result in legal action and permanent removal from the platform.
                  </Label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  data-testid="button-back"
                  variant="outline" 
                  onClick={() => setVerificationStep(1)}
                  className="flex-1"
                >
                  Back to Details
                </Button>
                <Button 
                  data-testid="button-submit-verification"
                  onClick={handleSubmitVerification}
                  disabled={!undertakingAccepted || verifyProductMutation.isPending}
                  className="flex-1"
                >
                  {verifyProductMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStep === 3 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for submitting your product for verification. Our team will review your submission and notify you within 24-48 hours.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong><br />
                  • AI analysis of your product images<br />
                  • Review of your experience and techniques<br />
                  • Final verification by our expert team<br />
                  • Email notification with results
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <Button data-testid="button-dashboard" onClick={() => navigate("/artist/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button data-testid="button-verify-another" variant="outline" onClick={() => setVerificationStep(1)}>
                  Verify Another Product
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}