import twilio from 'twilio';

import { env } from '../config/env';
export class OtpService {
  private static instance: OtpService;
  private client: twilio.Twilio;
  private fromPhone: string;

  private constructor() {
    this.client = twilio(env.twilio.accountSid, env.twilio.authToken);
    this.fromPhone = env.twilio.fromPhone!;
  }

  public static getInstance(): OtpService {
    if (!OtpService.instance) {
      OtpService.instance = new OtpService();
    }
    return OtpService.instance;
  }

  async sendOtp(to: string, otpCode: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Your OTP code is: ${otpCode}`,
        from: this.fromPhone,
        to: to,
      });
      console.log(`OTP sent to ${to}`);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

export const twilioService = OtpService.getInstance();
