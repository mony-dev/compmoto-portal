"use client";

import { useCart } from "@components/Admin/Cartcontext";
import Loading from "@components/Loading";
import SignInForm from "@components/SignInForm";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SignIn = ({
  params,
}: {
  params: { locale: string };
}) => {
  const { t } = useTranslation();
  const [loading, setLoading ] = useState(true);
  const {setI18nName} = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart)
    setLoading(false)
  }, []);

  if (loading || !t) {
    return (
      <Loading/>
    );
  }
  return (
    <SignInForm params={{
      locale: params.locale
    }} />
  );
};

export default SignIn;
