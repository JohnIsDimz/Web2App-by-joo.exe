// Background Transactional Email Utility
// Dispatches emails seamlessly in the background via /api/send-email API backend asynchronously without UI interaction

export interface BackgroundEmailParams {
  to: string;
  recipientName?: string;
  templateType: 'welcome' | 'update' | 'maintenance' | 'reset_password' | 'promo' | 'custom' | 'topup_success' | 'build_success';
  subject?: string;
  customMessage?: string;
  amount?: number;
  tokensGranted?: number;
  appName?: string;
  packageName?: string;
  engineType?: string;
  downloadUrl?: string;
  invoiceId?: string;
}

/**
 * Asynchronous background email event trigger function.
 * Communicates directly with the backend cloud API (/api/send-email) silently in the background without UI interaction.
 */
export async function triggerEmailEvent(params: BackgroundEmailParams): Promise<void> {
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
        amount: params.amount,
        tokensGranted: params.tokensGranted,
        appName: params.appName || 'Web2App Studio',
        packageName: params.packageName,
        engineType: params.engineType,
        downloadUrl: params.downloadUrl,
        invoiceId: params.invoiceId,
        senderEmail: 'noreply@web2app.joo.exe'
      })
    });

    const data = await response.json();
    console.log(`[triggerEmailEvent] Dispatched email "${params.templateType}" to ${params.to}:`, data);
  } catch (err) {
    console.warn('[triggerEmailEvent] Silent background email error:', err);
  }
}

// Alias for backward compatibility
export const sendBackgroundEmail = triggerEmailEvent;

