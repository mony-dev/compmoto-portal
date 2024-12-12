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
    custNo?: string;
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
        custNo: data.custNo,
        password: data.password,
      });

      if (signInResult?.error) {
        toastError(signInResult?.error);
      } else {
        const session = await getSession();

        if (session?.user.status === "Pending") {
          localStorage.setItem("custNo", session.user.custNo);
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
        <div className="mb-4 text-center">
          <span className="font-semibold text-2xl default-font">{t("Login to your account")}</span>
        </div>

        <Form
          className="pl-16 pr-16"
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={"optional"}
        >
          <Form.Item<FieldType>
            name="custNo"
            className="mb-2 pb-6"
            rules={[
              {
                required: true,
                message: t("please_input_your_custNo"),
              },
            ]}
          >
            <Input
              style={{ backgroundColor: "#f5f6ff" }}
              prefix={<svg width="20" className="mr-2" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.30775 15.5C1.80258 15.5 1.375 15.325 1.025 14.975C0.675 14.625 0.5 14.1974 0.5 13.6923V2.30775C0.5 1.80258 0.675 1.375 1.025 1.025C1.375 0.675 1.80258 0.5 2.30775 0.5H17.6923C18.1974 0.5 18.625 0.675 18.975 1.025C19.325 1.375 19.5 1.80258 19.5 2.30775V13.6923C19.5 14.1974 19.325 14.625 18.975 14.975C18.625 15.325 18.1974 15.5 17.6923 15.5H2.30775ZM18 3.44225L10.4865 8.252C10.4097 8.2955 10.3302 8.32975 10.248 8.35475C10.166 8.37975 10.0833 8.39225 10 8.39225C9.91667 8.39225 9.834 8.37975 9.752 8.35475C9.66983 8.32975 9.59033 8.2955 9.5135 8.252L2 3.44225V13.6923C2 13.7821 2.02883 13.8558 2.0865 13.9135C2.14417 13.9712 2.21792 14 2.30775 14H17.6923C17.7821 14 17.8558 13.9712 17.9135 13.9135C17.9712 13.8558 18 13.7821 18 13.6923V3.44225ZM10 7L17.8463 2H2.15375L10 7ZM2 3.673V2.52975V2.5595V2.52775V3.673Z" fill="#FF99A7"/>
                </svg>
                }
              className="rounded-lg"
              size="large"
              placeholder={t("Cust No")}
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
              prefix={<svg className="mr-2" width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.30775 19.5C1.80908 19.5 1.38308 19.3234 1.02975 18.9703C0.676583 18.6169 0.5 18.1909 0.5 17.6923V8.30775C0.5 7.80908 0.676583 7.38308 1.02975 7.02975C1.38308 6.67658 1.80908 6.5 2.30775 6.5H3.5V4.5C3.5 3.25133 3.93783 2.18917 4.8135 1.3135C5.68917 0.437833 6.75133 0 8 0C9.24867 0 10.3108 0.437833 11.1865 1.3135C12.0622 2.18917 12.5 3.25133 12.5 4.5V6.5H13.6923C14.1909 6.5 14.6169 6.67658 14.9703 7.02975C15.3234 7.38308 15.5 7.80908 15.5 8.30775V17.6923C15.5 18.1909 15.3234 18.6169 14.9703 18.9703C14.6169 19.3234 14.1909 19.5 13.6923 19.5H2.30775ZM2.30775 18H13.6923C13.7821 18 13.8558 17.9712 13.9135 17.9135C13.9712 17.8558 14 17.7821 14 17.6923V8.30775C14 8.21792 13.9712 8.14417 13.9135 8.0865C13.8558 8.02883 13.7821 8 13.6923 8H2.30775C2.21792 8 2.14417 8.02883 2.0865 8.0865C2.02883 8.14417 2 8.21792 2 8.30775V17.6923C2 17.7821 2.02883 17.8558 2.0865 17.9135C2.14417 17.9712 2.21792 18 2.30775 18ZM8 14.75C8.48583 14.75 8.899 14.5798 9.2395 14.2395C9.57983 13.899 9.75 13.4858 9.75 13C9.75 12.5142 9.57983 12.101 9.2395 11.7605C8.899 11.4202 8.48583 11.25 8 11.25C7.51417 11.25 7.101 11.4202 6.7605 11.7605C6.42017 12.101 6.25 12.5142 6.25 13C6.25 13.4858 6.42017 13.899 6.7605 14.2395C7.101 14.5798 7.51417 14.75 8 14.75ZM5 6.5H11V4.5C11 3.66667 10.7083 2.95833 10.125 2.375C9.54167 1.79167 8.83333 1.5 8 1.5C7.16667 1.5 6.45833 1.79167 5.875 2.375C5.29167 2.95833 5 3.66667 5 4.5V6.5Z" fill="#FF99A7"/>
                </svg>
                }
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
