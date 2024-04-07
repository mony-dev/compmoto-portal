// import { fallbackLng, i18nextOptions } from "./i18n-config";
// import i18next, { i18n } from "i18next";

// import Backend from "i18next-fs-backend";

// let globalInstance: i18n;

// export default function t(namespace: string, language: string = fallbackLng) {
//   const options = i18nextOptions;
//   options.lng = language;
//   options.ns = namespace;
//   options.defaultNS = namespace;
//   let instance = i18next.createInstance(options);

//   if (!globalInstance) {
//     globalInstance = i18next.createInstance(options);
//     instance = globalInstance;
//   } else {
//     instance = globalInstance.cloneInstance(options);
//   }

//   if (!instance.isInitialized) {
//     instance.use(Backend).init(options);
//   }

//   return instance.t;
// }

// export async function useTranslationServer(namespace: string) {
//   const translate = t(namespace);
//   return { t: translate };
// }
