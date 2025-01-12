import {PDFDocument} from '../types/pdf';

const NOTION_API_KEY = 'secret_7w7J3TaNbs90gYWAxpSd1rn9VYjO9jddoFwgLrASGOy';
const DATABASE_ID = '14f72625e9a4812e86ebe21834c39bab';

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
      url: page.properties.Link.url,
      lastReadPage: 1,
      totalPages: 0,
      language: 'en',
    }));
  } catch (error) {
    console.error('Error fetching PDFs from Notion:', error);
    throw error;
  }
}; 