import { v2 as cloudinary } from "cloudinary";

export const uploadFileCloudinary = async (
  fileName: string,
  folderDir: string
) => {
  return await cloudinary.uploader.upload(fileName, {
    folder: `Chitchat/${folderDir}`,
    upload_preset: "yxnopucd",
  });
};

export const deleteFileCloudinary = async (publicId: string[]) => {
  return await cloudinary.api.delete_resources(publicId, {
    type: "upload",
    resource_type: "image",
  });
};

export const retrieveFileCloudinary = async (publicId: string) => {
  return cloudinary.url(publicId);
};
