"use client";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Select } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  EditAdminSchema,
  editAdminSchema,
} from "@lib-schemas/user/edit-admin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useSession } from "next-auth/react";
import { User } from "@shared/translations/models/user";
import {
  editPasswordSchema,
  EditPasswordSchema,
} from "@lib-schemas/user/edit-password-schema";

export default function Admin({ params }: { params: { id: number } }) {
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [userData, setUserData] = useState<User>();

  type FieldType = {
    confirmPassword: string;
    newPassword: string;
  };

  const {
    handleSubmit: handleSubmit,
    control: control,
    formState: { errors: errors },
    setValue: setValue,
    watch: watchRole,
  } = useForm<EditAdminSchema>({
    resolver: zodResolver(editAdminSchema),
  });

  const {
    handleSubmit: handleSubmitPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm<EditPasswordSchema>({
    resolver: zodResolver(editPasswordSchema),
  });
  const role = watchRole('role');
  useEffect(() => {
    axios
      .get(`/api/users/${params.id}`)
      .then((response) => {
        setUserData(response.data);
        setValue("email", response.data.email);
        setValue("name", response.data.name);
        setValue("role", response.data.role);
        response.data.custNo &&  setValue("custNo", response.data.custNo);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const onFinish: SubmitHandler<EditAdminSchema> = async (values) => {
    try {
      const response = await axios.put(`/api/users/${params.id}`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.replace("/admin/admins");

      toastSuccess("User updated successfully");
    } catch (error: any) {
      console.log("error", error.response.data.message);
      toastError(error.response.data.message);
    }
  };

  const onFinishPassword: SubmitHandler<EditPasswordSchema> = async (
    values
  ) => {
    try {
      const response = await axios.put(
        `/api/admin-password/${params.id}`,
        {
          confirmPassword: values.confirmPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.replace("/admin/admins");

      toastSuccess("Password updated successfully");
    } catch (error: any) {
      console.log("error", error.response.data.message);
      toastError(error.response.data.message);
    }
  };
  return (
    <>
      <div className="px-12">
        <div
          className="py-8 pl-8 rounded-lg flex flex-col bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <div className="text-lg pb-4 default-font flex">
            <Link className="text-comp-sub-header" href={"/admin/admins"}>
              ตั้งค่าพนักงาน
            </Link>{" "}
            <ChevronRightIcon className="w-4 mx-4" />{" "}
            <p className="font-semibold">แก้ไขพนักงาน</p>
          </div>
          <div className="flex justify-between">
            <Form
              form={form}
              name="user_form"
              onFinish={handleSubmit(onFinish)}
              layout="vertical"
              className="grow pr-12"
            >
              <span className="login100-form-title font-bold text-black">
                แก้ไขพนักงาน
              </span>
              <Form.Item
                name="email"
                label="Email"
                className="pt-4"
                required
                tooltip="This is a required field"
                help={errors.email && "Please enter a valid email"}
                validateStatus={errors.email ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input {...field} placeholder="Email" size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label="Name"
                required
                tooltip="This is a required field"
                help={errors.name && "Please enter your name"}
                validateStatus={errors.name ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} placeholder="Name" size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                required
                tooltip="This is a required field"
                help={errors.role && "Please select your role"}
                validateStatus={errors.role ? "error" : ""}
              >
                <Controller
                  control={control} // control from useForm()
                  name="role"
                  render={({ field }) => (
                    <Select {...field} placeholder="Select a role" size="large">
                      <Option value="ADMIN">Admin</Option>
                      <Option value="CLAIM">Claim</Option>
                      <Option value="SALE">Sale</Option>
                    </Select>
                  )}
                />
              </Form.Item>
              {role == "SALE" && (
                <Form.Item
                  name="custNo"
                  label="Sale ID"
                >
                  <Controller
                    control={control}
                    name="custNo"
                    render={({ field }) => (
                      <Input {...field} value={field.value || ''} placeholder="Sale ID" size="large" />
                    )}
                  />
                </Form.Item>
              )}
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <Form
              form={formPassword}
              name="password_form"
              onFinish={handleSubmitPassword(onFinishPassword)}
              layout="vertical"
              className="grow pr-12"
            >
              <span className="login100-form-title font-bold text-black">
                เปลี่ยนรหัสผ่าน
              </span>
              <div className="wrap-input100 pt-4">
                <Form.Item<FieldType>
                  label="password"
                  name="newPassword"
                  help={
                    errorsPassword.newPassword &&
                    "Password must be at least 6 characters long"
                  }
                  validateStatus={errorsPassword.newPassword ? "error" : ""}
                >
                  <Controller
                    control={controlPassword}
                    name="newPassword"
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder="New Password"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label="confirm password"
                  name="confirmPassword"
                  help={
                    errorsPassword.confirmPassword && "Passwords do not match"
                  }
                  validateStatus={errorsPassword.confirmPassword ? "error" : ""}
                >
                  <Controller
                    control={controlPassword}
                    name="confirmPassword"
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder="confirm Password"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
