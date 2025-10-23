import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nRouter } from "next-i18n-router";
import i18nConfig from "./i18nConfig";
import { getToken } from "next-auth/jwt";

type Role = "ADMIN" | "USER" | "CLAIM" | "SALE";

// ---- ACL (strip locale before matching)
const ACL: Array<{ path: string; roles: Role[] }> = [
  { path: "/admin/admins", roles: ["ADMIN"] },
  { path: "/admin/users", roles: ["ADMIN"] },
  { path: "/admin/userLogs", roles: ["ADMIN"] },
  { path: "/admin/adminTotalPurchase", roles: ["ADMIN"] },
  { path: "/admin/adminSpecialBonus", roles: ["ADMIN"] },
  { path: "/admin/adminRewardPoint", roles: ["ADMIN"] },
  { path: "/admin/adminReward", roles: ["ADMIN"] },
  { path: "/admin/adminRewardPointHistory", roles: ["ADMIN"] },
  { path: "/admin/adminMinisize", roles: ["ADMIN"] },
  { path: "/admin/adminProduct", roles: ["ADMIN"] },
  { path: "/admin/adminPromotion", roles: ["ADMIN"] },
  { path: "/admin/adminMedia", roles: ["ADMIN"] },
  { path: "/admin/adminNews", roles: ["ADMIN"] },
  { path: "/admin/adminSyncBrand", roles: ["ADMIN"] },
  { path: "/admin/adminSyncComrate", roles: ["ADMIN"] },
  { path: "/admin/adminSyncFamily", roles: ["ADMIN"] },
  { path: "/admin/adminSyncGroupType", roles: ["ADMIN"] },
  { path: "/admin/adminSyncProductGroup", roles: ["ADMIN"] },
  { path: "/admin/adminSyncRim", roles: ["ADMIN"] },
  { path: "/admin/adminSyncSize", roles: ["ADMIN"] },
  { path: "/admin/adminBrand", roles: ["ADMIN"] },

  { path: "/admin/adminOrder", roles: ["ADMIN", "SALE"] },
  { path: "/admin/adminBackOrder", roles: ["ADMIN", "SALE"] },
  { path: "/admin/adminInvoice", roles: ["ADMIN", "SALE"] },
  { path: "/admin/adminClaim", roles: ["ADMIN", "SALE", "CLAIM"] },

  { path: "/admin/dashboards", roles: ["USER"] },
  { path: "/admin/news", roles: ["USER"] },
  { path: "/admin/product", roles: ["USER"] },
  { path: "/admin/media", roles: ["USER"] },
  { path: "/admin/normalOrder", roles: ["USER"] },
  { path: "/admin/backOrder", roles: ["USER"] },
  { path: "/admin/invoice", roles: ["USER"] },
  { path: "/admin/reward", roles: ["USER"] },
  { path: "/admin/claim", roles: ["USER", "ADMIN", "CLAIM"] },
  { path: "/admin/claims", roles: ["USER"] },
  { path: "/admin/user-manuals", roles: ["USER"] },
  { path: "/admin/cart", roles: ["USER"] },
  { path: "/admin/specialBonusHistory", roles: ["USER"] },
  { path: "/admin/totalPurchaseHistory", roles: ["USER"] },
];

const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin/admins",
  USER: "/admin/dashboards",
  CLAIM: "/admin/adminClaim",
  SALE: "/admin/adminOrder",
};

export async function middleware(req: NextRequest) {
  // 0) skip obvious static files fast (keep matcher simple to avoid regex issues)
  const ext = req.nextUrl.pathname.split(".").pop();
  if (ext && ["png","jpg","jpeg","svg","gif","ico","webp","css","js","map"].includes(ext)) {
    return NextResponse.next();
  }

  // 1) i18n: only return if it’s a redirect/rewrite, not when it’s just NextResponse.next()
  const i18nRes = i18nRouter(req, i18nConfig);
  if (i18nRes) {
    const isRewrite = i18nRes.headers.get("x-middleware-rewrite");
    const isRedirect = i18nRes.headers.get("location");
    if (isRewrite || isRedirect) return i18nRes;
    // else: continue into auth/ACL
  }

  const { pathname } = req.nextUrl;

  // 2) locale detection
  const locales = (i18nConfig?.locales as string[]) ?? [];
  const defaultLocale = (i18nConfig?.defaultLocale as string) ?? "en";
  const [, maybeLocale] = pathname.split("/");
  const locale = locales.includes(maybeLocale) ? maybeLocale : defaultLocale;

  // 3) guard only /:locale/admin/**
  if (!pathname.startsWith(`/${locale}/admin`)) {
    return NextResponse.next();
  }

  const signInPath = `/${locale}/admin/sign-in`;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 4) Not signed in → only allow /sign-in
  if (!token) {
    if (pathname === signInPath) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = signInPath;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 5) Signed in but on /sign-in → send to role home
  if (pathname === signInPath) {
    const role = (token.role || "USER") as Role;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${HOME_BY_ROLE[role]}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 6) Role ACL
  const pathWithoutLocale = pathname.replace(`/${locale}`, ""); // e.g. /admin/admins
  const rule = ACL.find(r => pathWithoutLocale.startsWith(r.path));
  if (rule) {
    const role = (token.role || "USER") as Role;
    if (!rule.roles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${HOME_BY_ROLE[role]}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // no capturing groups! keep it simple and filter in code
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
