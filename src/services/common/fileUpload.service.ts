import api from "@/config/axios";
import type { ApiResponse } from "@/types";
import { compressImage } from "@/utils/imageUpload";

export const uploadSingleImage = async (
  file: File,
  uploadType: string,
  entityId?: string
): Promise<ApiResponse<{ url: string }>> => {
  // Compress image on the client side before uploading
  let finalFile = file;
  try {
    finalFile = await compressImage(file);
    console.log(
      `Image compressed: original = ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB, compressed = ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`
    );
  } catch (err) {
    console.error("Image compression failed, using original file", err);
  }

  const formData = new FormData();
  formData.append("image", finalFile);
  formData.append("uploadType", uploadType);
  if (entityId) {
    formData.append("entityId", entityId);
  }
  const response = await api.patch<ApiResponse<{ url: string }>>(
    "/uploads/single-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds timeout override
    }
  );
  return response.data;
};

const fileUploadServices = {
  uploadSingleImage,
} as const;

export default fileUploadServices;
