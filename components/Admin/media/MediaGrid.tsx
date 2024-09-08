import React, { useState } from "react";
import "../../../styles/globals.scss";
import "../../../styles/fonts.scss";

import { Image, Modal, Pagination, PaginationProps } from "antd";
import {
  formatDateDiff,
  formatDateDiffNumber,
  formatDateNumber,
} from "@lib-utils/helper";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
const DataTable = dynamic(() => import("../Datatable"));

interface MediaGridProps {
  mediaData: {
    id: number;
    key: number;
    name: string;
    minisize: {
      id: number;
      name: string;
    };
    isActive: boolean;
    type: string;
    coverImg: string;
    url?: string;
    duration?: string;
    createdAt: string;
    size?: any;
  }[];
  type: "File" | "Video" | "Image";
  total: number;
  setPageSize: any;
  setCurrentPage: any;
  pageSize: number;
  currentPage: number;
}

interface MediaDataType {
  id: number;
  key: number;
  name: string;
  minisize: {
    id: number;
    name: string;
  };
  isActive: boolean;
  type: string;
  coverImg: string;
  url?: string;
  duration?: string;
  createdAt: string;
  size?: any;
}
const MediaGrid: React.FC<MediaGridProps> = ({
  mediaData,
  type,
  total,
  pageSize,
  currentPage,
  setPageSize,
  setCurrentPage,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const { t } = useTranslation();

  const handleDownloadClick = async (
    url: string | undefined,
    coverImg: string
  ) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      const downloadUrl = coverImg;
      // Create a hidden anchor element to trigger the download
      try {
        // Fetch the image as a blob
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const link = document.createElement("a");

        // Create a URL for the blob and set it as the href of the link
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;

        // Set the download attribute to suggest a filename for the downloaded image
        link.setAttribute(
          "download",
          downloadUrl.split("/").pop() || "download.png"
        );

        // Append the link to the body and trigger a click to start the download
        document.body.appendChild(link);
        link.click();

        // Clean up by removing the link and revoking the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error("Failed to download image:", error);
      }
    }
  };

  const handlePreviewClick = (imgSrc: string) => {
    setPreviewImage(imgSrc);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPreviewImage("");
  };

  const columns: ColumnsType<MediaDataType> = [
    {
      title: t("file"),
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "descend",
      render: (_, record) => (
        <>
          <div className="flex items-center">
            <svg
              className="mx-8"
              width="6"
              height="7"
              viewBox="0 0 6 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="0.5" width="6" height="6" rx="2" fill="#919FAF" />
            </svg>
            <div>
              <p className="gotham-font text-[#2D3748] font-black	text-sm">
                {record.name}
              </p>
              <p className="gotham-font text-[#919FAF] text-xs">
                {formatDateDiffNumber(record.createdAt)}
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: t("date"),
      dataIndex: "createdAt",
      key: "createdAt",
      defaultSortOrder: "descend",
      render: (_, record) => (
        <p className="text-[#2D3748]">{formatDateNumber(record.createdAt)}</p>
      ),
    },
    {
      title: t("size"),
      dataIndex: "size",
      key: "size",
      defaultSortOrder: "descend",
      render: (_, record) => <p>{record.size}</p>,
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <Link
            className="flex cursor-pointer hover:text-comp-blue-link pl-2"
            href={{ pathname: record.coverImg }}
            target="_blank"
          >
            <span className="text-[#0C8CE9] text-sm hover:underline">
              {t("Download")}
            </span>
          </Link>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>previous</a>;
    }
    if (type === 'next') {
      return <a>next</a>;
    }
    return originalElement;
  };

  return (
    <><div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-8">
      {mediaData.map((media, index) => (
        <div
          key={media.key}
          className={`${media.type == "File" && "col-span-full"}`}
        >
          {(type === "Video" || type === "Image") && (
            <>
              {/* Wrapping the Image component in a clickable div */}
              <div className="relative w-full cursor-pointer group media-container">
                <Image
                  width={"100%"}
                  className="w-full h-auto rounded-lg object-cover flex"
                  src={media.coverImg}
                  alt={media.name}
                  style={{ maxWidth: "100%", height: "100%" }} // Ensures the image fills the grid item width
                  preview={false} // Disable default preview behavior of Ant Design Image
                />

                {/* Overlay effect with icons */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <div className="grid place-items-center">
                    <svg
                      onClick={() => handlePreviewClick(media.coverImg)}
                      className="text-white text-2xl mx-2 cursor-pointer"
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.586 0.666748H8.41268C3.55935 0.666748 0.666016 3.56008 0.666016 8.41341V19.5867C0.666016 21.0401 0.919349 22.3067 1.41268 23.3734C2.55935 25.9067 5.01268 27.3334 8.41268 27.3334H19.586C24.4393 27.3334 27.3327 24.4401 27.3327 19.5867V16.5334V8.41341C27.3327 3.56008 24.4393 0.666748 19.586 0.666748ZM25.1593 14.6667C24.1193 13.7734 22.4393 13.7734 21.3993 14.6667L15.8527 19.4267C14.8127 20.3201 13.1327 20.3201 12.0927 19.4267L11.6393 19.0534C10.6927 18.2267 9.18602 18.1467 8.11935 18.8667L3.13268 22.2134C2.83935 21.4667 2.66602 20.6001 2.66602 19.5867V8.41341C2.66602 4.65341 4.65268 2.66675 8.41268 2.66675H19.586C23.346 2.66675 25.3327 4.65341 25.3327 8.41341V14.8134L25.1593 14.6667Z"
                        fill="white" />
                    </svg>
                    <p className="text-xs default-font text-white">
                      {t("View")}
                    </p>
                  </div>
                  <div className="grid place-items-center">
                    <svg
                      onClick={() => handleDownloadClick(media.url, media.coverImg)}
                      className="text-white text-2xl mx-2 cursor-pointer"
                      width="24"
                      height="26"
                      viewBox="0 0 24 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 0C12.7364 0 13.3333 0.58203 13.3333 1.3V14.6154L16.714 11.3192C17.2347 10.8115 18.079 10.8115 18.5997 11.3192C19.1204 11.8269 19.1204 12.65 18.5997 13.1577L13.1785 18.4433C12.5276 19.0779 11.4724 19.0779 10.8215 18.4433L5.40034 13.1577C4.87964 12.65 4.87964 11.8269 5.40034 11.3192C5.92104 10.8115 6.76526 10.8115 7.28595 11.3192L10.6667 14.6154V1.3C10.6667 0.58203 11.2636 0 12 0Z"
                        fill="white" />
                      <path
                        d="M1.33333 16.9C2.06971 16.9 2.66667 17.482 2.66667 18.2V23.4H21.3333V18.2C21.3333 17.482 21.9303 16.9 22.6667 16.9C23.403 16.9 24 17.482 24 18.2V23.4C24 24.8359 22.8061 26 21.3333 26H2.66667C1.19391 26 0 24.8359 0 23.4V18.2C0 17.482 0.596954 16.9 1.33333 16.9Z"
                        fill="white" />
                    </svg>
                    <p className="text-xs default-font text-white">
                      {t("Download")}
                    </p>
                  </div>
                </div>

                {media.duration && type === "Video" && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {media.duration}
                  </div>
                )}
              </div>
              <p className="text-black inter-bold-font text-sm pt-2">
                {media.name}
              </p>
              <p className="text-[#9f9f9f] gotham-font text-xs pt-1">
                {formatDateDiff(media.createdAt)}
              </p>
            </>
          )}
        </div>

      ))}
      {type === "File" && (
        <div className="col-span-full">
          <DataTable
            columns={columns}
            data={mediaData}
            total={total}
            currentPage={1}
            pageSize={pageSize}
            onPageChange={handlePageChange} />
        </div>
      )}

      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={handleModalClose}
        className="media-container"
      >
        <Image
          src={previewImage}
          alt="Preview"
          width="100%"
          preview={false}
          className="rounded-lg" />
      </Modal>
    </div><div className="flex justify-center">
        {type !== "File" &&
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            className="mt-4"
            showSizeChanger={false}
            showQuickJumper={false}
            itemRender={itemRender}
            />
            }
      </div></>
      
  );
};

export default MediaGrid;
