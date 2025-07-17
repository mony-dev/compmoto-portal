"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  SelectProps,
  Tag,
  Divider,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { UserSchema, userSchema } from "@lib-schemas/user/user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useSession } from "next-auth/react";
import { User } from "@shared/translations/models/user";
import {
  editPasswordSchema,
  EditPasswordSchema,
} from "@lib-schemas/user/edit-password-schema";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useCart } from "@components/Admin/Cartcontext";
import Loading from "@components/Loading";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import DatePickers from "@components/Admin/DatePickers";
import { SelectValue } from "antd/es/select";
import {
  searchPointSchema,
  SearchPointSchema,
} from "@lib-schemas/user/search-point-schema";

interface Option {
  label: string;
  value: string;
}

export default function Admin({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [userData, setUserData] = useState<User>();
  const [saleUsers, setSaleUsers] = useState<User[]>([]);
  const [minisizes, setMinisizes] = useState<[]>([]);

  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName } = useCart();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [formPoint] = Form.useForm();
  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString()); // Default to "All" (empty string)
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [thisMonth, setThisMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString()
  );
  const [thisYear, setThisYear] = useState<string>(
    currentDate.getFullYear().toString()
  );

  interface minisiseData {
    id: number;
    name: string;
  }
  type FieldType = {
    confirmPassword: string;
    newPassword: string;
  };

  const {
    handleSubmit: handleSubmit,
    control: control,
    formState: { errors: errors },
    setValue: setValue,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });

  const {
    handleSubmit: handleSubmitPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm<EditPasswordSchema>({
    resolver: zodResolver(editPasswordSchema),
  });

  const { control: controlSearch, setValue: setSearchValue } =
    useForm<SearchPointSchema>({
      resolver: zodResolver(searchPointSchema),
    });

  const fetchMonth = async () => {
    const months = [
      { en: "January", th: "มกราคม", key: "1" },
      { en: "February", th: "กุมภาพันธ์", key: "2" },
      { en: "March", th: "มีนาคม", key: "3" },
      { en: "April", th: "เมษายน", key: "4" },
      { en: "May", th: "พฤษภาคม", key: "5" },
      { en: "June", th: "มิถุนายน", key: "6" },
      { en: "July", th: "กรกฎาคม", key: "7" },
      { en: "August", th: "สิงหาคม", key: "8" },
      { en: "September", th: "กันยายน", key: "9" },
      { en: "October", th: "ตุลาคม", key: "10" },
      { en: "November", th: "พฤศจิกายน", key: "11" },
      { en: "December", th: "ธันวาคม", key: "12" },
    ];
    let month = [];
    if (locale === "en") {
      month = months.map((option) => ({
        label: option.en,
        value: option.key,
      }));
    } else {
      month = months.map((option) => ({
        label: option.th,
        value: option.key,
      }));
    }
    setMonthOptions(month);
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchData();
      fetchMonth();
    }, 500), // 500 ms debounce delay
    []
  );

  useEffect(() => {
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 2];
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  async function fetchData() {
    setLoading(true);
    try {
      const [userResponse, saleUsersResponse, minisizesResponse] =
        await Promise.all([
          axios.get(`/api/users/${params.id}?month=${selectedMonth}&year=${selectedYear}`),
          axios.get(`/api/users`, {
            params: {
              role: "SALE",
              page: 1,
              pageSize: 20,
            },
          }),
          axios.get(`/api/adminMinisize`, {
            params: {
              page: 1,
              pageSize: 30,
            },
          }),
        ]);
      // Ensure that minisizeIds are correctly set
      const selectedMinisizeIds = userResponse.data.minisizes.map(
        (minisize: minisiseData) => minisize.id
      );

      setUserData(userResponse.data);
      setSaleUsers(saleUsersResponse.data.users);
      setMinisizes(minisizesResponse.data.minisizes); // Save minisizes in state
      setValue("email", userResponse.data.email);
      setValue("name", userResponse.data.name);
      setValue("phoneNumber", userResponse.data.phoneNumber);
      setValue("rewardPoint", userResponse.data.rewardPoint);
      setValue("saleUserId", userResponse.data.saleUserId);
      setValue("minisizeIds", selectedMinisizeIds);
      setSearchValue("usedPoint", userResponse.data.usedPoint);

      setSelectedMonth(thisMonth);
      setSearchValue("month", thisMonth);
      setSearchValue("year", thisYear);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  }

  if (loading || !t) {
    return <Loading />;
  }
  const onFinish: SubmitHandler<UserSchema> = async (values) => {
    try {
      const response = await axios.put(`/api/users/${params.id}`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.replace(`/${locale}/admin/users`);

      toastSuccess("user_updated_successfully");
    } catch (error: any) {
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
      router.replace(`/${locale}/admin/users`);

      toastSuccess("password_updated_successfully");
    } catch (error: any) {
      toastError(error.response.data.message);
    }
  };

  const onSearchPoint = async (month: string, year: string) => {
    try {
      const response = await axios.get(`/api/users/${params.id}?month=${month}&year=${year}`);
      const usedPoint = response.data.usedPoint || 0;
      formPoint.setFieldsValue({ usedPoint });
      setSearchValue("usedPoint", usedPoint);
    } catch (error) {
      console.error("Error fetching usedPoint:", error);
      formPoint.setFieldsValue({ usedPoint: 0 });
    }
  };

  const handleMonthChange = (value: SelectValue) => {
    setSelectedMonth(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    if (value) {
      setThisMonth(value?.toString());
      setSearchValue("month", value.toString());
      onSearchPoint(value.toString(), thisYear);
    }
  };

  const handleYearChange = (value: SelectValue) => {
    setSelectedYear(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    if (value) {
      setThisYear(value?.toString());
      setSearchValue("year", value.toString());
      onSearchPoint(thisMonth, value.toString());
    }
  };

  return (
    <>
      <div className="px-4">
        <div
          className="py-8 pl-8 rounded-lg flex flex-col bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <div className="text-lg pb-4 default-font flex">
            <Link
              className="text-comp-sub-header"
              href={`/${locale}/admin/users`}
            >
              {t("user_setting")}
            </Link>{" "}
            <ChevronRightIcon className="w-4 mx-4" />{" "}
            <p className="font-semibold">{t("edit_user")}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <p className="login100-form-title font-bold text-black mb-0">
                {t("current_point")}
              </p>
              <p className="text-black font-bold">{userData?.rewardPoint}</p>
            </div>
            <div className="flex justify-between flex-col gap-2">
              <Form
                form={formPoint}
                layout="horizontal"
                labelWrap
                onFinish={() => onSearchPoint}
              >
                <div className="flex justify-between flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 grid-row-2">
                    <Form.Item name="year" label={t("year")}>
                      <DatePickers
                        placeholder={t("year")}
                        name="year"
                        control={controlSearch}
                        size="middle"
                        picker="year"
                        onChange={handleYearChange}
                      />
                    </Form.Item>
                    <Form.Item name="month" label={t("month")}>
                      <Controller
                        control={controlSearch} // control from useForm()
                        name="month"
                        render={({ field }) => (
                          <Select
                            {...field}
                            showSearch
                            placeholder={t("Search a month")}
                            value={selectedMonth} // Default to current month
                            onChange={handleMonthChange} // Handle month change
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={monthOptions}
                          />
                        )}
                      />
                    </Form.Item>
                    <Form.Item
                      name="usedPoint"
                      label={t("used_point")}
                      className="col-span-1"
                    >
                      <Controller
                        control={controlSearch}
                        name="usedPoint"
                        render={({ field }) => (
                          <Input {...field} disabled size="large" />
                        )}
                      />
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          <Divider style={{ borderColor: "#c3c3c3" }} />
          <div className="flex justify-between">
            <Form
              form={form}
              name="user_form"
              onFinish={handleSubmit(onFinish)}
              layout="vertical"
              className="grow pr-12"
            >
              <span className="login100-form-title font-bold text-black">
                {t("edit_user")}
              </span>
              <Form.Item
                name="email"
                label={t("email")}
                className="pt-4"
                required
                tooltip={t("this_is_a_required_field")}
                help={errors.email && t("please_enter_a_valid_email")}
                validateStatus={errors.email ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input {...field} placeholder={t("email")} size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label={t("name")}
                required
                tooltip={t("this_is_a_required_field")}
                help={errors.name && t("please_enter_a_name")}
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

              <Form.Item name="phoneNumber" label={t("phone_number")}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder={t("phone_number")}
                      size="large"
                    />
                  )}
                />
              </Form.Item>
              {/* <Form.Item name="rewardPoint" label={t("point")}>
                <Controller
                  control={control}
                  name="rewardPoint"
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      value={field.value !== undefined && field.value !== null ? field.value : ""}
                      placeholder={t("point")}
                      size="large"
                      className="w-full"
                      min={0}
                    />
                  )}
                />
              </Form.Item> */}
              <Form.Item name="saleUserId" label={t("sale_admin")}>
                <Controller
                  control={control}
                  name="saleUserId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={t("select_a_sale_admin")}
                      size="large"
                    >
                      {saleUsers.map((user) => (
                        <Option key={user.id} value={user.id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
              <Form.Item name="minisizeIds" label={t("select_minisizes")}>
                <Controller
                  control={control}
                  name="minisizeIds"
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder={t("select_minisizes")}
                      size="large"
                      optionLabelProp="label"
                      tagRender={tagRender}
                    >
                      {minisizes.map((minisize: minisiseData) => (
                        <Option
                          key={minisize.id}
                          value={minisize.id}
                          label={minisize.name}
                        >
                          <span>{minisize.name}</span> {/* Add random color */}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  {t("submit")}
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
                {t("change_password")}
              </span>
              <div className="wrap-input100 pt-4">
                <Form.Item<FieldType>
                  label={t("password")}
                  name="newPassword"
                  help={
                    errorsPassword.newPassword &&
                    t("password_must_be_at_least_6_characters_long")
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
                        placeholder={t("new_password")}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label={t("confirm_password")}
                  name="confirmPassword"
                  help={
                    errorsPassword.confirmPassword &&
                    t("passwords_do_not_match")
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
                        placeholder={t("confirm_password")}
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
                  {t("submit")}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
type TagRender = SelectProps["tagRender"];
const tagRender: TagRender = (props) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  return (
    <Tag
      color={getRandomColor()}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};
