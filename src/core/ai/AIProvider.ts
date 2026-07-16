export interface AIRequest {
  prompt: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  provider: string;
  createdAt: Date;
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}