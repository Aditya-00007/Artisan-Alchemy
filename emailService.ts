export class EmailService {
  // Mock email service for development
  // In production, integrate with SendGrid, Twilio, or similar
  
  async sendOTP(email: string, otp: string): Promise<boolean> {
    // Mock implementation - in development, we'll just log the OTP
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  isOTPValid(otp: string, storedOTP: string | null, expiry: Date | null): boolean {
    if (!otp || !storedOTP || !expiry) return false;
    if (otp !== storedOTP) return false;
    if (new Date() > expiry) return false;
    return true;
  }
}

export const emailService = new EmailService();