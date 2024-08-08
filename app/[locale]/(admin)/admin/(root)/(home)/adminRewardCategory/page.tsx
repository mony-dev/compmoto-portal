"use client";
import ModalAlbum from "@components/Admin/category/ModalAlbum";
import DataTable from "@components/Admin/Datatable";
import ModalCategory from "@components/Admin/rewardCategory/ModalCategory";
import {
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import NoImage from "@public/images/no_image.png";

export default function adminsRewardCategory({
  params,
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [categoryData, setCategoryData] = useState<DataType[]>([]);
  const [triggerCategory, setTriggerCategory] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [cateDate, setCateData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState("เพิ่มหมวดหมู่");
  const [isAlbumVisible, setIsAlbumVisible] = useState(false);
  const [triggerAlbum, setTriggerAlbum] = useState(false);
  const [idAlbum, setIdAlbum] = useState(0);
  const [titleAlbum, setTitleAlbum] = useState("เพิ่มอัลบั้นรูป");
  const [alData, setAlData] = useState<AlbumDataType | null>(null);
  const [albumData, setAlbumData] = useState<AlbumDataType[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  interface DataType {
    rewardCount: any;
    rewards: any;
    id: number;
    name: string;
    isActive: boolean;
  }

  interface AlbumDataType {
    id: number;
    name: string;
    images: any;
  }

  const deleteCategory = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/rewardCategories/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerCategory(!triggerCategory);
          router.replace(`/${locale}/admin/adminRewardCategory`);
          toastSuccess("Category deleted successfully");
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.id.toString().localeCompare(b.id.toString()),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
        <Link href={`/${locale}/admin/adminReward/${record.id}`}>{record.name}</Link>
      ),
    },
    {
      title: "แสดง",
      key: "isActive",
      dataIndex: "isActive",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isActive) - Number(a.isActive),
      render: (isActive: boolean) => (
        <div className="switch-backend">
          <Switch
            checked={isActive}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled
          />
        </div>
      ),
    },
    {
      title: "สินค้า",
      dataIndex: "rewardCount",
      key: "rewardCount",
      sorter: (a, b) => a.rewardCount - b.rewardCount,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={showModal(true, record.id)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>Edit</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deleteCategory(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>Delete</span>
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    axios
      .get(`/api/rewardCategories?q=${searchText}`)
      .then((response) => {
        const useCate = response.data.map((cate: DataType) => ({
          key: cate.id,
          id: cate.id,
          name: cate.name,
          isActive: cate.isActive,
          rewardCount: cate?.rewards.length,
        }));

        setCategoryData(useCate);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [searchText, triggerCategory]);

  useEffect(() => {
    if (id > 0) {
      axios
        .get(`/api/rewardCategories/${id}`)
        .then((response) => {
          setCateData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
      setMode("EDIT");
    }
  }, [id, triggerCategory]);

  useEffect(() => {
    axios
      .get(`/api/adminRewardAlbum`)
      .then((response) => {
        const album = response.data.map((reward: AlbumDataType) => ({
          key: reward.id,
          id: reward.id,
          name: reward.name,
          images: reward.images,
        }));
        setAlbumData(album);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [triggerAlbum]);

  useEffect(() => {
    if (idAlbum > 0) {
      axios
        .get(`/api/adminRewardAlbum/${idAlbum}`)
        .then((response) => {
          setAlData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
      setMode("EDIT");
    }
  }, [idAlbum, triggerAlbum]);

  function showModal(isShow: boolean, idCate: number) {
    return () => {
      setIsModalVisible(isShow);
      setId(idCate);
      if (idCate === 0) {
        setMode("ADD");
        setTitle("เพิ่มหมวดหมู่");
      } else {
        setMode("EDIT");
        setTitle("แก้ไขหมวดหมู่");
      }
    };
  }

  function showModalAlbum(isShow: boolean, idAlbumModal: number) {
    return () => {
      setIsAlbumVisible(isShow);
      setIdAlbum(idAlbumModal);
      if (idAlbumModal === 0) {
        setMode("ADD");
        setTitleAlbum("เพิ่มอัลบั้นรูป");
      } else {
        setMode("EDIT");
        setTitleAlbum("แก้ไขอัลบั้นรูป");
      }
    };
  }
  return (
    <div className="px-12">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">หมวดหมู่แลกรางวัล</p>
          <div className="flex">
            <Input.Search
              placeholder="Search"
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px", marginBottom: "20px" }}
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<PlusIcon className="w-4" />}
              onClick={showModal(true, 0)}
            >
              Add
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={categoryData}></DataTable>

        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">อัลบั้นรูป</p>
        </div>
        <div className="flex">
          {albumData.map((albumItem) => (
            <div key={albumItem.id} className="m-2">
              <Image
                className="border border-comp-gray-layout rounded-xl"
                alt="reward album"
                width={176}
                height={176}
                src={albumItem.images[0]?.url ? albumItem.images[0]?.url : NoImage.src}
              />
              <p
                className="cursor-pointer hover:text-comp-blue-primary"
                onClick={showModalAlbum(true, albumItem.id)}
              >
                {albumItem.name}
              </p>
            </div>
          ))}
          <div
            className="m-2 w-44 h-44 flex flex-col justify-center items-center border border-dashed border-comp-gray-layout rounded-xl bg-comp-gray-upload cursor-pointer hover:border-comp-blue-primary"
            onClick={showModalAlbum(true, 0)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Upload</span>
          </div>
        </div>
        <ModalCategory
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setTriggerCategory={setTriggerCategory}
          triggerCategory={triggerCategory}
          {...(cateDate && { cateDate })}
          mode={mode}
          title={title}
        />
        <ModalAlbum
          isModalVisible={isAlbumVisible}
          setIsModalVisible={setIsAlbumVisible}
          setTriggerAlbum={setTriggerAlbum}
          triggerAlbum={triggerAlbum}
          {...(alData && { alData })}
          mode={mode}
          id={params.id}
          title={titleAlbum}
        />
      </div>
    </div>
  );
}
