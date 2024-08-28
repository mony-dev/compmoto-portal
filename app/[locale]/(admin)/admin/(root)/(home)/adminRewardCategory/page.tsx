"use client";
import dynamic from "next/dynamic";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import debounce from "lodash.debounce";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Input, Modal, Switch } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "antd";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import NoImage from "@public/images/no_image.png";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { CloseCircleOutlined } from "@ant-design/icons";

const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));
const ModalAlbum = dynamic(() => import("@components/Admin/category/ModalAlbum"));
const ModalCategory = dynamic(() => import("@components/Admin/rewardCategory/ModalCategory"));

export default function adminsRewardCategory({
  params,
}: {
  params: { id: number };
}) {
  const { t } = useTranslation();
  const {setI18nName, setLoadPage, loadPage} = useCart();
  const router = useRouter();
  const [searchText, setSearchText] = useState(() => {
    // Initialize searchText from query parameter 'q' or default to an empty string
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState<DataType[]>([]);
  const [triggerCategory, setTriggerCategory] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState(0);
  const [cateDate, setCateData] = useState<DataType | null>(null);
  const [mode, setMode] = useState("ADD");
  const [title, setTitle] = useState(t("Add Category"));
  const [isAlbumVisible, setIsAlbumVisible] = useState(false);
  const [triggerAlbum, setTriggerAlbum] = useState(false);
  const [idAlbum, setIdAlbum] = useState(0);
  const [titleAlbum, setTitleAlbum] = useState(t("Add Album"));
  const [alData, setAlData] = useState<AlbumDataType | null>(null);
  const [albumData, setAlbumData] = useState<AlbumDataType[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  interface DataType {
    key: number;
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
      title: t("Are you sure you want to delete this category"),
      content: t("This action cannot be undone"),
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/rewardCategories/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerCategory(!triggerCategory);
          router.replace(`/${locale}/admin/adminRewardCategory`);
          toastSuccess(t("Category deleted successfully"));
        } catch (error: any) {
          toastError(error.response.data.message);
        }
      },
    });
  };
  const deleteAlbum = (id: number) => {
    Modal.confirm({
      title: t("Are you sure you want to delete this album"),
      content: t("This action cannot be undone"),
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/adminRewardAlbum/${id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setTriggerAlbum(!triggerAlbum);
          router.replace(`/${locale}/admin/adminRewardCategory`);
          toastSuccess(t("Album deleted successfully"));
        } catch (error: any) {
          toastError(error.response.data.message);
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
      title: t('Name'),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
        <Link href={`/${locale}/admin/adminReward/${record.id}`}>{record.name}</Link>
      ),
    },
    {
      title: t('Show'),
      key: "isActive",
      dataIndex: "isActive",
      sorter: (a: DataType, b: DataType) =>
        Number(b.isActive) - Number(a.isActive),
      render: (isActive: boolean) => (
        <div className="switch-backend">
          <Switch
            checked={isActive}
            checkedChildren={t("Active")}
            unCheckedChildren={t("Inactive")}
            disabled
          />
        </div>
      ),
    },
    {
      title: t('Product'),
      dataIndex: "rewardCount",
      key: "rewardCount",
      sorter: (a, b) => a.rewardCount - b.rewardCount,
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pr-2"
            onClick={showModal(true, record.id)}
          >
            <PencilSquareIcon className="w-4 mr-0.5" />
            <span>{t("Edit")}</span>
          </p>
          |
          <p
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            onClick={() => deleteCategory(record.id)}
          >
            <TrashIcon className="w-4 mr-0.5" />
            <span>{t("Delete")}</span>
          </p>
        </div>
      ),
    },
  ];

    // Debounce function for search input
    const debouncedFetchData = useCallback(
      debounce(() => {
        fetchData(searchText);
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
    }, [currentPage, debouncedFetchData, triggerCategory]);

    useEffect(() => {
      // Update the URL with the search query
      const queryParams = new URLSearchParams(searchParams.toString());
      if (searchText) {
        queryParams.set('q', searchText);
      } else {
        queryParams.delete('q');
      }
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      // @ts-ignore: TypeScript error explanation or ticket reference
      router.push(newUrl, undefined, { shallow: true });
  
    }, [searchText]);

  async function fetchData(query: string = "") {
    setLoadPage(true);
    try {
      const { data } = await axios.get(`/api/rewardCategories`, {
        params: {
          q: query,
          page: currentPage,
          pageSize: pageSize,
        },
      });

      const cateDataWithKeys = data.rewardCategories.map(
        (cate: DataType, index: number) => ({
          ...cate,
          key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
        })
      );
      setCategoryData(cateDataWithKeys);
      setTotal(data.total);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadPage(false);
    }
  }

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
        setTitle(t("Add Category"));
      } else {
        setMode("EDIT");
        setTitle(t("Edit Category"));
      }
    };
  }

  function showModalAlbum(isShow: boolean, idAlbumModal: number) {
    return () => {
      setIsAlbumVisible(isShow);
      setIdAlbum(idAlbumModal);
      if (idAlbumModal === 0) {
        setMode("ADD");
        setTitleAlbum(t("Add Album"));
      } else {
        setMode("EDIT");
        setTitleAlbum(t("Edit Album"));
      }
    };
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(value); // Trigger data fetch only on search
  };
  const handleClear = () => {
    setSearchText(""); // Clear the input
    fetchData(""); // Reset the list to show all data
  };
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  if (loadPage || !t) {
    return (
      <Loading/>
    );
  }
  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow">{t("Reward Category")}</p>
          <div className="flex">
          <Input.Search
              placeholder={t('search')}
              size="middle"
              style={{ width: "200px", marginBottom: "20px" }}
              value={searchText}
              onSearch={handleSearch}
              onChange={handleInputChange}
              suffix={
                searchText ? (
                  <CloseCircleOutlined
                    onClick={handleClear}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
            <Button
              className="bg-comp-red button-backend ml-4"
              type="primary"
              icon={<PlusIcon className="w-4" />}
              onClick={showModal(true, 0)}
            >
              {t("Add")}
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={categoryData}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
        <div className="flex justify-between items-center pt-4">
          <p className="text-lg font-semibold pb-4 grow">{t("Album")}</p>
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
                className=" flex justify-between"
              >
                <a className="cursor-pointer hover:text-comp-blue-primary" onClick={showModalAlbum(true, albumItem.id)}>{albumItem.name}</a>
                <TrashIcon className="w-4 text-back cursor-pointer hover:text-comp-red"  onClick={() => deleteAlbum(albumItem.id)} />

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
            <span>{t("Upload")}</span>
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
