"use client"; // Add this line

import initTranslations from "@/i18n";
import TranslationsProvider from "@components/TranslationsProvider";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Flex, Spin } from "antd";
import Loading from "@components/Loading";
import { useCart } from "@components/Admin/Cartcontext";
const Layout = ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const [t, setT] = useState<Function | null>(null);
  const [resources, setResources] = useState<any>(null);
  const pathname = usePathname();
  const [i18nNamespaces, setI18nNamespaces] = useState<string[]>([]);
  const { i18nName, updateNamespaces } = useCart();

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    updateNamespaces((namespaces: string[]) => setI18nNamespaces(namespaces)); // Pass a function that updates the state
  }, [updateNamespaces]);

  useEffect(() => {
    const array: string[] = [i18nName];
    setI18nNamespaces(array);

    const fetchTranslations = async () => {
      const { t, resources } = await initTranslations(locale, array);
      setT(() => t);
      setResources(resources);
    };

    fetchTranslations();
  }, [locale, i18nName]);

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

  if (!t || !resources || status === "loading") return <Loading />;

  return (
    <TranslationsProvider namespaces={i18nNamespaces} locale={locale} resources={resources}>
      <div>{children}</div>
    </TranslationsProvider>
  );
};



export default Layout;
