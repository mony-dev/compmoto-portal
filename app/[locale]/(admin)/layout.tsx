'use client'; // Add this line

import initTranslations from "@/i18n";
import TranslationsProvider from "@components/TranslationsProvider";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
const Layout = ({ children, params: { locale }  }: { children: React.ReactNode, params: { locale: string }  }) => {
  const [t, setT] = React.useState<Function | null>(null); // Use useState to manage translations
  const [resources, setResources] = React.useState<any>(null); // Manage resources
  const pathname = usePathname()
  const [i18nNamespaces, setI18nNamespaces] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
      const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
      const array: string[] = [];
      array.push(lastPart);
      setI18nNamespaces(array);
      const fetchTranslations = async () => {
          const { t, resources } = await initTranslations(locale, array);
          setT(() => t);
          setResources(resources);
      };

      fetchTranslations();
  }, [locale]);

  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.push(`/${locale}/admin/sign-in`);
      } else if (pathname === `/${locale}/admin/sign-in`) {
        switch (session.user.role) {
          case "ADMIN":
            router.push(`/${locale}/admin/admins`);
            break;
          case "USER":
            router.push(`/${locale}/admin/dashboards`);
            break;
          case "CLAIM":
            router.push(`/${locale}/admin/adminClaim`);
            break;
          case "SALE":
            router.push(`/${locale}/admin/adminOrder`);
            break;
          default:
            break;
        }
      }
    }
  }, [status, session, locale, router]);
  
  if (!t || !resources || status === "loading" ) return <h1>Loading...</h1>; // Show loading state

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <div>{children}</div>
    </TranslationsProvider>
  );
};

export default Layout;
