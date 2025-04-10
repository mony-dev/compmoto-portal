"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useForm,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Form, InputNumber, Modal, Select, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCart } from "@components/Admin/Cartcontext";
import { usePathname, useRouter } from "next/navigation";
import { CheckBadgeIcon, PowerIcon } from "@heroicons/react/24/outline";
import DatePickers from "@components/Admin/DatePickers";
import { toastError, toastSuccess } from "@lib-utils/helper";
import i18nConfig from "../../../../../../../i18nConfig";
import { useCurrentLocale } from "next-i18n-router/client";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { SelectValue } from "antd/es/select";
import { rewardPointSchema, RewardPointSchema } from "@lib-schemas/user/reward-point-schema";
import axios from "axios";

const DataTable = dynamic(() => import("@components/Admin/Datatable"));

interface Option {
  label: string;
  value: string;
}
export default function adminRewardPointHistory() {
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const { setI18nName, setLoadPage, loadPage } = useCart();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const [id, setId] = useState(0);
  const router = useRouter();
  const Loading = dynamic(() => import("@components/Loading"));
  const [monthOptions, setMonthOptions] = useState<Option[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Default to "All" (empty string)
  const [selectedYear, setSelectedYear] = useState<string>(""); // Default to "All" (empty string)
  const currentDate = new Date();
  const [thisMonth, setThisMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [thisYear, setThisYear] = useState<string>(currentDate.getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [historiesData, setHistoriesData] = useState<DataType[]>([]);
  const [editingRowKey, setEditingRowKey] = useState<number | null>(null);
  const [isFinalize, setIsFinalize] = useState(false);

  interface DataType {
    key: number;
    id: number | null;
    name: string;
    custNo: string;
    point: number;
    incentivePoint: number;
    loyaltyPoint: number;
    usedPoint: number;
    totalPoint: number;
    totalSpend: number;
  }

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<RewardPointSchema>({
    resolver: zodResolver(rewardPointSchema),
  });

  const handleMonthChange = (value: SelectValue) => {
    setSelectedMonth(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    value && setThisMonth(value?.toString())
    value && setValue("month", value.toString());
    fetchRewardPoint(value?.toString(), thisYear);
  };

  const handleYearChange = (value: SelectValue) => {
    setSelectedYear(value?.toString() || ""); // Update selected month, allowing for the "All" option (empty string)
    value && setThisYear(value?.toString())
    value && setValue("year", value.toString());
    fetchRewardPoint(thisMonth, value?.toString());
  };

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

  const fetchRewardPoint = async (month = thisMonth, year = thisYear) => {
    setLoadPage(true);
    try {
      const response = await fetch(`/api/adminRewardPoint?month=${month}&year=${year}&page=${currentPage}&pageSize=${pageSize}`);
      const data = await response.json();

      if (data && data.rewardPoint) {
        // Set the basic form values
        setSelectedMonth(data.rewardPoint.month.toString());
        setValue("month", data.rewardPoint.month.toString());
        setValue("year", data.rewardPoint.year.toString());
        setValue("expenses", data.rewardPoint.expenses);
        setValue("point", data.rewardPoint.point);
        setId(data.rewardPoint.id);
        setIsFinalize(data.rewardPoint.isFinalize)
        const historiesDataWithKeys = data.histories.map(
          (history: DataType, index: number) => ({
            ...history,
            key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
          })
        );
        setHistoriesData(historiesDataWithKeys);
        setTotal(data.total);
      } else {
        setValue("month", month);
        setValue("year", year);
        setValue("expenses", 0);
        setValue("point", 0)
      }
    } catch (error) {
      console.error("Error fetching RewardPoint:", error);
    } finally {
      setLoadPage(false);
    }
  };

  // Debounce function for search input
  const debouncedFetchData = useCallback(
    debounce(() => {
      fetchRewardPoint();
      fetchMonth();
    }, 500), // 500 ms debounce delay
    [currentPage, pageSize]
  );

  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);

    // Call the debounced fetch function
    debouncedFetchData();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [id, currentPage, debouncedFetchData]);

  const onFinish: SubmitHandler<RewardPointSchema> = async (values) => {
  // const handleSave = async () => {
    Modal.confirm({
      title: t("are_you_sure_you_want_to_update_this_setting"),
      content: t("this_action_cannot_be_undone"),
      okText: t("ok"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          if (id < 0) {
            // You need the ID to update the record
            toastError(t("No setting available to update, Please contact developer."));
            return;
          }

          // Send the PUT request to update isActive to false
          const response = await fetch(`/api/adminRewardPoint/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id, // Pass the ID to identify the record
              expenses: values.expenses, 
              point: values.point, 
            }),
          });

          const result = await response.json();

          if (response.ok) {
            setId(0);
            router.replace(`/${locale}/admin/adminRewardPointHistory`);
            toastSuccess(t("Update successfully"));
            // Optionally, refresh the form or update the UI after the status is updated
          } else {
            toastError(t("Error resetting status"));
          }
        } catch (error) {
          toastError(t("Error resetting status"));
        }
      },
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  if (loadPage) {
    return (
      <Loading/>
    );
  }

  const handleLoyaltyPointUpdate = async (record: DataType, newValue: number) => {
    // Example API call
    try {
      const response = await axios.put(
        `/api/updateLoyaltyPoint`, 
        {
          userId: record.id, 
          rewardPointId: id, 
          loyaltyPoint: newValue
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      )
      fetchRewardPoint();
      // Optionally update UI
      toastSuccess(t("Updated successfully"));
    } catch (error) {
      toastError(t("Update failed"));
    }
  };

  const closeBook = () => {
    Modal.confirm({
      title: t("are_you_sure_you_want_to_close_book"),
      content: t("this_action_cannot_be_undone"),
      okText: t("ok"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          if (id < 0) {
            // You need the ID to update the record
            toastError(t("No setting available to update, Please contact developer."));
            return;
          }

          // Send the PUT request to update isActive to false
          const response = await fetch(`/api/closeBook/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id, // Pass the ID to identify the record
              isFinalize: false,
              resetDate: new Date()
            }),
          });

          const result = await response.json();

          if (response.ok) {
            setId(0);
            router.replace(`/${locale}/admin/adminRewardPointHistory`);
            toastSuccess(t("Update successfully"));
            // Optionally, refresh the form or update the UI after the status is updated
          } else {
            toastError(t("Error resetting status"));
          }
        } catch (error) {
          toastError(t("Error resetting status"));
        }
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('no'),
      dataIndex: "key",
      key: "key",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.key - a.key,
    },
    {
      title: t('name'),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('cust no'),
      dataIndex: "custNo",
      key: "custNo",
      sorter: (a, b) => a.custNo.localeCompare(b.custNo),
    },
    {
      title: t('total spend'),
      dataIndex: "totalSpend",
      key: "totalSpend",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.totalSpend - a.totalSpend,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: t('point'),
      dataIndex: "point",
      key: "point",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.point - a.point,
    },
    {
      title: t('intensive point'),
      dataIndex: "incentivePoint",
      key: "incentivePoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.incentivePoint - a.incentivePoint,
    },
    {
      title: t('loyalty point'),
      dataIndex: "loyaltyPoint",
      key: "loyaltyPoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.loyaltyPoint - a.loyaltyPoint,
      render: (value: number, record: DataType) => {
        const isEditing = editingRowKey === record.key;
      
        const exitAndSave = async (val: number) => {
          await handleLoyaltyPointUpdate(record, val);
          setEditingRowKey(null);
        };
      
        return isEditing ? (
          <InputNumber
            defaultValue={value}
            min={0}
            onPressEnter={(e) => {
              const inputValue = parseFloat((e.target as HTMLInputElement).value);
              exitAndSave(inputValue);
            }}
            onBlur={(e) => {
              const inputValue = parseFloat((e.target as HTMLInputElement).value);
              exitAndSave(inputValue);
            }}
            autoFocus
          />
        ) : (
          <Tooltip placement="top" title={t("Click to edit")}>
            <Button onClick={() => setEditingRowKey(record.key)}>
              {value.toLocaleString()}
            </Button>
          </Tooltip>
        );
      }
    },
    
    {
      title: t('used point'),
      dataIndex: "usedPoint",
      key: "usedPoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.usedPoint - a.usedPoint,
    },
    {
      title: t('total point'),
      dataIndex: "totalPoint",
      key: "totalPoint",
      defaultSortOrder: "descend",
      sorter: (a, b) => b.totalPoint - a.totalPoint,
    },
  ];
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">
            {t("Reward Points Settings")}
          </p>
        </div>
        <Divider />

        <Form
          form={form}
          layout="horizontal"
          labelWrap
          onFinish={handleSubmit(onFinish)}
        >
          {/* Year and Save Reward Point */}
          <div className="flex justify-between flex-col gap-2">
            <div className="grid grid-cols-6 gap-2">
              <Form.Item
                name="year"
                label={t("year")}
              >
                <DatePickers
                  placeholder={t("year")}
                  name="year"
                  control={control}
                  size="middle"
                  picker="year"
                  onChange={handleYearChange}
                />
              </Form.Item>
              <Form.Item
                name="month"
                label={t("month")}
              >
                <Controller
                  control={control} // control from useForm()
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
                name="expenses"
                label={t("expenses")}
                required
              >
                <Controller
                  control={control} 
                  name="expenses"
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      placeholder={t("expenses")}
                      className="w-full"
                      step={1}
                      min={0}
                      addonAfter={t("baht")}
                      formatter={(value) =>
                        value ? `${Number(value).toLocaleString()}` : ''
                      }
                     
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                name="point"
                label={t("point")}
                required
              >
                <Controller
                  control={control} 
                  name="point"
                  render={({ field }) => (
                    <InputNumber
                        {...field}
                        placeholder={t("point")}
                        className="w-full"
                        step={1}
                        min={0}
                    />
                  )}
                />
              </Form.Item>
              <div className="flex gap-2">
              <Button
                className="bg-comp-red button-backend"
                type="primary"
                htmlType="submit"
                icon={<CheckBadgeIcon className="w-4" />}
                disabled={id === 0}
              >
                {t("Update")}
              </Button>
              </div>
            </div>
          </div>
        </Form>
        <Divider className="mt-0"/>
        <div>
          {isFinalize && <div className="flex justify-end">
            <Button
              className="bg-comp-red button-backend mb-6"
              type="primary"
              onClick={closeBook}
              icon={<PowerIcon className="w-4" />}
              disabled={id === 0}
            >
              {t("Close")}
            </Button>
          </div>}
          
          <DataTable
            columns={columns}
            data={historiesData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
