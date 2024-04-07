// import { AWSS3Path, AWSS3Type } from "@lib-shared/constants/aws-constants";
// import { FileData, PostData } from "@lib-shared/models/model-type";
// import { Language, Prisma } from "@prisma/client";
// import { copyFile, deleteFile } from "@lib-shared/services/aws-services";

// import { FileBody } from "@lib-shared/schemas/base-schema";
// import prisma from "@lib-shared/tools/prisma/prisma";

// export enum FileAction {
//   Update = "update",
//   Delete = "delete",
// }

// export async function moveToFileReference(
//   model: PostData,
//   params: FileBody | undefined,
//   path: AWSS3Path,
//   type: AWSS3Type,
//   language: Language,
//   isPublic = false
// ): Promise<FileData | null> {
//   if (!params) return null;
//   const getLanguage = (value: Language): string => {
//     switch (value) {
//       case Language.English:
//         return "en";
//       case Language.Thai:
//         return "th";
//       case Language.Burmese:
//         return "my";
//       default:
//         return "en";
//     }
//   };

//   const fileName = params.fileName;

//   if (params.action == FileAction.Delete) {
//     const file = await prisma.file.findFirstOrThrow({ where: { id: params.id } });
//     await prisma.file.delete({ where: { id: file.id } });
//     await deleteFile(file.filePath);
//   } else if ((params.action == FileAction.Update || !params.id) && fileName) {
//     const filePath = `${path}/${model.id}/${type}/${getLanguage(language)}/${fileName}`;
//     await copyFile(`temps/${fileName}`, filePath, isPublic);
//     const data: Prisma.FileUncheckedCreateInput = {
//       fileName,
//       filePath,
//       language,
//       contentType: params.contentType,
//       postId: model.id ? model.id : undefined,
//     };
//     if (params.id) {
//       return await prisma.file.update({ where: { id: params.id }, data });
//     } else {
//       return await prisma.file.create({ data });
//     }
//   }
//   return null;
// }
