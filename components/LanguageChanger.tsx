import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18nConfig from '../i18nConfig';

const LanguageChanger = () => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const pathname = usePathname();
  const router = useRouter();

  const currentPathname = pathname;

  const handleChange = (newLocale: string) => {
    // Set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // Redirect to the new locale path
    let newPathname = currentPathname;
    if (currentLocale === i18nConfig.defaultLocale && !i18nConfig.prefixDefault) {
      newPathname = '/' + newLocale + currentPathname;
    } else {
      newPathname = currentPathname.replace(`/${currentLocale}`, `/${newLocale}`);
    }
    // Add query parameters to newPathname if they exist
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.search;

    if (queryParams) {
      newPathname += queryParams;
    }

  console.log("newPathname", newPathname);
  router.push(newPathname as any); // Using 'any' to bypass the type error
  };

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'th' : 'en';
    handleChange(newLocale);
  };

  return (
    <div
      className="flex items-center text-comp-red text-sm px-12 gotham-font cursor-pointer"
      style={{
        borderRight: "1px solid #DD2C37",
        height: "100%",
        alignSelf: "center",
      }}
      onClick={toggleLanguage}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.50008 13.3333C10.7217 13.3333 13.3334 10.7216 13.3334 7.49996C13.3334 4.2783 10.7217 1.66663 7.50008 1.66663C4.27842 1.66663 1.66675 4.2783 1.66675 7.49996C1.66675 10.7216 4.27842 13.3333 7.50008 13.3333Z"
          stroke="#DD2C37"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.1667 2.25H5.75004C4.61254 5.65667 4.61254 9.34333 5.75004 12.75H5.1667"
          stroke="#DD2C37"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.25 2.25C10.3875 5.65667 10.3875 9.34333 9.25 12.75"
          stroke="#DD2C37"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.25 9.83333V9.25C5.65667 10.3875 9.34333 10.3875 12.75 9.25V9.83333"
          stroke="#DD2C37"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.25 5.74998C5.65667 4.61248 9.34333 4.61248 12.75 5.74998"
          stroke="#DD2C37"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="ps-2 text-comp-red">{currentLocale === 'en' ? 'ไทย' : 'English'}</p>
    </div>
  );
};

export default LanguageChanger;
