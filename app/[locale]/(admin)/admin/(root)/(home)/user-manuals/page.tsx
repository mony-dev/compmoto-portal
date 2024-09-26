"use client";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";

const Loading = dynamic(() => import("@components/Loading"));
const ManualList = dynamic(() => import("@components/ManualList"));


export default function adminUserManual() {
  const { t } = useTranslation();
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();

  interface DataType {
    id: number;
    key: number;
    name: string;
    content: string;
  }
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
  }, []);
  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
     
        <p className="text-3xl font-semibold pb-4 default-font">{t('Guide')}</p>
        <p className="text-base text-[#959596] pb-4 default-font">{t('The Guide page is your go-to resource for step-by-step instructions and helpful tips')}</p>
      </div>
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white mt-4"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <ManualList type="manual"/>
      </div>
    </div>
  );
}
