import { axiosInstance } from "./axios";

export const documentUser = async (params: any) => {
  const res = await axiosInstance.get(
    `/document/list?${params.toString()}`
  );
  return res;
};

export const getDocumentDetail = async (documentId: string) => {
  const res = await axiosInstance.get(`/document/${documentId}`);
  return res;
};

// app/api/document.ts mein add karo

export const downloadExcel = async (params?: URLSearchParams) => {
  const query = params ? `?${params.toString()}` : "";
  const res = await axiosInstance.get(`/document/download/excel${query}`, {
    responseType: "blob", // important — binary data ke liye
  });
  return res;
};