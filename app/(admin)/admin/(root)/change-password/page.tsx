"use client";

import ChangePasswordForm from "@components/ChangePasswordForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ChangePassword = () => {
  const { data: session, status } = useSession()
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let getEmail = localStorage.getItem('email')
    setEmail(getEmail);
    if (!getEmail) {
      router.push('/');
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
