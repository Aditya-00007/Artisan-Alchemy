import { useState } from "react";
import { X, Sparkles, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

interface StoryModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    authenticityScore?: string;
    verificationId?: string;
  } | null;
}

export default function StoryModal({ open, onClose, product }: StoryModalProps) {
  const { toast } = useToast();
  const [story, setStory] = useState<any>(null);

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/story", {
        productId: product?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setStory(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateStory = () => {
    if (product) {
      generateStoryMutation.mutate();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-story">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="text-primary text-xl" />
            <span>The Story Behind {product.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!story ? (
            <div className="text-center py-8">
              <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Discover the Story</h3>
              <p className="text-muted-foreground mb-6">
                Uncover the inspiration, journey, and craftsmanship behind this unique piece through AI-powered storytelling.
              </p>
              <Button
                onClick={handleGenerateStory}
                disabled={generateStoryMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary text-white"
                data-testid="button-generate-story"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateStoryMutation.isPending ? "Generating..." : "Generate Story"}
              </Button>
            </div>
          ) : (
            <>
              {/* AI Generated Story Content */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-l-4 border-primary">
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="text-primary" />
                  <span className="text-sm font-semibold text-primary">AI-Generated Story</span>
                  <Badge variant="secondary" className="text-xs">Powered by Advanced AI</Badge>
                </div>
                <p className="text-foreground leading-relaxed" data-testid="text-ai-story">
                  {story.aiStory}
                </p>
              </div>

              {/* Artist's Personal Story */}
              <div className="space-y-4">
                <h4 className="text-lg font-serif font-semibold text-foreground">Artist's Journey</h4>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-artist-journey">
                  {story.artistJourney}
                </p>

                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">Inspiration: {story.inspiration}</Badge>
                  <Badge variant="outline">Technique: {story.technique}</Badge>
                  <Badge variant="outline">Time to Complete: {story.timeToComplete}</Badge>
                </div>
              </div>

              {/* Authenticity Certificate */}
              {product.authenticityScore && (
                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="text-accent text-2xl" />
                    <div>
                      <h4 className="font-semibold text-foreground">Certificate of Authenticity</h4>
                      <p className="text-sm text-muted-foreground">AI-Verified Handcrafted Original</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Verification ID:</span>
                      <p className="font-mono font-medium" data-testid="text-verification-id">
                        {product.verificationId}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Analysis Date:</span>
                      <p className="font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Authenticity Score:</span>
                      <p className="font-bold text-accent" data-testid="text-authenticity-score">
                        {product.authenticityScore}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
