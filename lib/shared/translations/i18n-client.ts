"use client";

import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";
import i18next from "i18next";
import { i18nextOptions } from "./i18n-config";
import resourcesToBackend from "i18next-resources-to-backend";

// on client side the normal singleton is ok
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`public/locales/${language}/${namespace}.json`)))
  // .use(LocizeBackend) // locize backend could be used on client side, but prefer to keep it in sync with server side
  .init({
    ...i18nextOptions,
    lng: undefined, // let detect the language on client side
    detection: {
      order: ["querystring", "cookie", "htmlTag", "navigator"],
      caches: ["cookie"],
    },
  });

export const useTranslation = useTranslationOrg;
