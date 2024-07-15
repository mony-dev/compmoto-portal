"use client";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Select } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AdminSchema, adminSchema } from "@lib-schemas/user/admin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useSession } from "next-auth/react";

export default function Admin({ params }: { params: { id: number } }) {
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  type FieldType = {
    currentPassword: string;
    confirmPassword: string;
    newPassword: string;
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch: watchRole,
  } = useForm<AdminSchema>({
    resolver: zodResolver(adminSchema),
  });

  const role = watchRole("role");

  const onFinish: SubmitHandler<AdminSchema> = async (values) => {
    const response = await axios
      .post(`/api/users`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        toastSuccess("User created successfully");
        router.replace("/admin/admins");
      })
      .catch((error) => {
        toastError(error);
      });
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
            <p className="">เพิ่มพนักงาน</p>
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
                เพิ่มพนักงาน
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
              {role == "SALE" ? (
                <Form.Item
                  name="custNo"
                  label="Sale ID"
                  required
                  tooltip="This is a required field"
                  help={errors.role && "Please select your sale id"}
                  validateStatus={errors.role ? "error" : ""}
                >
                  <Controller
                    control={control}
                    name="custNo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Sale ID"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="custNo"
                  label="Cust ID"
                  required
                  tooltip="This is a required field"
                  help={errors.role && "Please input your cust no"}
                  validateStatus={errors.role ? "error" : ""}
                >
                  <Controller
                    control={control}
                    name="custNo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Cust ID"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              )}
              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label="password"
                  name="newPassword"
                  help={
                    errors.newPassword &&
                    "Password must be at least 6 characters long"
                  }
                  validateStatus={errors.newPassword ? "error" : ""}
                >
                  <Controller
                    control={control}
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
                  help={errors.confirmPassword && "Passwords do not match"}
                  validateStatus={errors.confirmPassword ? "error" : ""}
                >
                  <Controller
                    control={control}
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
