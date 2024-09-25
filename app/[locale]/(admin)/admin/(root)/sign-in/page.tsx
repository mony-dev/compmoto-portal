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

  router.push(newPathname as any); // Using 'any' to bypass the type error
  };


  if (loading || !t) {
    return <Loading />;
  }

  return (
    <div
      className="h-screen w-full bg-cover bg-fixed bg-no-repeat bg-right relative bg-backgroundImage"
      // style={{
      //   backgroundImage: `url(${Background})`,
      // }}
    >
      <div className="absolute top-8 right-10 text-sm z-30">
        <span
          className={classNames("cursor-pointer mx-2", {
            "p-0.5 px-1 rounded-md text-white bg-comp-red": locale === "th",
          })}
          // onClick={() => i18n.changeLanguage('th')}
          onClick={() => handleChange('th')}

        >
          TH
        </span>
        |
        <span
          className={classNames("cursor-pointer  mx-2 ", {
            "p-0.5 px-1 rounded-md text-white bg-comp-red": locale === "en",
          })}
          onClick={() => handleChange('en')}
        >
          EN
        </span>
      </div>

      <div className="flex flex-col justify-center items-center w-full h-screen ">
        <div
          className={classNames(
            "w-[600px] h-[445px] m-auto rounded-[30px] pb-24 px-12 bg-white z-30 relative"
            // { 'h-[545px]': currentPageAction?.name !== 'LOGIN' }
          )}
          style={{
            boxShadow: "0px 25px 42px rgba(123, 103, 251, 0.2)",
          }}
        >
          <div
            // hidden={currentPageAction?.name !== 'LOGIN'}
            className="flex justify-center"
            style={{ color: "#A8A8AF", textAlign: "center" }}
          >
              <Image
                className="rounded-lg w-fit	h-4/5 animate-img"
                width={100}
                height={30}
                src={LoginLogo.src}
                alt={"compmoto-login"}
              />
          </div>
          <SignInForm
            params={{
              locale: params.locale,
            }}
          />
        </div>
        <div
          className={classNames(
            "absolute bg-comp-red-hover w-[600px] h-[445px] rounded-[30px] inset-auto -rotate-12 z-0"
            // { 'h-[545px]': currentPageAction?.name !== 'LOGIN' }
          )}
        />
        <div
          className={classNames(
            "absolute bg-comp-red w-[600px] h-[445px] rounded-[30px] inset-auto rotate-12 z-10"
            // { 'h-[545px]': currentPageAction?.name !== 'LOGIN' }
          )}
        />
      </div>
    </div>
  );
};

export default SignIn;
