"use client";
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import LoginLogo from "@public/images/login.jpg";
import "../styles/login.scss";

import Image from "next/image";
import axios from "axios";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useRouter } from "next/navigation";
const ChangePasswordForm = () => {
  const router = useRouter();
  const onFinish = async (values: any) => {
    let email = localStorage.getItem('email');
    try {
      const response = await axios.put('/api/change-password', {
        currentPassword: values.currentPassword,
        confirmPassword: values.confirmPassword,
        newPassword: values.newPassword,
        email: email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      router.replace("/th/admin/sign-in");

      toastSuccess("Password updated successfully")  ;
    } catch (error: any) {
      toastError(error.response.data.message)  ;

    }
  };
  type FieldType = {
    currentPassword: string;
    confirmPassword: string;
    newPassword: string;
  };
  return (
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
            onFinish={onFinish}
            autoComplete="off"
            className="login100-form validate-form"
          >
            <span className="login100-form-title font-bold">Change Password</span>
            <div className="wrap-input100">
              <Form.Item<FieldType>
                label="current"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your current password!",
                  },
                  { min: 6, message: 'Password must be at least 6 characters long!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Current Password"
                />
              </Form.Item>
            </div>
            <div className="wrap-input100">
              <Form.Item<FieldType>
                label="new"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                  { min: 6, message: 'Password must be at least 6 characters long!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="New Password"
                />
              </Form.Item>
            </div>
            <div className="wrap-input100">
              <Form.Item<FieldType>
                label="confirm"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your confirm password!",
                  },
                  { min: 6, message: 'Password must be at least 6 characters long!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Confirm Password"
                />
              </Form.Item>
            </div>

            <div className="container-login100-form-btn">
              <Button
                type="primary"
                className="login100-form-btn"
                htmlType="submit"
              >
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
