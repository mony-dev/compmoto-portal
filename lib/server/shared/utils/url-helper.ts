import { NextURL } from "next/dist/server/web/next-url";

export function convertURLParamsToObject(params: URLSearchParams) {
  const paramsObject: { [key: string]: string } = {};
  params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  return paramsObject;
}

export function getActionPathValue(nextUrl: NextURL) {
  return nextUrl.pathname.split("/").pop();
}

export function getPathValue(nextUrl: NextURL, pathPrefix: string): string | null {
  const paths = nextUrl.pathname.split("/");
  return paths[paths.findIndex((item) => item === pathPrefix) + 1] || null;
}

export function isURL(url?: string | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
