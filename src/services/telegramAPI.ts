import {PDFDocument} from '@/types/pdf';
import {TELEGRAM_CONFIG} from '@/config/telegram';

interface TelegramDocument {
  file_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
}

interface TelegramMessage {
  message_id: number;
  document?: TelegramDocument;
  caption?: string;
}

export const fetchPDFsFromChannel = async (): Promise<PDFDocument[]> => {
  try {
    // First, get the channel info to get the chat_id
    const channelInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getChat?chat_id=@${TELEGRAM_CONFIG.CHANNEL_USERNAME}`,
    );

    const channelInfo = await channelInfoResponse.json();
    console.log('Channel Info:', channelInfo);

    if (!channelInfo.ok) {
      throw new Error(`Channel error: ${channelInfo.description}`);
    }

    // Get messages from the channel
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getUpdates?allowed_updates=["channel_post"]`,
    );

    const data = await response.json();
    console.log('Messages Data:', data);

    if (!data.ok) {
      throw new Error(`API error: ${data.description}`);
    }

    // Filter and map PDF documents
    return data.result
      .filter(
        (update: any) =>
          update.channel_post?.document?.mime_type === 'application/pdf' ||
          update.message?.document?.mime_type === 'application/pdf',
      )
      .map((update: any) => {
        const doc = update.channel_post?.document || update.message?.document;
        const caption = update.channel_post?.caption || update.message?.caption;

        return {
          id: doc.file_id,
          title: caption || doc.file_name,
          url: `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.BOT_TOKEN}/${doc.file_id}`,
          lastReadPage: 1,
          totalPages: 0,
          language: detectLanguage(doc.file_name),
        };
      });
  } catch (error) {
    console.error('Error fetching PDFs from Telegram:', error);
    throw error;
  }
};

// Helper function to get the actual file path
export const getFileUrl = async (document: PDFDocument): Promise<string> => {
  if (document.url.includes('drive.google.com')) {
    const fileId = document.url.match(/[-\w]{25,}/);
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId[0]}`;
    } else {
      return document.url;
    }
  } else if (document.url.includes('telegram.me')) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getFile?file_id=${document.id}`,
      );

      const data = await response.json();

      if (!data.ok) {
        return document.url;
      }

      return `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.BOT_TOKEN}/${data.result.file_path}`;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return document.url;
    }
  } else {
    return document.url;
  }
};

const detectLanguage = (fileName: string): 'en' | 'ar' => {
  return /[\u0600-\u06FF]/.test(fileName) ? 'ar' : 'en';
};
