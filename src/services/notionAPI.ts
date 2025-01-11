import {PDFDocument} from '../types/pdf';

const NOTION_API_KEY = 'YOUR_NOTION_API_KEY';
const DATABASE_ID = 'YOUR_DATABASE_ID';

export const fetchPDFsFromNotion = async (): Promise<PDFDocument[]> => {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();

    return data.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Title.title[0].plain_text,
      url: page.properties.URL.url,
      lastReadPage: 1,
      totalPages: 0,
      language: page.properties.Language.select.name,
    }));
  } catch (error) {
    console.error('Error fetching PDFs from Notion:', error);
    throw error;
  }
}; 