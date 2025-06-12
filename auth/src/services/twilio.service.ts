import twilio from 'twilio';

import { env } from '../config/env';
export class OtpService {
  private static instance: OtpService;
  private client: twilio.Twilio;
  private fromPhone: string;

  private constructor() {
    console.log(env.twilio);
    if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.fromPhone) {
      throw new Error('Twilio credentials are not properly configured');
    }
    
    this.client = twilio(env.twilio.accountSid, env.twilio.authToken);
    // Remove any spaces in the phone number
    this.fromPhone = env.twilio.fromPhone.replace(/\s+/g, '');
  }

  public static getInstance(): OtpService {
    if (!OtpService.instance) {
      OtpService.instance = new OtpService();
    }
    return OtpService.instance;
  }

  async sendOtp(to: string, otpCode: string): Promise<void> {
    try {
      if (!this.fromPhone) {
        throw new Error('Twilio from phone number is not configured');
      }
      
      // Format the recipient number if needed
      const formattedTo = to.trim().replace(/\s+/g, '');
      
      console.log(`Sending OTP from ${this.fromPhone} to ${formattedTo}`);
      
      await this.client.messages.create({
        body: `Your OTP code is: ${otpCode}`,
        from: this.fromPhone,
        to: formattedTo,
      });
      console.log(`OTP sent to ${formattedTo}`);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      
      // Provide more specific error messages based on Twilio error codes
      if (error.code === 21608) {
        throw new Error('Failed to send OTP: The recipient number is not verified. For Twilio trial accounts, you must verify the recipient number.');
      } else {
        throw new Error('Failed to send OTP');
      }
    }
  }
}

export const twilioService = OtpService.getInstance();
