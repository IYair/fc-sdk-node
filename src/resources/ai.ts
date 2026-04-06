import { HttpClient } from '../client';
import { AiInvoicePreview, AiCopilotResponse, Cfdi } from '../types';

export class AiResource {
  constructor(private readonly client: HttpClient) {}

  createFromText(text: string, confirm?: boolean): Promise<AiInvoicePreview> {
    return this.client.post<AiInvoicePreview>('/api/v1/ai/invoice-from-text', {
      text,
      confirm,
    });
  }

  confirmInvoice(token: string): Promise<Cfdi> {
    return this.client.post<Cfdi>('/api/v1/ai/invoice-from-text/confirm', {
      confirmation_token: token,
    });
  }

  copilot(message: string, conversationId?: string): Promise<AiCopilotResponse> {
    return this.client.post<AiCopilotResponse>('/api/v1/ai/copilot', {
      message,
      conversation_id: conversationId,
    });
  }
}
