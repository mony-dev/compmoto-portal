import { SignInResponse, signIn } from "next-auth/react";
import { SignInSchema, signInSchema } from "../lib/web/schemas/sign-in-schema";
import { handleAPIError, toastSuccess } from "../lib/web/utils/helper";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslation } from "@shared/translations/i18n-client";
import { SingInFormButton } from "./Admin/Button/Button";
import { useState } from "react";
import LogoComp from "./Admin/LogoCompmoto";
import LogoCOM from "../public/images/comp_moto_logo.png";

const SignInForm = () => {
  // const { t } = useTranslation("admin");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });
  // @ts-ignore
  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    router.replace("/admin/dashboards");

    // const signInResult = (await signIn("credentials", {
    //   ...data,
    //   redirect: false,
    // })) as unknown as SignInResponse;
    // if (signInResult.error) {
    //   handleAPIError(signInResult.error);
    // } else {
    //   router.replace("/admin/dashboards");
    //   // toastSuccess(t("signIn.sign_in_successfully"));
    //   toastSuccess("sign_in_successfully");

    // }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col flex-wrap justify-center h-screen">
        <div className="mx-auto w-96">
          <div className="relative flex flex-col items-stretch w-full gap-8 p-10 pt-16 bg-black shadow-md h-max rounded-s-3">
            <LogoComp src={LogoCOM.src} width={175} height={45} alt="logo" />
            <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="relative z-0 flex flex-col gap-4">
                <label htmlFor="email">email</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  placeholder="email"
                  className={`block w-auto p-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="mt-2 text-base text-red-500"> {errors.email?.message}</p>}
              </div>
              <div className="relative z-0 flex flex-col gap-4">
                <label htmlFor="password">password</label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  placeholder="password"
                  className={`block w-auto p-2 border rounded-lg ${errors.password ? "border-red-500" : "border-l2t-purple"}`}
                />
                {errors.password && <p className="mt-2 text-base text-red-500">{errors.password?.message}</p>}
              </div>
              <div>
                <SingInFormButton isLoading={isLoading || isSubmitting}>sign in</SingInFormButton>
              </div>
              <div className="flex items-stretch justify-center hover:text-gray-500 ">
                {/* <Link href="" passHref>
                  {t("signIn.reset_password")}
                </Link> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
