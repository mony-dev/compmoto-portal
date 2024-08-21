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
  InputNumber,
  Row,
  Col,
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
import {
  promotionSchema,
  PromotionSchema,
} from "@lib-schemas/user/promotion-schema";
import DatePickers from "../DatePickers";
import { SizeType } from "antd/es/config-provider/SizeContext";
import UploadRewardImage from "../UploadRewardImage";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerPromotion: (value: boolean) => void;
  promotionData?: any;
  triggerPromotion: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
};

interface PromotionDataType {
  id: number;
  name: string;
  isActive: boolean;
  minisizeId: number;
  amount: number;
  productRedeem: string;
  userGroup: string;
  startDate: string;
  endDate: string;
  image: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalPromotion = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerPromotion,
  promotionData,
  triggerPromotion,
  title,
  id,
  mode,
  setId,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<PromotionSchema>({
    resolver: zodResolver(promotionSchema),
  });
  const [triggerPro, setTriggerPro] = useState(false);
  const router = useRouter();
  const [minisizeOptions, setMinisizeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [editPromotionData, setEditPromotionData] =
    useState<PromotionDataType | null>(null);

  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [image, setImage] = useState<string | { url: string }[]>([]);

  const dataOptions = [
    { key: "5STARS", value: "5STARS" },
    { key: "7STARS", value: "7STARS" },
  ];
  const [size, setSize] = useState<SizeType>("middle");
  useEffect(() => {
    const fetchMinisizes = async () => {
      try {
        const response = await axios.get("/api/adminMinisize");
        const minisizes = response.data.map((minisize: any) => ({
          value: minisize.id,
          label: minisize.name,
        }));
        setMinisizeOptions(minisizes);
      } catch (error: any) {
        toastError(error.message);
      }
    };

    fetchMinisizes();
  }, []);

  useEffect(() => {
    const promotion = promotionData.find(
      (item: { id: number }) => item.id === id
    );
    if (promotion && mode === "EDIT") {
      setEditPromotionData(promotion);
      // Set form values
      setValue("name", promotion.name);
      setValue("isActive", promotion.isActive);
      setValue("minisizeId", promotion.minisizeId);
      setValue("amount", promotion.amount);
      setValue("productRedeem", promotion.productRedeem);
      setValue("userGroup", promotion.userGroup);
      setValue("startDate", promotion.startDate);
      setValue("endDate", promotion.endDate);
      setValue("image", promotion.image);
      setImage(promotion?.image);
    } else {
      setImage("");
      reset({
        name: "",
        isActive: true,
        minisizeId: undefined,
        amount: 0,
        productRedeem: "",
        userGroup: "",
        startDate: "",
        endDate: "",
        image: "",
      });
    }
  }, [promotionData, id]);

  useEffect(() => {
    let effImage: any = "";

    if (image) {
      effImage = image;
    }
    setValue("image", effImage);
    mode == "EDIT" && trigger(["image"]);
  }, [image]);

  const resetForm = () => {
    reset({
      name: "",
      isActive: true,
      minisizeId: undefined,
      amount: 0,
      productRedeem: "",
      userGroup: "",
      startDate: "",
      endDate: "",
    });
    setIsModalVisible(false);
    setId(0);
  };
  const onSubmit: SubmitHandler<PromotionSchema> = async (values) => {
    if (mode === "EDIT" && editPromotionData) {
      try {
        const response = await axios.put(
          `/api/promotion/${editPromotionData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        resetForm();
        setTriggerPromotion(!triggerPromotion);
        setTriggerPro(!triggerPro);
        toastSuccess("Promotion updated successfully");
        router.replace(`/${locale}/admin/adminPromotion`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/promotion`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        resetForm();
        setTriggerPromotion(!triggerPromotion);
        setTriggerPro(!triggerPro);
        toastSuccess("Promotion created successfully");
        router.replace(`/${locale}/admin/adminPromotion`);
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
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item
          name="image"
          label="Upload Image"
          required
          tooltip="This is a required field"
          help={errors.image && "Please upload promotion image"}
          validateStatus={errors.image ? "error" : ""}
        >
          <Controller
            control={control}
            name="image"
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
        <Row gutter={16}>
          <Col span={12}>
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
                render={({ field }) => <Input {...field} placeholder="Name" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minisizeId"
              label="Minisize"
              className="switch-backend basis-1/2"
              required
              tooltip="This is a required field"
              help={errors.minisizeId?.message}
              validateStatus={errors.minisizeId ? "error" : ""}
            >
              <Controller
                control={control}
                name="minisizeId"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select a minisize"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={minisizeOptions}
                    //   onChange={(value) => {
                    //     field.onChange(value);
                    //     fetchProductCount(value);
                    //   }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="จำนวนที่ซื้อ"
              className="switch-backend"
              required
              tooltip="This is a required field"
              help={errors.name?.message}
              validateStatus={errors.name ? "error" : ""}
            >
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    placeholder="amount"
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="userGroup"
              label="กลุ่มลูกค้า"
              className="switch-backend basis-1/2"
              required
              tooltip="This is a required field"
              help={errors.userGroup?.message}
              validateStatus={errors.userGroup ? "error" : ""}
            >
              <Controller
                control={control}
                name="userGroup"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder="Select a user group"
                    filterOption={(input, option) =>
                      (option?.key ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={dataOptions}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="productRedeem"
          label="สินค้าที่ได้รับ"
          className="switch-backend basis-1/2"
          required
          tooltip="This is a required field"
          help={errors.productRedeem?.message}
          validateStatus={errors.productRedeem ? "error" : ""}
        >
          <Controller
            control={control}
            name="productRedeem"
            render={({ field }) => (
              <Input {...field} placeholder="product redeem" />
            )}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              required
              tooltip="This is a required field"
            >
              <DatePickers
                placeholder="Start Date"
                name="startDate"
                control={control}
                size={size}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              required
              tooltip="This is a required field"
            >
              <DatePickers
                placeholder="End Date"
                name="endDate"
                control={control}
              />
            </Form.Item>
          </Col>
        </Row>
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

export default ModalPromotion;
