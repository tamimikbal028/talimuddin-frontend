import { getActiveUserId, supabase } from "@/config/supabase";
import type { ApiResponse } from "@/types";
import { createApiResponse } from "@/utils/apiResponse";
import { compressImage } from "@/utils/imageUpload";
import { getBranchAccessContext } from "@/utils/supabaseHelpers";

interface UploadTargetConfig {
  tableName: "users" | "branches";
  columnName: "avatar" | "cover_image";
  bucketName: "profile_assets" | "branch_assets";
  recordId: string;
  folder: string;
}

const getRelativePathFromUrl = (
  url: string,
  bucketName: string
): string | null => {
  if (!url) return null;
  const searchStr = `/storage/v1/object/public/${bucketName}/`;
  const index = url.indexOf(searchStr);
  if (index !== -1) {
    return url.substring(index + searchStr.length);
  }
  return null;
};

const resolveUploadConfig = async (
  uploadType: string,
  entityId?: string
): Promise<UploadTargetConfig> => {
  const userId = await getActiveUserId();

  if (uploadType === "profile_avatar") {
    return {
      tableName: "users",
      columnName: "avatar",
      bucketName: "profile_assets",
      recordId: userId,
      folder: `${userId}/avatar`,
    };
  }

  if (uploadType === "branch_cover") {
    if (!entityId) {
      throw new Error("Missing entityId for branch_cover upload");
    }
    await getBranchAccessContext(entityId, userId, {
      requireStrictAdmin: true,
    });
    return {
      tableName: "branches",
      columnName: "cover_image",
      bucketName: "branch_assets",
      recordId: entityId,
      folder: `${entityId}/cover`,
    };
  }

  throw new Error("Invalid or missing uploadType");
};

export const uploadSingleImage = async (
  file: File,
  uploadType: string,
  entityId?: string
): Promise<ApiResponse<{ url: string }>> => {
  const config = await resolveUploadConfig(uploadType, entityId);

  let finalFile = file;
  try {
    finalFile = await compressImage(file);
  } catch (err) {
    console.error("Image compression failed, using original file", err);
  }

  // Fetch current record to clean up old asset after update
  const { data: currentRecord, error: fetchError } = await supabase
    .from(config.tableName)
    .select(config.columnName)
    .eq("id", config.recordId)
    .maybeSingle();

  if (fetchError || !currentRecord) {
    throw new Error("Record not found");
  }

  const oldUrl = (currentRecord as Record<string, string | null>)[
    config.columnName
  ];

  const safeName = finalFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const destinationPath = `${config.folder}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(config.bucketName)
    .upload(destinationPath, finalFile, {
      upsert: true,
      contentType: finalFile.type || undefined,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message || "Error uploading image to storage"
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(config.bucketName).getPublicUrl(destinationPath);

  if (!publicUrl) {
    throw new Error("Failed to get uploaded image public URL");
  }

  const { error: updateError } = await supabase
    .from(config.tableName)
    .update({ [config.columnName]: publicUrl })
    .eq("id", config.recordId);

  if (updateError) {
    await supabase.storage
      .from(config.bucketName)
      .remove([destinationPath])
      .catch(() => undefined);
    throw new Error(updateError.message || "Failed to update record in database");
  }

  if (oldUrl && oldUrl.includes("supabase.co")) {
    const oldPath = getRelativePathFromUrl(oldUrl, config.bucketName);
    if (oldPath && oldPath !== destinationPath) {
      await supabase.storage
        .from(config.bucketName)
        .remove([oldPath])
        .catch(() => undefined);
    }
  }

  return createApiResponse(
    { url: publicUrl },
    "Image uploaded successfully"
  );
};

const fileUploadServices = {
  uploadSingleImage,
} as const;

export default fileUploadServices;
