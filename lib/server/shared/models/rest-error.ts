// import HTTPStatusCode from "@lib-shared/constants/http-status-code";
// import { Language } from "@shared/translations/i18n-config";
// import i18n from "@shared/translations/i18n";
// const t = i18n("api");
// export class RestError extends Error {
//   constructor(
//     readonly code: HTTPStatusCode,
//     readonly errorTitle?: string,
//     readonly errorMessage?: string,
//     readonly tKey?: string,
//     readonly tParams?: any,
//     readonly language?: Language | string
//   ) {
//     super(tKey ? t(tKey, { lng: language }).toString() : errorMessage ?? "RestError");
//   }

//   static unauthorized = new RestError(HTTPStatusCode.UNAUTHORIZED, undefined, undefined, "error.unauthorized");
//   static methodNotAllowed = new RestError(HTTPStatusCode.METHOD_NOT_ALLOWED, undefined, undefined, "error.method_not_allowed");
//   static internalServerError = new RestError(HTTPStatusCode.INTERNAL_SERVER_ERROR, undefined, undefined, "error.internal_server_error");
//   static invalidBody = new RestError(HTTPStatusCode.UNPROCESSABLE_ENTITY, undefined, undefined, "error.invalid_body");
//   static wrongProccess = new RestError(HTTPStatusCode.UNPROCESSABLE_ENTITY, undefined, undefined, "error.wrong_process");
//   static notFound = new RestError(HTTPStatusCode.NOT_FOUND, undefined, undefined, "error.not_found");
// }

// export function restErrorUnprocessable(tKey: string, tParams?: any, language: Language | string = Language.ENGLISH) {
//   return new RestError(HTTPStatusCode.UNPROCESSABLE_ENTITY, undefined, undefined, tKey, tParams, language);
// }

// export function restErrorNotFound(tKey: string, tParams?: any, language: Language | string = Language.ENGLISH) {
//   return new RestError(HTTPStatusCode.NOT_FOUND, undefined, undefined, tKey, tParams, language);
// }

// export function restErrorUnauthorized(tKey: string, tParams?: any, language: Language | string = Language.ENGLISH) {
//   return new RestError(HTTPStatusCode.UNAUTHORIZED, undefined, undefined, tKey, tParams, language);
// }
