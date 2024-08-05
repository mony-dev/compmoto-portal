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
import { productSchema, ProductSchema } from "@lib-schemas/user/product-schema";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerProduct: (value: boolean) => void;
  productData?: any;
  triggerProduct: boolean;
  mode: string;
  id: number;
};

interface ProductDataType {
  id: number;
  code: string;
  name: string;
  brandId: number;
  price: number;
  navStock: number;
  portalStock: number;
  minisizeId?: number;
  promotionId?: number;
  years: JSON;
  lv1Id?: number;
  lv2Id?: number;
  lv3Id?: number;
  brand?: {
    name: string;
  };
  minisize?: {
    name: string;
  };
  promotion?: {
    name: string;
  };
  lv1Name?: string;
  lv2Name?: string;
  lv3Name?: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalProduct = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerProduct,
  productData,
  triggerProduct,
  id,
  mode,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
  });
  const [trigger, setTrigger] = useState(false);

  const router = useRouter();
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [editProductData, setEditProductData] =
    useState<ProductDataType | null>(null);

  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);

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
    if (productData && mode === "EDIT") {
        const product = productData.find((item: { id: number }) => item.id === id);
        setEditProductData(product);
        // Set form values
        setValue("name", product.name);
    }
  }, [productData, id]);

  //   const fetchProductCount = async (brandId: number) => {
  //     try {
  //       const response = await axios.get(`/api/products?brandId=${brandId}`);
  //       setProductCount(response.data.length);
  //     } catch (error: any) {
  //       toastError(error.message);
  //     }
  //   };

  const onSubmit: SubmitHandler<ProductSchema> = async (values) => {
    if (editProductData) {
      try {
        const response = await axios.put(
          `/api/adminProduct/${editProductData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setTriggerProduct(!triggerProduct);
        setTrigger(!trigger);
        toastSuccess("Product updated successfully");
        router.replace(`/${locale}/admin/adminProduct`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };
  return (
    <Modal
      title={editProductData?.name}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        setTrigger(!trigger);
      }}
      footer={false}
    >
      <h2 className="font-semibold">ตั้งค่า</h2>
      <hr className="my-2" />
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
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
      </Form>
    </Modal>
  );
};

export default ModalProduct;
