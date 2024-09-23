"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Image,
  Radio,
  Checkbox,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AdminSchema, adminSchema } from "@lib-schemas/user/admin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useSession } from "next-auth/react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { claimSchema, ClaimSchema } from "@lib-schemas/user/claim-schema";
import dynamic from "next/dynamic";
import TextArea from "antd/es/input/TextArea";
import UploadRewardImage from "@components/Admin/UploadRewardImage";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import NoVideo from "@public/images/no_video.png";
const Loading = dynamic(() => import("@components/Loading"));

interface Option {
  name: string;
  key: number;
}

interface OptionSelect {
  label: string;
  value: number;
}

interface Brand {
  name: string;
}

interface Product {
  id: number;
  brand: Brand | null;
  lv1Name: string;
  lv2Name: string;
  lv3Name: string;
}

enum ImageClaimType {
  Image = "image",
  Video = "video",
}

enum ImageClaimRole {
  User = "user",
  Admin = "admin",
}

interface ImageClaim {
  type: ImageClaimType;
  role: ImageClaimRole;
  url: string;
}

export default function Claim({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [image, setImage] = useState<string | { url: string }[]>([]);
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  const locale = useCurrentLocale(i18nConfig);
  const pathname = usePathname();
  const { setI18nName} = useCart();
  const [products, setProducts] = useState<OptionSelect[]>([]);

  const [productDetails, setProductDetails] = useState<Product[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [pageSize] = useState(50); // Default page size
  const userId = session?.user.id;
  const [visiblePreviewIndex, setVisiblePreviewIndex] = useState<number | null>(
    null
  );
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch: watchIsAccept,
  } = useForm<ClaimSchema>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      condition: "Before",
    },
  });
  const isAccept = watchIsAccept("isAccept");

  const transformImageArray = (imageArray: any): ImageClaim[] => {
    return imageArray.map((item: any) => {
      const isImage = ["jpg", "png", "jpeg"].some((ext) => item.url.includes(ext));
  
      return {
        type: isImage ? ImageClaimType.Image : ImageClaimType.Video,
        role: ImageClaimRole.User, // Setting the role as user
        url: item.url,
      };
    });
  };

  const onFinish: SubmitHandler<ClaimSchema> = async (values) => {
    console.log(values);
    if (image.length === 0) {
      toastError(t("Image of the damage is required"));
      return;
    }
    const imageClaims: ImageClaim[] = transformImageArray(image);
    console.log(imageClaims)
    const response = await axios.post(
      `/api/claim`,
      {
        images: imageClaims,
        userId: session?.user.id,
        ...values
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      toastSuccess("Claimed successfully");
      router.replace(`/${locale}/admin/claims`);
    })
    .catch((error) => {
      toastError(error);
    });
    
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/getProductByUser", {
        params: { userId, currentPage, pageSize },
      });
      setProductDetails(data.productDetails);
      const productItems = data.products.map((option: Option) => ({
        label: option.name,
        value: option.key,
      }));
      setProducts(productItems);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const parts = pathname.split("/");
    const lastPart = parts[parts.length - 2];
    console.log("lastPart", lastPart);
    setI18nName(lastPart);
    fetchProducts();
    setLoading(false);
  }, []);

  const handleClosePreview = () => {
    setVisiblePreviewIndex(null);
  };
  const fetchProductDetail = (value: number) => {
    const product = productDetails.find(
      (item: { id: number }) => item.id === value
    );
    if (product && product.brand) {
      setBrand(product.brand.name);
    }
    if (product && product.lv1Name) {
      setCategory(product.lv1Name);
    }
    if (product && product.lv2Name) {
      setModel(product.lv2Name);
    }
    if (product && product.lv3Name) {
      setSize(product.lv3Name);
    }
  };

  const handlePreview = (index: number) => {
    setVisiblePreviewIndex(index);
  };

  const handleDelete = (index: number) => {
    setImage((prevImage) => {
      const arrayImage = Array.isArray(prevImage) ? prevImage : [];
      const updatedImages = arrayImage.filter((_, i) => i !== index);
      return updatedImages;
    });
    setVisiblePreviewIndex(null);
  };

  if (loading || !t) {
    return <Loading />;
  }

  return (
    <>
      <div className="px-4">
        <Form
          form={form}
          name="claim_form"
          onFinish={handleSubmit(onFinish)}
          layout="horizontal"
          className="grow pr-12"
        >
          <div
            className="py-8 pl-8 rounded-lg flex flex-col bg-white"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid grid-cols-6 gap-4">
              <div className="col-start-2 col-span-4">
                <div className="text-lg pb-4 default-font flex gap-4">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M33.7295 4.1665H16.2712C8.68783 4.1665 4.16699 8.68734 4.16699 16.2707V33.7082C4.16699 41.3123 8.68783 45.8332 16.2712 45.8332H33.7087C41.292 45.8332 45.8128 41.3123 45.8128 33.729V16.2707C45.8337 8.68734 41.3128 4.1665 33.7295 4.1665ZM35.417 35.9373H14.5837C13.7295 35.9373 13.0212 35.229 13.0212 34.3748C13.0212 33.5207 13.7295 32.8123 14.5837 32.8123H35.417C36.2712 32.8123 36.9795 33.5207 36.9795 34.3748C36.9795 35.229 36.2712 35.9373 35.417 35.9373ZM35.417 26.5623H14.5837C13.7295 26.5623 13.0212 25.854 13.0212 24.9998C13.0212 24.1457 13.7295 23.4373 14.5837 23.4373H35.417C36.2712 23.4373 36.9795 24.1457 36.9795 24.9998C36.9795 25.854 36.2712 26.5623 35.417 26.5623ZM35.417 17.1873H14.5837C13.7295 17.1873 13.0212 16.479 13.0212 15.6248C13.0212 14.7707 13.7295 14.0623 14.5837 14.0623H35.417C36.2712 14.0623 36.9795 14.7707 36.9795 15.6248C36.9795 16.479 36.2712 17.1873 35.417 17.1873Z"
                      fill="#292D32"
                    />
                  </svg>
                  <div>
                    <p className="text-xl	default-font font-semibold text-black">
                      {t("product_details")}
                    </p>
                    <p className="default-font text-base text-[#919FAF]">
                      {t("Please provide details of the damaged product")}
                    </p>
                  </div>
                </div>

                <Row gutter={[8, 8]} className="claim_form">
                  <Col span={24}>
                    <Form.Item
                      name="productId"
                      label={t("product")}
                      className="switch-backend basis-1/2"
                      hasFeedback
                      required
                      tooltip={t("this_is_a_required_field")}
                      help={errors.productId && t("please_select_product")}
                      validateStatus={errors.productId ? "error" : "success"}
                    >
                      <Controller
                        control={control}
                        name="productId"
                        render={({ field }) => (
                          <Select
                            {...field}
                            showSearch
                            placeholder={t("Select a product")}
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={products}
                            size="large"
                            onChange={(value) => {
                              field.onChange(value);
                              fetchProductDetail(value);
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 8]} className="claim_form">
                  <Col span={3} className="disable-label">
                    {" "}
                    <label>{t("brand")}</label>
                  </Col>
                  <Col span={3} className="disable-input">
                    <Input
                      name="brand"
                      value={brand ?? ""}
                      disabled
                      className="mt-2"
                      size="large"
                    />
                  </Col>
                  <Col span={3} className="disable-label">
                    {" "}
                    <label>{t("category")}</label>
                  </Col>
                  <Col span={3} className="disable-input">
                    <Input
                      name="category"
                      value={category ?? ""}
                      disabled
                      className="mt-2"
                      size="large"
                    />
                  </Col>
                  <Col span={3} className="disable-label">
                    {" "}
                    <label>{t("model")}</label>
                  </Col>
                  <Col span={3} className="disable-input">
                    <Input
                      name="model"
                      value={model ?? ""}
                      disabled
                      className="mt-2"
                      size="large"
                    />
                  </Col>
                  <Col span={3} className="disable-label">
                    {" "}
                    <label>{t("size")}</label>
                  </Col>
                  <Col span={3} className="disable-input">
                    <Input
                      name="size"
                      value={size ?? ""}
                      disabled
                      className="mt-2"
                      size="large"
                    />
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <hr className="my-8 hr-spacing"></hr>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col span={12} className="disable-label">
                    <label className="default-font text-[#919FAF]">
                      {t("condition")}
                    </label>
                    <p className="text-xs	default-font text-[#919FAF]">
                      {t("The time of the product damage")}
                    </p>
                  </Col>
                  <Col span={12} className="disable-input text-end">
                    <Controller
                      control={control}
                      name="condition"
                      defaultValue="Before" // Set this default value inside the Controller
                      render={({ field }) => (
                        <Radio.Group
                          {...field}
                          buttonStyle="solid"
                          onChange={(e) => field.onChange(e.target.value)} // Make sure to update the value
                        >
                          <Radio.Button value="Before" className="default-font">
                            {t("before")}
                          </Radio.Button>
                          <Radio.Button value="After" className="default-font">
                            {t("after")}
                          </Radio.Button>
                        </Radio.Group>
                      )}
                    />
                  </Col>
                </Row>
                <Row gutter={[8, 8]} className="claim_form pt-4">
                  <Col span={24}>
                    <Form.Item
                      name="details"
                      label={t("details")}
                      className="switch-backend basis-1/2"
                      hasFeedback
                      required
                      tooltip={t("this_is_a_required_field")}
                      help={errors.details && t("please_specify_details")}
                      validateStatus={errors.details ? "error" : "success"}
                    >
                      <Controller
                        control={control}
                        name="details"
                        render={({ field }) => (
                          <TextArea
                            {...field}
                            placeholder={t("please_specify_details")}
                            autoSize={{ minRows: 10, maxRows: 10 }}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="sec2 basis-6/12">
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <hr className="my-8 hr-spacing"></hr>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} className="claim_form pt-4">
                    <Col span={24}>
                      <Form.Item
                        name="imageClaims"
                        label={t("Upload Damage Image")}
                      >
                        <Controller
                          control={control}
                          name="imageClaims"
                          render={({ field }) => (
                            <UploadRewardImage
                              setImage={setImage}
                              fileType="raw"
                              allowType={["jpg", "png", "jpeg", "video"]}
                              initialImage={image}
                              multiple={true}
                              // id={editProductData?.id}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="flex flex-wrap">
                    {Array.isArray(image) &&
                      image.map((albumItem, index) => {
                        const isImage = ["jpg", "png", "jpeg"].some((ext) =>
                          albumItem.url.includes(ext)
                        );

                        return (
                          <div key={index} className="m-2">
                            {isImage ? (
                              <Image
                                className="border border-comp-gray-layout rounded-xl"
                                alt="claim"
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
                            ) : (
                              <Image
                                alt="claim"
                                width={80}
                                height={80}
                                preview={{
                                  destroyOnClose: true,
                                  imageRender: () => (
                                    <video
                                      muted
                                      width="100%"
                                      controls
                                      src={albumItem.url}
                                    />
                                  ),
                                  toolbarRender: () => null,
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
                                src={NoVideo.src}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-8 rounded-lg flex flex-col bg-white mt-4"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="flex justify-center flex-col text-center">
              <h1 className="default-font text-xl text-black">
                {t("claim condition")}
              </h1>
              <p className="default-font text-[#919FAF] text-base">
                {t("Please check the product warranty details")}
              </p>
              <hr className="my-8 hr-spacing"></hr>
            </div>
            <div>
              <p className="default-font text-xl text-black">
                รายละเอียดและเงื่อนไขการรับประกันสินค้า ยาง Pirelli
              </p>
              <p className="default-font text-base py-4">
                บริษัท คอมพ์ โมโต จำกัด จะรับประกันความบกพร่องทางการผลิตสินค้า 5
                ปี นับตั้งแต่ปีที่ผลิต โดยที่ยางต้องมีเนื้อยางคงเหลือมากกว่า 1.6
                มม. หรือมีเนื้อยางมากกว่า 30%
                เปรียบเทียบกับยางใหม่ในรุ่นและขนาดเดียวกันกับที่ส่งเข้ามาตรวจสอบเท่านั้น
                ยางมอเตอร์ไซค์ Pirelli
                ที่อยู่ในการรับประกันความบกพร่องทางการผลิต
              </p>
              <p className="default-font text-base py-4">
                - ยางมีเครื่องหมาย DOT (Department of Transport) ที่แก้มยาง -
                ยางที่มีเนื้อมากกว่า 1.6 มม. หรือมีเนื้อยางคงเหลือมากกว่า 30%
                เมือเปรียบเทียบกับยางใหม่ในรุ่นและเดียวกัน
                เงื่อนไขการรับประกันความบกพร่องทางการผลิต
              </p>
              <p className="default-font text-base">
                - บริษัท คอมพ์ โมโต จำกัด จะทำหน้าที่ในการประสานงาน
                ในการส่งภาพถ่าย เอกสารต่างๆ หรือยาง ส่งมอบให้ บริษัท Pirelli
                Tyre S.p.A (ผู้ผลิตยาง) ตรวจสอบเท่านั้น -
                เงื่อนไขและคำจำกัดความของศัพท์ด้านเทคนิค สงวนสิทธิ์ให้ Pirelli
                Tyre S.p.A เป็นผู้รับประกันความบกพร่องทางการผลิตสินค้า
                รวมถึงกำหนดความหมายต่างๆที่อยู่ในการรับประกันความบกพร่องทางการผลิตสินค้านี้
                - ยางส่งเข้ามาตรวจสอบจะแยกเป็นเส้นละกรณี
                เช่นถ้ายางมีปัญหาทั้งยางหน้าและหลัง
                จะตรวจสอบสาเหตุแยกกันระหว่างยางหน้าและหลัง -
                ในการพิจารณาลักษณะความชำรุดบกพร่องของสินค้า
                รวมไปถึงดุลยพินิจในการตัดสินใจเงื่อนไขในการรับประกันความบกพร่องทางการผลิตต่างๆ
                อันเกี่ยวกับสินค้าทุกประการ ให้ถือว่าเจ้าหน้าที่ตรวจสอบของ
                Pirelli Tyre S.p.A เป็นผู้มีอำนาจพิจารณาเหตุ-ผลเป็นที่สุด -
                บริษัทฯ
                ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขการรับประกันความบกพร่อง
                ทางการผลิตสินค้าโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
              </p>
            </div>
            <Row gutter={[8, 8]} className="claim_form pt-4">
              <Col span={24}>
                <Form.Item
                  name="isAccept"
                  label={false}
                  className="switch-backend basis-1/2"
                  hasFeedback
                  required
                  help={errors.isAccept && t("please_accept_terms")}
                  validateStatus={errors.isAccept ? "error" : "success"}
                >
                  <Controller
                    control={control}
                    name="isAccept"
                    render={({ field }) => (
                      <Checkbox {...field}>{t("agree to the terms")}</Checkbox>
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
            <hr className="my-8 hr-spacing"></hr>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-white text-[#0C8CE9] default-font text-base p-4"
            >
              {t("cancel")}
            </Button>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-[#0C8CE9] text-white default-font text-base p-4"
                disabled={!isAccept}
              >
                {t("accept")}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
}
