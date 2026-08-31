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