import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatDate,
  formatDateRange,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tooltip,
  Image,
  Select,
  Checkbox,
} from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import {
  MinisizeSchema,
  minisizeSchema,
} from "@lib-schemas/user/minisize-schema";
import UploadRewardImage from "../UploadRewardImage";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerMinisize: (value: boolean) => void;
  minisizeData?: any;
  triggerMinisize: boolean;
  mode: string;
  title: string;
  id: number;
};

interface MinisizeDataType {
  id: number;
  name: string;
  isActive: boolean;
  brandId: number;
  lv1: JSON;
  lv2: JSON;
  lv3: JSON;
  productCount: number;
  imageProfile: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalMinisize = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerMinisize,
  minisizeData,
  triggerMinisize,
  title,
  id,
  mode,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
    reset
  } = useForm<MinisizeSchema>({
    resolver: zodResolver(minisizeSchema),
    defaultValues: {
      lv1: [{ name: "", isActive: false, data: "" }],
      lv2: [{ name: "", isActive: false, data: "" }],
      lv3: [{ name: "", isActive: false, data: "" }],
    },
  });
  const [triggerMini, setTriggerMini] = useState(false);
  const { fields: lv1Fields } = useFieldArray({ control, name: "lv1" });
  const { fields: lv2Fields } = useFieldArray({ control, name: "lv2" });
  const { fields: lv3Fields } = useFieldArray({ control, name: "lv3" });

  const router = useRouter();
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [editMinisizeData, setEditMinisizeData] = useState<MinisizeDataType | null>(null);
  const [image, setImage] = useState<string | { url: string }[]>([]);

  const [productCount, setProductCount] = useState<number | null>(null);
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);

  const dataOptions = [
    { key: "Com Rate", value: "ComRate" },
    { key: "Size", value: "Size" },
    { key: "Rim", value: "Rim" },
    { key: "Family", value: "Family" },
    { key: "Group Type", value: "GroupType" },
    { key: "Brand", value: "Brand" },
    { key: "Product Group", value: "ProductGroup" },
  ];

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("/api/brand/");
        const brands = response.data.map((brand: any) => ({
          value: brand.id,
          label: brand.name,
        }));
        setBrandOptions(brands);
      } catch (error: any) {
        toastError(error.message);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const minisize = minisizeData.find((item: { id: number }) => item.id === id);
    if (minisize && mode === "EDIT") {
      setProductCount(minisize.productCount)
      setEditMinisizeData(minisize)
      // Parse JSON fields
      const parsedLv1 = JSON.parse(minisize.lv1);
      const parsedLv2 = JSON.parse(minisize.lv2);
      const parsedLv3 = JSON.parse(minisize.lv3);

      // Set form values
      setValue("name", minisize.name);
      setValue("isActive", minisize.isActive);
      setValue("brandId", minisize.brandId);
      setValue("lv1", parsedLv1);
      setValue("lv2", parsedLv2);
      setValue("lv3", parsedLv3);
      setValue("imageProfile", minisize.imageProfile);
      setImage(minisize?.imageProfile);
    } else {
      setImage("");
      reset({
        name: "",
        isActive: true,
        brandId: undefined,
        lv1: [{ name: "", isActive: false, data: "" }],
        lv2: [{ name: "", isActive: false, data: "" }],
        lv3: [{ name: "", isActive: false, data: "" }],
        imageProfile: "",
      });
    }
  }, [minisizeData, id]);

  useEffect(() => {
    let effImage: any = "";

    if (image) {
      effImage = image;
    }
    setValue("imageProfile", effImage);
    mode == "EDIT" && trigger(["imageProfile"]);
  }, [image]);

  const fetchProductCount = async (brandId: number) => {
    try {
      const response = await axios.get(`/api/products?brandId=${brandId}`);
      setProductCount(response.data.length);
    } catch (error: any) {
      toastError(error.message);
    }
  };

  const resetForm = () => {
    reset({
      name: "",
      isActive: true,
      brandId: undefined,
      lv1: [{ name: "", isActive: false, data: "" }],
      lv2: [{ name: "", isActive: false, data: "" }],
      lv3: [{ name: "", isActive: false, data: "" }],
    });
    setIsModalVisible(false)
    setProductCount(null);
  };
  const onSubmit: SubmitHandler<MinisizeSchema> = async (values) => {
    if(mode === 'EDIT' && editMinisizeData) {
      try {
        const response = await axios.put(`/api/adminMinisize/${editMinisizeData.id}`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        resetForm();
        setTriggerMinisize(!triggerMinisize);
        setTriggerMini(!triggerMini)
        toastSuccess("Minisize updated successfully");
        router.replace(`/${locale}/admin/adminMinisize`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminMinisize`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("response", response)
        resetForm();
        setTriggerMinisize(!triggerMinisize);
        setTriggerMini(!triggerMini)
        toastSuccess("minisize created successfully");
        router.replace(`/${locale}/admin/adminMinisize`);
      } catch (error: any) {
        toastError(error.message);
      }
    }

  };
  return (
    <Modal
      title={title}
      open={isModalVisible}
      onCancel={() => resetForm()}
      footer={false}
    >
      <h2 className="font-semibold">ตั้งค่า</h2>
      <hr className="my-2" />
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <Form.Item
          name="imageProfile"
          label="Upload image"
          required
          tooltip="This is a required field"
          help={errors.imageProfile && "Please upload minisize image"}
          validateStatus={errors.imageProfile ? "error" : ""}
        >
          <Controller
            control={control}
            name="imageProfile"
            render={({ field }) => (
              <UploadRewardImage
                setImage={setImage}
                fileType="image"
                allowType={["jpg", "png", "jpeg"]}
                initialImage={image}
                multiple={false}
              />
            )}
          />
        </Form.Item>
        <div className="flex w-full pb-2">
    
          <Form.Item
            name="name"
            label="ชื่อ"
            className="switch-backend basis-1/2"
            required
            tooltip="This is a required field"
            help={errors.name?.message}
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
            name="isActive"
            label="แสดง"
            className="switch-backend basis-1/2 pl-2"
          >
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  {...field}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              )}
            />
          </Form.Item>
        </div>
        <div className="flex w-full pb-2">
          <Form.Item
            name="brandId"
            label="Brand"
            className="switch-backend basis-1/2"
            required
            tooltip="This is a required field"
            help={errors.brandId?.message}
            validateStatus={errors.brandId ? "error" : ""}
          >
            <Controller
              control={control}
              name="brandId"
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select a brand"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={brandOptions}
                  onChange={(value) => {
                    field.onChange(value);
                    fetchProductCount(value);
                  }}
                />
              )}
            />
          </Form.Item>
          <div className="basis-1/2 pl-2">
            <label>จำนวนสินค้า</label>
            <Input
              name="total"
              value={productCount ?? ""}
              disabled
              className="mt-2"
            />
          </div>
        </div>
        <h2 className="font-semibold">หมวดหมู่ที่ใช้แสดง</h2>
        <hr className="my-2" />
        {lv1Fields.map((field, index) => (
          <div key={field.id} className="flex items-center">
            <Form.Item>
              <Controller
                name={`lv1.${index}.isActive`}
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    หมวดหมู่สินค้า
                  </Checkbox>
                )}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv1?.[index]?.name?.message}
              validateStatus={errors.lv1?.[index]?.name ? "error" : ""}
              className="basis-5/12"
            >
              <Controller
                name={`lv1.${index}.name`}
                control={control}
                render={({ field }) => <Input {...field} placeholder="Name" />}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv1?.[index]?.data?.message}
              validateStatus={errors.lv1?.[index]?.data ? "error" : ""}
              className="basis-4/12 pl-2"
            >
              <Controller
                name={`lv1.${index}.data`}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select data"
                    options={dataOptions}
                  />
                )}
              />
            </Form.Item>
          </div>
        ))}
        {errors.lv1 && (
          <div className="ant-form-item-explain ant-form-item-explain-error">
            {errors.lv1.message}
          </div>
        )}
        {lv2Fields.map((field, index) => (
          <div key={field.id} className="flex items-center">
            <Form.Item>
              <Controller
                name={`lv2.${index}.isActive`}
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    ซับหมวดหมู่ 1
                  </Checkbox>
                )}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv2?.[index]?.name?.message}
              validateStatus={errors.lv2?.[index]?.name ? "error" : ""}
              className="basis-5/12"
            >
              <Controller
                name={`lv2.${index}.name`}
                control={control}
                render={({ field }) => <Input {...field} placeholder="Name" />}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv2?.[index]?.data?.message}
              validateStatus={errors.lv2?.[index]?.data ? "error" : ""}
              className="basis-4/12 pl-2"
            >
              <Controller
                name={`lv2.${index}.data`}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select data"
                    options={dataOptions}
                  />
                )}
              />
            </Form.Item>
          </div>
        ))}
        {lv3Fields.map((field, index) => (
          <div key={field.id} className="flex items-center">
            <Form.Item>
              <Controller
                name={`lv3.${index}.isActive`}
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    ซับหมวดหมู่ 2
                  </Checkbox>
                )}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv3?.[index]?.name?.message}
              validateStatus={errors.lv3?.[index]?.name ? "error" : ""}
              className="basis-5/12"
            >
              <Controller
                name={`lv3.${index}.name`}
                control={control}
                render={({ field }) => <Input {...field} placeholder="Name" />}
              />
            </Form.Item>
            <Form.Item
              help={errors.lv3?.[index]?.data?.message}
              validateStatus={errors.lv3?.[index]?.data ? "error" : ""}
              className="basis-4/12 pl-2"
            >
              <Controller
                name={`lv3.${index}.data`}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select data"
                    options={dataOptions}
                  />
                )}
              />
            </Form.Item>
          </div>
        ))}
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
    </Modal>
  );
};

export default ModalMinisize;
