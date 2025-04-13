import type { RootStackParamList } from "@/navigation/types";

// export type RootStackParamList = {
//   Library: undefined;
//   PDFViewer: {
//     document: PDFDocument;
//   };
//   ...Params
// };

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
