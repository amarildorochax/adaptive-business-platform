export interface BlogOutput {
  fileName: string;
  content: string;
  createdAt: Date;
}

export class BlogOutputService {
  create(fileName: string, content: string): BlogOutput {
    return {
      fileName,
      content,
      createdAt: new Date(),
    };
  }
}

export const blogOutputService = new BlogOutputService();