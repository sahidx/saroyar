import { db } from './db';
import { smsLogs } from '@shared/schema';

interface SMSRecipient {
  id: string;
  name: string;
  phoneNumber: string;
}

interface SMSResponse {
  success: boolean;
  code: number;
  message: string;
  messageId?: string;
}

interface BulkSMSResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  totalCreditsUsed: number;
  failedMessages: Array<{
    recipient: SMSRecipient;
    error: string;
    code: number;
  }>;
}

export class BulkSMSService {
  private apiKey: string;
  private baseUrl = 'http://bulksmsbd.net/api';
  private senderId = 'Random'; // Using the provided sender ID

  constructor() {
    // Use the new API key provided
    this.apiKey = process.env.BULKSMS_API_KEY || 'gsOKLO6XtKsANCvgPHNt';
    if (!this.apiKey) {
      console.warn('⚠️ BULKSMS_API_KEY not found in environment variables');
    } else {
      console.log('📱 BulkSMS Bangladesh API initialized successfully with key:', this.apiKey);
    }
  }

  // Send single SMS
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    try {
      // Ensure phone number is in correct format (88017XXXXXXXX)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // URL encode the message for special characters
      const encodedMessage = encodeURIComponent(message);
      
      const apiUrl = `${this.baseUrl}/smsapi?api_key=${this.apiKey}&type=text&number=${formattedNumber}&senderid=${this.senderId}&message=${encodedMessage}`;
      
      console.log(`📤 Sending SMS to ${formattedNumber}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'BelalSir-ChemistryICT/1.0'
        }
      });
      
      const responseText = await response.text();
      
      // Parse response code (BulkSMS returns plain text with response codes)
      const responseCode = parseInt(responseText.trim());
      
      return this.parseResponse(responseCode, responseText);
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      return {
        success: false,
        code: 1005,
        message: 'Internal Error - Network or API issue'
      };
    }
  }

  // Send bulk SMS to multiple recipients
  async sendBulkSMS(
    recipients: SMSRecipient[], 
    message: string, 
    sentBy: string,
    smsType: string = 'general'
  ): Promise<BulkSMSResult> {
    const result: BulkSMSResult = {
      success: true,
      sentCount: 0,
      failedCount: 0,
      totalCreditsUsed: 0,
      failedMessages: []
    };

    console.log(`🚀 Starting bulk SMS to ${recipients.length} recipients`);

    // Send SMS to each recipient
    for (const recipient of recipients) {
      try {
        const smsResult = await this.sendSMS(recipient.phoneNumber, message);
        
        if (smsResult.success) {
          result.sentCount++;
          result.totalCreditsUsed++; // Assuming 1 credit per SMS
          
          // Log successful SMS
          await this.logSMS({
            recipientType: 'student',
            recipientPhone: recipient.phoneNumber,
            recipientName: recipient.name,
            studentId: recipient.id,
            smsType,
            message,
            status: 'sent',
            credits: 1,
            sentBy
          });
          
          console.log(`✅ SMS sent successfully to ${recipient.name} (${recipient.phoneNumber})`);
        } else {
          result.failedCount++;
          result.failedMessages.push({
            recipient,
            error: smsResult.message,
            code: smsResult.code
          });
          
          // Log failed SMS
          await this.logSMS({
            recipientType: 'student',
            recipientPhone: recipient.phoneNumber,
            recipientName: recipient.name,
            studentId: recipient.id,
            smsType,
            message,
            status: 'failed',
            credits: 0,
            sentBy
          });
          
          console.log(`❌ SMS failed to ${recipient.name}: ${smsResult.message}`);
        }
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        result.failedCount++;
        result.failedMessages.push({
          recipient,
          error: 'Network or processing error',
          code: 1005
        });
        console.error(`💥 Error sending SMS to ${recipient.name}:`, error);
      }
    }

    result.success = result.sentCount > 0;
    
    console.log(`📊 Bulk SMS completed: ${result.sentCount} sent, ${result.failedCount} failed, ${result.totalCreditsUsed} credits used`);
    
    return result;
  }

  // Check SMS balance
  async checkBalance(): Promise<{ success: boolean; balance?: number; message: string }> {
    try {
      const apiUrl = `${this.baseUrl}/getBalanceApi?api_key=${this.apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'BelalSir-ChemistryICT/1.0'
        }
      });
      
      const responseText = await response.text();
      
      // BulkSMS returns balance as plain text number
      const balance = parseFloat(responseText.trim());
      
      if (!isNaN(balance)) {
        return {
          success: true,
          balance,
          message: `Current SMS balance: ${balance} credits`
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve balance'
        };
      }
    } catch (error) {
      console.error('❌ Balance check error:', error);
      return {
        success: false,
        message: 'Network error while checking balance'
      };
    }
  }

  // Format phone number for Bangladesh (ensure 88017XXXXXXXX format)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different input formats
    if (cleaned.startsWith('88')) {
      return cleaned; // Already in correct format
    } else if (cleaned.startsWith('017') || cleaned.startsWith('018') || cleaned.startsWith('019') || 
               cleaned.startsWith('013') || cleaned.startsWith('014') || cleaned.startsWith('015') || 
               cleaned.startsWith('016')) {
      return '88' + cleaned; // Add country code
    } else if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return '88' + cleaned; // Standard BD mobile number
    }
    
    return cleaned; // Return as-is if format unclear
  }

  // Parse BulkSMS API response codes
  private parseResponse(code: number, rawResponse: string): SMSResponse {
    const responseMap: { [key: number]: { success: boolean; message: string } } = {
      202: { success: true, message: 'SMS Submitted Successfully' },
      1001: { success: false, message: 'Invalid Number' },
      1002: { success: false, message: 'Sender ID not correct/disabled' },
      1003: { success: false, message: 'Please provide all required fields' },
      1005: { success: false, message: 'Internal Error' },
      1006: { success: false, message: 'Balance Validity Not Available' },
      1007: { success: false, message: 'Balance Insufficient' },
      1011: { success: false, message: 'User ID not found' },
      1012: { success: false, message: 'Masking SMS must be sent in Bengali' },
      1013: { success: false, message: 'Sender ID not found in gateway' },
      1014: { success: false, message: 'Sender Type Name not found' },
      1015: { success: false, message: 'No valid gateway for sender ID' },
      1016: { success: false, message: 'Sender Type Active Price Info not found' },
      1017: { success: false, message: 'Sender Type Price Info not found' },
      1018: { success: false, message: 'Account is disabled' },
      1019: { success: false, message: 'Sender type price is disabled' },
      1020: { success: false, message: 'Parent account not found' },
      1021: { success: false, message: 'Parent active price not found' },
      1031: { success: false, message: 'Account not verified' },
      1032: { success: false, message: 'IP not whitelisted' }
    };

    const result = responseMap[code] || {
      success: false,
      message: `Unknown response code: ${code}`
    };

    return {
      success: result.success,
      code,
      message: result.message,
      messageId: result.success ? `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined
    };
  }

  // Log SMS to database
  private async logSMS(data: {
    recipientType: string;
    recipientPhone: string;
    recipientName?: string;
    studentId?: string;
    smsType: string;
    message: string;
    status: string;
    credits: number;
    sentBy: string;
  }) {
    try {
      await db.insert(smsLogs).values({
        recipientType: data.recipientType,
        recipientPhone: data.recipientPhone,
        recipientName: data.recipientName,
        studentId: data.studentId,
        smsType: data.smsType as any,
        message: data.message,
        status: data.status,
        credits: data.credits,
        sentBy: data.sentBy,
        sentAt: new Date(),
        deliveredAt: data.status === 'sent' ? new Date() : null
      });
    } catch (error) {
      console.error('📝 Failed to log SMS to database:', error);
    }
  }
}

// Export singleton instance
export const bulkSMSService = new BulkSMSService();