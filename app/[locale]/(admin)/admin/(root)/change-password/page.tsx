"use client";

import ChangePasswordForm from "@components/ChangePasswordForm";
import { useSession } from "next-auth/react";
import { useCurrentLocale } from "next-i18n-router/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import i18nConfig from "../../../../../../i18nConfig";

const ChangePassword = () => {
  const { data: session, status } = useSession()
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const locale = useCurrentLocale(i18nConfig);
  useEffect(() => {
    let getEmail = localStorage.getItem('email')
    setEmail(getEmail);
    if (!getEmail) {
      router.push(`/${locale}`);
      return;
    }
  }, [email]);

  if (status === "loading" || !email) {
    return <div>Loading...</div> 
  } else {
    return (
      <ChangePasswordForm />
    );
  }
  
};

export default ChangePassword;
