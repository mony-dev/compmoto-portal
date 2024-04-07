import { Language, Prisma } from "@prisma/client";

import { Language as AppLanguage } from "@shared/translations/i18n-config";

export function getJsonEnumurators(key: string, value: string, langs: string[]): Prisma.Enumerable<any>[] {
  const result: Prisma.Enumerable<any>[] = [];

  langs.forEach((item) => {
    let data: Prisma.Enumerable<any> = {};
    data[key] = { path: [item], equals: value };
    result.push(data);
  });

  return result;
}

export function convertToPrismaLanguage(language: string | AppLanguage): Language {
  switch (language) {
    case AppLanguage.ENGLISH: {
      return Language.English;
    }
    case AppLanguage.THAI: {
      return Language.Thai;
    }
    default: {
      return Language.English;
    }
  }
}

export function getTranslationStringFromPrismaJson(value?: Prisma.JsonValue | null): string {
  if (!value) return "";
  const jsonObject = value as Prisma.JsonObject;
  return jsonObject.en?.toString() || jsonObject.th?.toString() || jsonObject.my?.toString() || "";
}
