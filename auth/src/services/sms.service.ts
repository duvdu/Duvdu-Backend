import axios from 'axios';

export class SmsService {
  private static instance: SmsService;
  private bearerToken: string;
  private senderId: string;
  private apiUrl: string;

  private constructor() {
    this.bearerToken = process.env.SMS_BEARER_TOKEN || '';
    this.senderId = 'Duvdu';
    this.apiUrl = 'https://bulk.whysms.com/api/v3/sms/send';
  }

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  async sendOtp(to: string, otpCode: string): Promise<void> {
    try {
      // Format the recipient number if needed
      const cleanedNumber = to.trim().replace(/\s+/g, '');
      const formattedTo = `2${cleanedNumber}`;

      console.log(`Sending OTP from ${this.senderId} to ${formattedTo}`);

      const payload = {
        recipient: formattedTo,
        sender_id: this.senderId,
        type: 'plain',
        message: `${this.senderId}: Your otp is ${otpCode}`
      };

      console.log(this.bearerToken);
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(response.data);

      if (response.status !== 200) {
        throw new Error('Failed to send OTP: API request failed');
      }

      console.log(`OTP sent to ${formattedTo}`);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

export const smsService = SmsService.getInstance();
