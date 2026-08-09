// Background Transactional Email Utility
// Dispatches emails seamlessly in the background via /api/send-email API backend

export interface BackgroundEmailParams {
  to: string;
  recipientName?: string;
  templateType: 'welcome' | 'update' | 'maintenance' | 'reset_password' | 'promo' | 'custom';
  subject?: string;
  customMessage?: string;
}

export async function sendBackgroundEmail(params: BackgroundEmailParams): Promise<void> {
  if (!params.to || !params.to.includes('@')) {
    return;
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: params.to,
        recipientName: params.recipientName || params.to.split('@')[0],
        templateType: params.templateType,
        subject: params.subject,
        customMessage: params.customMessage,
        senderEmail: 'noreply@web2app.joo.exe',
        appName: 'Web2App Studio by joo.exe'
      })
    });

    const data = await response.json();
    console.log(`[Background Email] Dispatched template "${params.templateType}" to ${params.to}:`, data);
  } catch (err) {
    console.warn('[Background Email] Background email send error:', err);
  }
}
