"use client";
import { SignInSchema, signInSchema } from "../lib/web/schemas/sign-in-schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import "../styles/login.scss";
import { Button, Form, Input } from "antd";
import {
  getSession,
  signIn,
} from "next-auth/react";
import {
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const SignInForm = ({ params }: { params: { locale: string } }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });
  const { t } = useTranslation();

  type FieldType = {
    email?: string;
    password?: string;
    remember?: string;
  };

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    setIsLoading(true);
    try {
      const ipResponse = await axios.get("/api/ip");
      const ipAddress = ipResponse.data;
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        toastError(signInResult?.error);
      } else {
        const session = await getSession();

        if (session?.user.status === "Pending") {
          localStorage.setItem("email", session.user.email);
          router.push(`/${params.locale}/admin/change-password`);
        } else {
          await axios.post(
            `/api/userLogs`,
            {
              userId: session?.user.id,
              ipAddress: ipAddress,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toastSuccess(t("sign_in_successfully"));
          router.replace(`/${params.locale}/admin`);
        }
      }
    } catch (error: any) {
      toastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="justify-center w-100">
        <div className="mb-4 font-semibold text-2xl text-center">
          <span>{t("Login to your account")}</span>
        </div>

        <Form
          className="pl-16 pr-16"
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={"optional"}
        >
          <Form.Item<FieldType>
            name="email"
            className="mb-2 pb-6"
            rules={[
              {
                required: true,
                message: t("please_input_your_email"),
              },
            ]}
          >
            <Input
              style={{ backgroundColor: "#f5f6ff" }}
              prefix={<MailOutlined />}
              className="rounded-lg"
              size="large"
              placeholder={t("Email Address")}
            />
          </Form.Item>
          <Form.Item<FieldType>
            name="password"
            rules={[
              {
                required: true,
                message: t("please_input_your_password"),
              },
            ]}
          >
            <Input.Password
              style={{ backgroundColor: "#f5f6ff" }}
              prefix={<LockOutlined />}
              className="rounded-lg"
              size="large"
              placeholder={t("password")}
            />
          </Form.Item>

          <Button
            type="primary"
            className="w-full flex items-center justify-center bg-black mt-4"
            htmlType="submit"
            loading={isLoading}
            disabled={isSubmitting || isLoading}
          >
            {t("Login")}
          </Button>
        </Form>
      </div>
    </>
  );
};

export default SignInForm;
