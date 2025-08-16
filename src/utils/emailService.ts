interface EmailData {
  to: string;
  subject: string;
  message: string;
}

export async function sendEmailNotification(emailData: EmailData): Promise<boolean> {
  try {
    // In a real application, this would call your email service API
    // For demo purposes, we'll simulate the email sending
    console.log('📧 Email Notification Sent:', {
      to: emailData.to,
      subject: emailData.subject,
      message: emailData.message,
      timestamp: new Date().toISOString()
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store email in localStorage for demo purposes
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    emails.push({
      ...emailData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    });
    localStorage.setItem('emails', JSON.stringify(emails));

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function getEmailHistory(): any[] {
  return JSON.parse(localStorage.getItem('emails') || '[]');
}