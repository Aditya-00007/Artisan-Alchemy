import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface StoryGenerationRequest {
  productTitle: string;
  productDescription: string;
  artistName: string;
  artistBio?: string;
  medium: string;
  style?: string;
  location?: string;
}

export interface StoryGenerationResponse {
  aiStory: string;
  artistJourney: string;
  inspiration: string;
  technique: string;
  timeToComplete: string;
}

export async function generateProductStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
  // Enhanced mock stories for Indian artists with detailed backgrounds
  const enhancedStories = {
    "Sarthak Jadhav": {
      aiStory: "Growing up in the tribal heartlands of Maharashtra, Sarthak was mesmerized by the ancient Warli paintings adorning mud walls in his village. His grandmother, a keeper of traditional stories, would trace these symbols with her weathered fingers, explaining how each circle represented life's eternal cycle.\n\nDespite facing ridicule from urban friends who called his art 'primitive,' Sarthak persevered. He spent sleepless nights experimenting with natural pigments - mixing rice paste with clay, creating brushes from bamboo sticks. His breakthrough came when a renowned art critic discovered his work at a local exhibition, praising how he bridged 4000-year-old traditions with contemporary relevance.",
      artistJourney: "This piece captures that magical moment when ancient wisdom meets modern life. Each stroke carries the prayers of his ancestors and the hope of preserving dying traditions. Today, Sarthak's work hangs in homes across the world, but each piece still carries the soul of his village.",
      inspiration: "Ancient Warli tribal traditions and his grandmother's storytelling",
      technique: "Natural pigments on handmade paper using traditional bamboo brushes",
      timeToComplete: "3-4 weeks of meditation and careful painting"
    },
    "Aditya Thete": {
      aiStory: "In the dusty workshops of Mumbai's artisan quarter, young Aditya's hands bled from learning to carve marble. His master, a 70-year-old sculptor, would often say 'The stone chooses the artist, not the other way around.' Coming from a family of construction workers, Aditya's passion for sculpture was seen as impractical.\n\nThe turning point came during a particularly difficult period when his family faced financial crisis. Instead of abandoning art, Aditya poured his anguish into creating a Ganesha sculpture. Working 16-hour days, surviving on just tea and biscuits, he completed what would become his masterpiece.",
      artistJourney: "This sculpture embodies that journey from struggle to triumph. Carved during auspicious times with prayers and dedication, each detail reflects not just artistic skill but spiritual devotion. The international recognition Aditya now enjoys feels surreal, but his heart remains in that small Mumbai workshop.",
      inspiration: "Family struggles and deep spiritual devotion to Lord Ganesha",
      technique: "Traditional marble carving with hand tools passed down through generations",
      timeToComplete: "6-8 weeks of intensive carving and finishing"
    },
    "Sakshi Peharkar": {
      aiStory: "The art of traditional jewelry-making chose Sakshi before she chose it. Born into a family of goldsmiths in Aurangabad, she was creating intricate patterns with wire and beads while other children played with toys. But being a woman in a male-dominated craft meant constant battles - suppliers who refused to deal with her, customers who questioned her expertise.\n\nHer persistence paid off when she recreated a lost 300-year-old Maharashtrian Nath design from a faded museum photograph. The painstaking research, hunting for ancient techniques in dusty libraries, and months of trial and error resulted in a piece that left jewelry historians speechless.",
      artistJourney: "This piece carries the weight of that heritage - every curve, every gem placement follows traditions passed down through generations of Maharashtrian craftsmen. When you wear this, you carry with you the pride and artistry of countless artisans who kept this tradition alive.",
      inspiration: "300-year-old Maharashtrian bridal traditions and family goldsmith heritage",
      technique: "Traditional filigree work with kundan setting and hand-forged silver",
      timeToComplete: "4-5 weeks including research and intricate handwork"
    }
  };

  // Use enhanced stories if available
  if (enhancedStories[request.artistName as keyof typeof enhancedStories]) {
    return enhancedStories[request.artistName as keyof typeof enhancedStories];
  }

  try {
    const prompt = `Create a deeply emotional and detailed story for this Indian handcrafted artwork:

Title: ${request.productTitle}
Description: ${request.productDescription}
Artist: ${request.artistName}
${request.artistBio ? `Artist Bio: ${request.artistBio}` : ''}
Medium: ${request.medium}
${request.style ? `Style: ${request.style}` : ''}
${request.location ? `Location: ${request.location}` : ''}

Please provide a response in JSON format with the following structure:
{
  "aiStory": "A deeply personal narrative about the artist's inspiration, struggles, and breakthrough moments - include specific details about family background, cultural heritage, and the challenges faced (300-400 words in 2-3 emotional paragraphs)",
  "artistJourney": "How this piece represents the artist's growth, recognition received, and cultural impact (150-200 words)",
  "inspiration": "Specific cultural, personal, or spiritual inspiration behind this work",
  "technique": "Detailed description of traditional Indian techniques and materials used",
  "timeToComplete": "Realistic timeframe for creating this handcrafted piece"
}

Focus on authentic Indian cultural heritage, traditional techniques, personal struggles, and breakthrough moments that make buyers feel emotionally connected to the artist's journey.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert art historian and storyteller who creates compelling narratives about artworks and their creators. Your stories should be authentic, emotionally engaging, and true to the artistic medium and style."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      aiStory: result.aiStory || "A beautiful piece created with passion and skill.",
      artistJourney: result.artistJourney || "This work represents an important milestone in the artist's creative journey.",
      inspiration: result.inspiration || "Life experiences and artistic vision",
      technique: result.technique || "Traditional artistic methods",
      timeToComplete: result.timeToComplete || "Several weeks"
    };
  } catch (error) {
    console.error('Failed to generate story:', error);
    
    // Return fallback story
    return {
      aiStory: `This ${request.medium.toLowerCase()} piece by ${request.artistName} represents a unique artistic vision brought to life through skilled craftsmanship. The work demonstrates the artist's mastery of their chosen medium and their ability to translate emotion into visual form.`,
      artistJourney: `For ${request.artistName}, this piece represents both technical achievement and personal expression. The creation process involved careful consideration of composition, color, and form to achieve the desired artistic effect.`,
      inspiration: "Personal experiences and artistic exploration",
      technique: `Traditional ${request.medium} techniques`,
      timeToComplete: "2-4 weeks"
    };
  }
}

export interface AuthenticityVerificationRequest {
  imageUrls: string[];
  productTitle: string;
  medium: string;
  artistName: string;
}

export interface AuthenticityVerificationResponse {
  authenticityScore: number;
  verificationId: string;
  analysis: {
    handcraftedIndicators: string[];
    materialAnalysis: string;
    toolMarks: string;
    overallAssessment: string;
  };
  confidence: number;
}

export async function verifyAuthenticity(request: AuthenticityVerificationRequest): Promise<AuthenticityVerificationResponse> {
  // Mock implementation for prototype - in production this would use computer vision AI
  const verificationId = `AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  // Simulate AI analysis with realistic scoring
  const baseScore = 85 + Math.random() * 14; // 85-99 range for handcrafted items
  const confidence = 0.8 + Math.random() * 0.19; // 80-99% confidence
  
  const handcraftedIndicators = [
    "Visible tool marks consistent with handcrafting",
    "Natural material variations",
    "Unique artistic fingerprint detected",
    "Absence of mass production patterns"
  ];
  
  return {
    authenticityScore: Math.round(baseScore * 10) / 10,
    verificationId,
    analysis: {
      handcraftedIndicators,
      materialAnalysis: `Analysis confirms genuine ${request.medium} materials with properties consistent with handcrafted artwork.`,
      toolMarks: "Distinctive tool marks and surface textures indicate manual creation process.",
      overallAssessment: `This ${request.medium} piece shows strong indicators of authentic handcrafted creation by ${request.artistName}.`
    },
    confidence: Math.round(confidence * 100) / 100
  };
}
