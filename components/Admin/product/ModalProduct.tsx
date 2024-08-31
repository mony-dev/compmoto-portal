import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Checkbox,
  InputNumber,
  Image,
} from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
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
import UploadRewardImage from "../UploadRewardImage";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerProduct: (value: boolean) => void;
  productData?: any;
  triggerProduct: boolean;
  mode: string;
  id: number;
  setId: (value: number) => void;
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
  years: any;
  lv1Id?: number;
  lv2Id?: number;
  lv3Id?: number;
  brand?: {
    name: string;
  };
  minisize?: {
    name: string;
    lv1?: any;
    lv2?: any;
    lv3?: any;
  };
  promotion?: {
    name: string;
  };
  imageProducts?: { 
    id: number;
    name: string;
    url: string;
  }[];
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
  setId,
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

  const { fields, replace } = useFieldArray({
    control,
    name: "years",
  });

  const [trigger, setTrigger] = useState(false);

  const router = useRouter();
  const [promotionOptions, setPromotionOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [minisizeOptions, setMinisizeOptions] = useState<any[]>([]);
  const [lv1Options, setLv1Options] = useState([]);
  const [lv2Options, setLv2Options] = useState([]);
  const [lv3Options, setLv3Options] = useState([]);
  const [editProductData, setEditProductData] =
    useState<ProductDataType | null>(null);

  const [lv1Name, setLv1Name] = useState("");
  const [lv2Name, setLv2Name] = useState("");
  const [lv3Name, setLv3Name] = useState("");

  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [image, setImage] = useState<string | { url: string }[]>([]);

  const handleDelete = (index: number) => {
    setImage((prevImage) => {
      const arrayImage = Array.isArray(prevImage) ? prevImage : [];
      const updatedImages = arrayImage.filter((_, i) => i !== index);
      return updatedImages;
    });
    setVisiblePreviewIndex(null);
  };

  const [visiblePreviewIndex, setVisiblePreviewIndex] = useState<number | null>(
    null
  );
  const handlePreview = (index: number) => {
    setVisiblePreviewIndex(index);
  };

  const handleClosePreview = () => {
    setVisiblePreviewIndex(null);
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get("/api/promotion/");
        const promotions = response.data.promotions.map((promotion: any) => ({
          value: promotion.id,
          label: promotion.name,
        }));
        setPromotionOptions(promotions);
      } catch (error: any) {
        toastError(error.message);
      }
    };

    const fetchMinisizes = async () => {
      try {
        const response = await axios.get("/api/minisize/");
        setMinisizeOptions(response.data.minisizes);
      } catch (error: any) {
        toastError(error.message);
      }
    };

    fetchPromotions();
    fetchMinisizes();
  }, []);

  useEffect(() => {
    if (productData && mode === "EDIT") {
      const product = productData.find(
        (item: { id: number }) => item.id === id
      );
      if (product) {
        setEditProductData(product);
        // Set form values
        setValue("portalStock", product.portalStock);
        setValue("promotionId", product.promotionId);
        setValue("lv1Id", product.lv1Id);
        setValue("lv2Id", product.lv2Id);
        setValue("lv3Id", product.lv3Id);
        if (product.years) {
          const yearsData = JSON.parse(product.years);
          replace(yearsData); // Replace the entire years array
        }
        setImage(product?.imageProducts || []);
      }
    }
  }, [productData, id]);

  function toCamelCase(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  
  useEffect(() => {
    const fetchCategoryOptions = async (category: string, setter: any) => {
      console.log("fetch")

      try {
        const response = await axios.get(`/api/${toCamelCase(category)}`);
        console.log(response)
        const options = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
        setter(options);
      } catch (error: any) {
        toastError(error.message);
      }
    };
    if (editProductData?.minisizeId) {
      const product = productData.find(
        (item: { id: number }) => item.id === editProductData.id
      );
      if (product) {
        const lv1Array = JSON.parse(product.minisize.lv1);
        const lv2Array = JSON.parse(product.minisize.lv2);
        const lv3Array = JSON.parse(product.minisize.lv3);

        const lv1Data = lv1Array && lv1Array.length > 0 ? lv1Array[0] : null;
        const lv2Data = lv2Array && lv2Array.length > 0 ? lv2Array[0] : null;
        const lv3Data = lv3Array && lv3Array.length > 0 ? lv3Array[0] : null;

        setLv1Name(lv1Data.name);
        setLv2Name(lv2Data.name);
        setLv3Name(lv3Data.name);

        if (lv1Data.data) {
          fetchCategoryOptions(lv1Data.data, setLv1Options);
        }
        if (lv2Data.data) {
          fetchCategoryOptions(lv2Data.data, setLv2Options);
        }
        if (lv3Data.data) {
          fetchCategoryOptions(lv3Data.data, setLv3Options);
        }
      }
    }
  }, [editProductData]);

  const onSubmit: SubmitHandler<ProductSchema> = async (values) => {
    const formData = {
      ...values,
      imageProducts: image,
    };

    if (editProductData) {
      try {
        const response = await axios.put(
          `/api/adminProduct/${editProductData.id}`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setTriggerProduct(!triggerProduct);
        setTrigger(!trigger);
        toastSuccess(t("Product updated successfully"));
        setIsModalVisible(false)
        router.replace(`/${locale}/admin/adminProduct`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };
  const stringToBoolean = (index: number): boolean => {
    const foundObject = fields[index];
    return foundObject.isDisable;
  };
  
  return (
    <Modal
      title={editProductData?.name}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        setTrigger(!trigger);
        setId(0);
      }}
      footer={false}
      className="product-modal"
    >
      <h2 className="font-semibold">{t("Product")}</h2>
      <hr className="my-2" />
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <div className="flex flex-col"></div>
        <div className="flex w-full pb-2">
          <div className="pl-2 basis-full">
            <label>{t("name")}</label>
            <Input
              name="name"
              value={editProductData?.name}
              disabled
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex w-full pb-2">
          <div className="basis-1/2 pl-2">
            <label>{t("code")}</label>
            <Input
              name="code"
              value={editProductData?.code}
              disabled
              className="mt-2"
            />
          </div>
          <div className="basis-1/2 pl-2">
            <label>{t("price")}</label>
            <Input
              name="price"
              value={editProductData?.price}
              disabled
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex w-full pb-2">
          <div className="basis-1/2 pl-2">
            <label>{t("Brand")}</label>
            <Input
              name="brand"
              value={editProductData?.brand?.name}
              disabled
              className="mt-2"
            />
          </div>
          <div className="basis-1/2 pl-2">
            <label>{t('Nav Stock')}</label>
            <Input
              name="navStock"
              value={editProductData?.navStock}
              disabled
              className="mt-2"
            />
          </div>
          <div className="basis-1/2 pl-2">
            <Form.Item
              name="portalStock"
              label={t("portal stock")}
              className="switch-backend basis-1/2"
              required
              tooltip={t('this_is_a_required_field')}
              help={errors.portalStock?.message}
              validateStatus={errors.portalStock ? "error" : ""}
            >
              <Controller
                control={control}
                name="portalStock"
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    placeholder={t("portal stock")}
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </div>
        </div>
        <h2 className="font-semibold">{t("property")}</h2>
        <hr className="my-2" />
        <div className="flex w-full pb-2">
          <div className="basis-1/2 pl-2">
            <label>{t("minisize")}</label>
            <Input
              name="minisize"
              value={editProductData?.minisize?.name}
              disabled
              className="mt-2"
            />
          </div>
          <div className="basis-1/2 pl-2">
            <Form.Item
              name="promotionId"
              label={t("promotion")}
              className="switch-backend basis-1/2"
            >
              <Controller
                control={control}
                name="promotionId"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("Select a promotion")}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={promotionOptions}
                  />
                )}
              />
            </Form.Item>
          </div>
        </div>
        <h2 className="font-semibold">{t("category")}</h2>
        <hr className="my-2" />
        <div className="flex w-full pb-2">
          <div className="basis-1/2 pl-2">
            <Form.Item
              name="lv1Id"
              label={lv1Name}
              className="switch-backend basis-1/2"
            >
              <Controller
                control={control}
                name="lv1Id"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("Select a category")}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={lv1Options}
                  />
                )}
              />
            </Form.Item>
          </div>
          <div className="basis-1/2 pl-2">
            <Form.Item
              name="lv2Id"
              label={lv2Name}
              className="switch-backend basis-1/2"
            >
              <Controller
                control={control}
                name="lv2Id"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("Select a category")}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={lv2Options}
                  />
                )}
              />
            </Form.Item>
          </div>
          <div className="basis-1/2 pl-2">
            <Form.Item
              name="lv3Id"
              label={lv3Name}
              className="switch-backend basis-1/2"
            >
              <Controller
                control={control}
                name="lv3Id"
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("Select a category")}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={lv3Options}
                  />
                )}
              />
            </Form.Item>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="sec1 basis-6/12">
            <h2 className="font-semibold">{t("Year lot")}</h2>
            <hr className="my-2" />
            <div className="year">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex w-full pb-2 items-center"
                >
                  <Form.Item className="mr-2">
                    <Controller
                      control={control}
                      name={`years.${index}.isActive`}
                      render={({ field }) => (
                        <Checkbox {...field} checked={field.value} disabled={stringToBoolean(index)}/>
                      )}
                    />
                  </Form.Item>
                  <Form.Item className="mr-2">
                    <Controller
                      control={control}
                      name={`years.${index}.year`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          disabled
                          className="w-24"
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("discount")}
                    layout="horizontal"
                    className="mr-2"
                  >
                    <Controller
                      control={control}
                      name={`years.${index}.discount`}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          value={field.value}
                          formatter={(value) => `${value}%`}
                          parser={(value) =>
                            value ? parseFloat(value.replace("%", "")) : 0
                          }
                          className="w-full"
                          disabled={stringToBoolean(index)}
                        />
                      )}
                    />
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
          <div className="sec2 basis-6/12">
            <h2 className="font-semibold">{t("Product Image")}</h2>
            <hr className="my-2" />
            <Form.Item name="image" label={t("Upload Image")}>
              <Controller
                control={control}
                name="imageProducts"
                render={({ field }) => (
                  <UploadRewardImage
                    setImage={setImage}
                    fileType="image"
                    allowType={["jpg", "png", "jpeg"]}
                    initialImage={image}
                    multiple={true}
                    id={editProductData?.id}
                  />
                )}
              />
            </Form.Item>
            <div className="flex flex-wrap">
              {Array.isArray(image) &&
                image.map((albumItem, index) => (
                  <div key={index} className="m-2">
                    <Image
                      className="border border-comp-gray-layout rounded-xl"
                      alt="reward album"
                      width={80}
                      height={80}
                      src={albumItem.url}
                      preview={{
                        visible: visiblePreviewIndex === index, // Show preview based on index
                        onVisibleChange: (vis) => {
                          if (!vis) handleClosePreview(); // Close preview when visibility changes to false
                        },
                        mask: (
                          <>
                            <EyeIcon
                              className="w-6"
                              style={{ color: "white" }}
                              onClick={() => handlePreview(index)}
                            />
                            <TrashIcon
                              className="w-6"
                              style={{ color: "white" }}
                              onClick={() => handleDelete(index)}
                            />
                          </>
                        ),
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <Form.Item className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-comp-red button-backend"
          >
            {t('Submit')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalProduct;
