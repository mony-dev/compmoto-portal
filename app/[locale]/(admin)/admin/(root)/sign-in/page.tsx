"use client";

import { useCart } from "@components/Admin/Cartcontext";
import Loading from "@components/Loading";
import SignInForm from "@components/SignInForm";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../i18nConfig";
import Image from "next/image";
import LoginLogo from "@public/images/login.jpg";

const SignIn = ({ params }: { params: { locale: string } }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const { setI18nName } = useCart();
  const pathname = usePathname();
  const locale = useCurrentLocale(i18nConfig);
  const currentLocale = i18n.language;
  const router = useRouter();

  const currentPathname = pathname;
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
    setLoading(false);
  }, []);

  const handleChange = (newLocale: string) => {
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // Redirect to the new locale path
    let newPathname = currentPathname;
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      newPathname = "/" + newLocale + currentPathname;
    } else {
      newPathname = currentPathname.replace(
        `/${currentLocale}`,
        `/${newLocale}`,
      );
    }
    // Add query parameters to newPathname if they exist
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.search;

    if (queryParams) {
      newPathname += queryParams;
    }

    router.push(newPathname as any); // Using 'any' to bypass the type error
  };

  if (loading || !t) {
    return <Loading />;
  }

  return (
    <div className="relative w-full bg-cover bg-fixed bg-no-repeat bg-right bg-backgroundImage min-h-[100svh]">
      {/* Language switch */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-10 text-sm z-30 select-none">
        <span
          className={classNames("cursor-pointer mx-2", {
            "p-0.5 px-1 rounded-md text-white bg-comp-red": locale === "th",
          })}
          onClick={() => handleChange("th")}
        >
          TH
        </span>
        |
        <span
          className={classNames("cursor-pointer mx-2", {
            "p-0.5 px-1 rounded-md text-white bg-comp-red": locale === "en",
          })}
          onClick={() => handleChange("en")}
        >
          EN
        </span>
      </div>

      <div className="flex items-center justify-center w-full min-h-[100svh] px-4 py-10 sm:py-12">
        <div className="relative w-full max-w-[600px]">
          <div className="absolute inset-0 -rotate-12 rounded-[30px] bg-comp-red-hover z-0" />
          <div className="absolute inset-0 rotate-12 rounded-[30px] bg-comp-red z-10" />
          <div
            className="relative z-20 w-full
                        rounded-[30px]
                        bg-white
                        px-6 sm:px-12
                        pt-8 pb-10
                        sm:min-h-[445px]
                        lg:min-h-[445px]"
            style={{ boxShadow: "0px 25px 42px rgba(123, 103, 251, 0.2)" }}
          >
            <div
              className="flex justify-center text-center"
              style={{ color: "#A8A8AF" }}
            >
              <Image
                src={LoginLogo}
                alt="compmoto-login"
                priority
                className="rounded-lg w-auto max-h-20 sm:max-h-24 md:max-h-28 animate-img"
              />
            </div>
            <div className="mt-6">
              <SignInForm params={{ locale: params.locale }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
