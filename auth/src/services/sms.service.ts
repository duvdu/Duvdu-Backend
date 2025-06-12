import axios from 'axios';

export class SmsService {
  private static instance: SmsService;
  private apiToken: string;
  private fromPhone: string;
  private apiUrl: string;

  private constructor() {
    this.apiToken = "eBDLMlZddbBha031";
    this.fromPhone = "Main Street";
    this.apiUrl = 'https://api2.smsala.com/SendSmsV2';
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
      const formattedTo = to.trim().replace(/\s+/g, '');
      
      console.log(`Sending OTP from ${this.fromPhone} to ${formattedTo}`);
      
      const payload = [{
        apiToken: this.apiToken,
        messageType: "3",
        messageEncoding: "1",
        destinationAddress: formattedTo,
        sourceAddress: this.fromPhone,
        messageText: `Your OTP code is: ${otpCode}`
      }];

      const response = await axios.post(this.apiUrl, payload);
      
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