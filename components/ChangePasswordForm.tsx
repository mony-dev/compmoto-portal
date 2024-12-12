"use client";
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import "../styles/login.scss";

import Image from "next/image";
import axios from "axios";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
const ChangePasswordForm = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    let custNo = localStorage.getItem("custNo");
    try {
      const response = await axios.put(
        "/api/change-password",
        {
          currentPassword: values.currentPassword,
          confirmPassword: values.confirmPassword,
          newPassword: values.newPassword,
          custNo: custNo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.replace("/th/admin/sign-in");

      toastSuccess("Password updated successfully");
    } catch (error: any) {
      toastError(error.response.data.message);
    }
  };
  type FieldType = {
    currentPassword: string;
    confirmPassword: string;
    newPassword: string;
  };
  return (
    // <div className="limiter">
    //   <div className="container-login100">
    //     <div className="wrap-login100">
    //       <div className="login100-pic js-tilt">
    //         <Image
    //           className="rounded-lg w-fit	h-4/5 animate-img"
    //           width={150}
    //           height={30}
    //           src={LoginLogo.src}
    //           alt={"compmoto-login"}
    //         />
    //       </div>
    //       <Form
    //         name="basic"
    //         labelCol={{
    //           span: 8,
    //         }}
    //         wrapperCol={{
    //           span: 16,
    //         }}
    //         style={{
    //           maxWidth: 600,
    //         }}
    //         initialValues={{
    //           remember: true,
    //         }}
    //         onFinish={onFinish}
    //         autoComplete="off"
    //         className="login100-form validate-form"
    //       >
    //         <span className="login100-form-title font-bold">Change Password</span>
    //         <div className="wrap-input100">
    //           <Form.Item<FieldType>
    //             label="current"
    //             name="currentPassword"
    //             rules={[
    //               {
    //                 required: true,
    //                 message: "Please input your current password!",
    //               },
    //               { min: 6, message: 'Password must be at least 6 characters long!' }
    //             ]}
    //           >
    //             <Input.Password
    //               prefix={<LockOutlined className="site-form-item-icon" />}
    //               type="password"
    //               placeholder="Current Password"
    //             />
    //           </Form.Item>
    //         </div>
    //         <div className="wrap-input100">
    //           <Form.Item<FieldType>
    //             label="new"
    //             name="newPassword"
    //             rules={[
    //               {
    //                 required: true,
    //                 message: "Please input your new password!",
    //               },
    //               { min: 6, message: 'Password must be at least 6 characters long!' }
    //             ]}
    //           >
    //             <Input.Password
    //               prefix={<LockOutlined className="site-form-item-icon" />}
    //               type="password"
    //               placeholder="New Password"
    //             />
    //           </Form.Item>
    //         </div>
    //         <div className="wrap-input100">
    //           <Form.Item<FieldType>
    //             label="confirm"
    //             name="confirmPassword"
    //             rules={[
    //               {
    //                 required: true,
    //                 message: "Please input your confirm password!",
    //               },
    //               { min: 6, message: 'Password must be at least 6 characters long!' }
    //             ]}
    //           >
    //             <Input.Password
    //               prefix={<LockOutlined className="site-form-item-icon" />}
    //               type="password"
    //               placeholder="Confirm Password"
    //             />
    //           </Form.Item>
    //         </div>

    //         <div className="container-login100-form-btn">
    //           <Button
    //             type="primary"
    //             className="login100-form-btn"
    //             htmlType="submit"
    //           >
    //             Submit
    //           </Button>
    //         </div>
    //       </Form>
    //     </div>
    //   </div>
    // </div>

    <div className="justify-center w-100">
      <div className="mb-2 font-semibold text-2xl text-center">
        <span className="default-font">{t("Change Password")}</span>
      </div>

      <Form
        className="pl-16 pr-16 default-font"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={"optional"}
      >
        <Form.Item<FieldType>
          label={t("current")}
          name="currentPassword"
          className="mb-0"
          rules={[
            {
              required: true,
              message: t("Please input your current password"),
            },
            {
              min: 6,
              message: t("Password must be at least 6 characters long"),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("Current Password")}
          />
        </Form.Item>
        <Form.Item<FieldType>
          className="mb-0"
          label={t("new")}
          name="newPassword"
          rules={[
            {
              required: true,
              message: t("Please input your new password"),
            },
            {
              min: 6,
              message: t("Password must be at least 6 characters long"),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("New Password")}
          />
        </Form.Item>
        <Form.Item<FieldType>
          className="mb-0"
          label={t("confirm")}
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: t("Please input your confirm password"),
            },
            {
              min: 6,
              message: t("Password must be at least 6 characters long"),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder={t("Confirm Password")}
          />
        </Form.Item>

        <Button
          type="primary"
          className="w-full flex items-center justify-center bg-black mt-4 default-font"
          htmlType="submit"
        >
          {t("submit")}
        </Button>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
