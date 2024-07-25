"use client";

import SignInForm from "@components/SignInForm";

const SignIn = ({
  params,
}: {
  params: { locale: string };
}) => {
  return (
    <SignInForm params={{
      locale: params.locale
    }} />
  );
};

export default SignIn;
