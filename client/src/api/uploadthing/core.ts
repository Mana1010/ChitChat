import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getToken } from "next-auth/jwt";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  documentUpload: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await getToken({ req });
      if (!session) {
        console.log("Failed");
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.sub };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload Success!!");
      return { data: "Slayyy" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
