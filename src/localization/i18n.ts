import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      myLibrary: 'My Library',
      downloadedBooks: 'Downloaded Books',
      currentPage: 'Current Page',
      bookmark: 'Bookmark',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      noDocuments: 'No documents available',
      pageOf: 'Page {{current}} of {{total}}',
      downloadComplete: 'Download complete',
      downloadError: 'Error downloading file',
      openDocument: 'Open Document',
      deleteDocument: 'Delete Document',
    },
  },
  ar: {
    translation: {
      myLibrary: 'مكتبتي',
      downloadedBooks: 'الكتب المحملة',
      currentPage: 'الصفحة الحالية',
      bookmark: 'إشارة مرجعية',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      retry: 'إعادة المحاولة',
      noDocuments: 'لا توجد مستندات متاحة',
      pageOf: 'صفحة {{current}} من {{total}}',
      downloadComplete: 'اكتمل التحميل',
      downloadError: 'خطأ في تحميل الملف',
      openDocument: 'فتح المستند',
      deleteDocument: 'حذف المستند',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 