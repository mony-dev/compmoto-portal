"use client";
import { SignInSchema, signInSchema } from "../lib/web/schemas/sign-in-schema";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import LoginLogo from "@public/images/login.png";
import Image from "next/image";
import "../styles/login.scss";
import { Button, Checkbox, Form, FormProps, Input } from "antd";
import { getSession, signIn, SignInResponse, useSession } from "next-auth/react";
import { handleAPIError, toastError, toastSuccess } from "@lib-utils/helper";
import axios from "axios";

const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  type FieldType = {
    email?: string;
    password?: string;
    remember?: string;
  };

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    const ipResponse = await axios.get('/api/ip');
    const ipAddress = ipResponse.data;
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (signInResult?.error) {
      if (signInResult.error.startsWith("Change password required")) {
        const email = signInResult.error.split(":")[1];
        localStorage.setItem("email", email);
        router.push("/admin/change-password");
      }
      handleAPIError(signInResult.error);
    } else {
      // toastSuccess(t("signIn.sign_in_successfully"));
      const session = await getSession();
      const response = await axios
        .post(`/api/userLogs`, {
          userId: session?.user.id,
          ipAddress: ipAddress
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          router.replace("/admin");
          toastSuccess("sign_in_successfully");
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  return (
    <>
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <div className="login100-pic js-tilt">
              <Image
                className="rounded-lg w-fit	h-4/5 animate-img"
                width={150}
                height={30}
                src={LoginLogo.src}
                alt={"compmoto-login"}
              />
            </div>
            <Form
              name="basic"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              style={{
                maxWidth: 600,
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={onSubmit}
              // onFinishFailed={}
              autoComplete="off"
              className="login100-form validate-form"
            >
              <span className="login100-form-title font-bold">
                Member Login
              </span>

              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your username!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </div>
              {/* <div className="wrap-input100">
                <Form.Item<FieldType>
                  name="remember"
                  valuePropName="checked"
                  wrapperCol={{ offset: 8, span: 16 }}
                >
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </div> */}

              <div className="container-login100-form-btn">
                <Button
                  type="primary"
                  className="login100-form-btn"
                  htmlType="submit"
                >
                  Submit
                </Button>
              </div>

              {/* <div className="text-center p-t-12">
                <span className="txt1">Forgot</span>
                <a className="txt2" href="#">
                  Username / Password?
                </a>
              </div> */}
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
