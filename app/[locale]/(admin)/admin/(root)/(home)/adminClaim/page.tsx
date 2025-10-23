// "use client";
// import dynamic from "next/dynamic";

// import {
//   formatDate,
//   toastError,
// } from "@lib-utils/helper";
// import {
//   Badge,
//   Input,
//   Spin,
//   Tabs,
//   TabsProps,
// } from "antd";
// import { ColumnsType } from "antd/es/table";
// import axios from "axios";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import React, { useCallback, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useCart } from "@components/Admin/Cartcontext";
// import { useSession } from "next-auth/react";
// import debounce from "lodash.debounce";
// import { CloseCircleOutlined } from "@ant-design/icons";
// import Link from "next/link";
// import { useCurrentLocale } from "next-i18n-router/client";
// import i18nConfig from "../../../../../../../i18nConfig";
// const DataTable = dynamic(() => import("@components/Admin/Datatable"));

// export default function AdminClaim({
//   params,
// }: {
//   params: { id: number };
// }) {
//   const { t } = useTranslation();
//   const {setI18nName, setLoadPage, loadPage} = useCart();
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [searchText, setSearchText] = useState(() => {
//     const params = new URLSearchParams(window.location.search);
//     return params.get("q") || "";
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [claimData, setClaimData] = useState<ClaimDataType[]>([]);
//   const [claimCount, setClaimCount] = useState<ClaimDataType[]>([]);
//   const [triggerClaim, setTriggerClaim] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [id, setId] = useState(0);
//   const [mode, setMode] = useState("ADD");
//   const [title, setTitle] = useState(t("Reviewing"));
//   const [completeCount, setCompleteCount] = useState(0);
//   const [incompleteCount, setIncompleteCount] = useState(0);
//   const [inProgressCount, setInProgressCount] = useState(0);
//   const searchParams = useSearchParams();
//   const [loading, setLoading] = useState(false);
//   const locale = useCurrentLocale(i18nConfig);

//   const pathname = usePathname();
//   const [activeTabKey, setActiveTabKey] = useState("1");

//   interface ClaimDataType {
//     key: number;
//     id: number;
//     claimNo: string;
//     condition: string;
//     details: string;
//     createdAt: string;
//     status: string;
//     user: {
//       custNo: string;
//       id: number;
//       contactName: string;
//     };
//     product: {
//       id: number;
//       name: string;
//     };
//     images: {
//       url: string;
//       type: string;
//       role: string;
//     };
//   }

//   const columns: ColumnsType<ClaimDataType> = [
//     {
//       title: t('claimNo'),
//       dataIndex: "claimNo",
//       key: "claimNo",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => b.key - a.key,
//       render: (_, record) => (
//         <Link href={`/${locale}/admin/adminClaim/${record.id}`}>{record.claimNo}</Link>
//       ),
//     },
//     {
//       title: t('name'),
//       dataIndex: "name",
//       key: "name",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.user.contactName.localeCompare(b.user.contactName),
//       render: (_, record) => <p>{record.user.contactName}</p>,
//     },
//     {
//       title: t('product'),
//       dataIndex: "product",
//       key: "product",
//       defaultSortOrder: "descend",
//       sorter: (a, b) => a.product.name.localeCompare(b.product.name),
//       render: (_, record) => <p>{record.product.name}</p>,
//     },
//     {
//       title: t('Date'),
//       dataIndex: "date",
//       key: "date",
//       render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
//       sorter: (a, b) =>
//         formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
//     },
//   ];

//     // Debounce function for search input
//     const debouncedFetchData = useCallback(
//       debounce(() => {
//         fetchData(searchText);
//         if (activeTabKey === "1") {
//           fetchData("inProgress", searchText); // Fetch incomplete data
//         } else if (activeTabKey === "2") {
//           fetchData("complete", searchText); // Fetch complete data
//         } else {
//           fetchData("incomplete", searchText);
//         }
//       }, 500), // 500 ms debounce delay
//       [currentPage, pageSize, activeTabKey, triggerClaim]
//     );
  
    
//     useEffect(() => {
//       const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
//       setI18nName(lastPart);
  
//       // Call the debounced fetch function
//       debouncedFetchData();
  
//       // Cleanup debounce on unmount
//       return () => {
//         debouncedFetchData.cancel();
//       };
//     }, [currentPage, debouncedFetchData]);
    
//   const handlePageChange = (page: number, pageSize?: number) => {
//     setCurrentPage(page);
//     if (pageSize) {
//       setPageSize(pageSize);
//     }
//   };
//   const items: TabsProps["items"] = [
//     {
//       key: "1",
//       label: (
//         <Badge className="redeem-badge default-font" count={inProgressCount} offset={[10, 1]} overflowCount={99}>
//           <p>{t("Inprogress")}</p>
//         </Badge>
//       ),
//       children: (
//         <DataTable
//         columns={columns}
//         data={claimData}
//         total={total}
//         currentPage={currentPage}
//         pageSize={pageSize}
//         onPageChange={handlePageChange}
//       />
//       ),
//     },
//     {
//       key: "2",
//       label: (
//         <Badge className="redeem-badge default-font" count={completeCount} offset={[10, 1]} overflowCount={99}>
//           <p>{t("complated")}</p>
//         </Badge>
//       ),
//       children: (
//         <DataTable
//         columns={columns}
//         data={claimData}
//         total={total}
//         currentPage={currentPage}
//         pageSize={pageSize}
//         onPageChange={handlePageChange}
//       />
//       ),
//     },
//     {
//       key: "3",
//       label: (
//         <Badge className="redeem-badge default-font" count={incompleteCount} offset={[10, 1]} overflowCount={99}>
//           <p>{t("inComplated")}</p>
//         </Badge>
//       ),
//       children: (
//         <DataTable
//         columns={columns}
//         data={claimData}
//         total={total}
//         currentPage={currentPage}
//         pageSize={pageSize}
//         onPageChange={handlePageChange}
//       />
//       ),
//     },
//   ];

//   const fetchData = async (claimStatus: string, query: string = "") => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get(`/api/claim`, {
//         params: {
//           q: query,
//           page: currentPage,
//           pageSize: pageSize,
//           status: claimStatus,
//         },
//       });
  
//       const claimUserDataWithKeys = data.claims.map(
//         (claim: ClaimDataType, index: number) => ({
//           ...claim,
//           key: index + 1 + (currentPage - 1) * pageSize, // Ensuring unique keys across pages
//         })
//       );
//       setClaimCount(data.claimCount)
//       setClaimData(claimUserDataWithKeys);
//       setTotal(data.total);
  
//       // Update counts
//       const complete = data.claimCount.filter((item: ClaimDataType) => item.status === "Complete").length;
//       const incomplete = data.claimCount.filter((item: ClaimDataType) => item.status === "Incomplete").length;
//       const inprogress = data.claimCount.filter((item: ClaimDataType) => item.status === "InProgress").length;
//       setCompleteCount(complete);
//       setIncompleteCount(incomplete);
//       setInProgressCount(inprogress);
//     } catch (error: any) {
//       toastError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchText(e.target.value);
//   };

//   const handleSearch = (value: string) => {
//     setSearchText(value);
//     const queryParams = new URLSearchParams(searchParams.toString());
//     if (value) queryParams.set("q", value);
//     else queryParams.delete("q");
//     const newUrl = `${pathname}?${queryParams.toString()}`;
//     window.history.replaceState(null, "", newUrl);

//     fetchData(value); 
//   };
//   const handleClear = () => {
//     window.history.replaceState(null, "", `${pathname}`);
//     setCurrentPage(1);
//     setSearchText(""); // Clear the input
//     fetchData("", ""); // Reset the list to show all data
//   };

//   const onChange = (key: string) => {
//     setActiveTabKey(key); // Update active tab state
//     setCurrentPage(1);
//   };

//   return (
//     <div className="px-4">
//       <div
//         className="py-8 px-8 rounded-lg flex flex-col bg-white"
//         style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
//       >
//         <div className="flex justify-between items-center">
//           <p className="text-lg font-semibold pb-4 grow default-font">{t("Claim List")}</p>
//           <div className="flex">
//           <Input.Search
//               placeholder={t("Search")}
//               size="middle"
//               style={{ width: "200px", marginBottom: "20px" }}
//               value={searchText}
//               onSearch={handleSearch}
//               onChange={handleInputChange}
//               suffix={
//                 <CloseCircleOutlined
//                   onMouseDown={(e) => e.preventDefault()} 
//                   onClick={handleClear}
//                   style={{
//                     cursor: searchText ? "pointer" : "default",
//                     opacity: searchText ? 1 : 0,        
//                     pointerEvents: searchText ? "auto" : "none", 
//                     transition: "opacity 120ms ease",
//                   }}
//                   tabIndex={-1} 
//                 />
//               }
//             />
//           </div>
//         </div>
//         <Spin spinning={loadPage}>
//           <Tabs
//             activeKey={activeTabKey}
//             items={items}
//             onChange={onChange}
//             className="redeem-tab"
//           />
//         </Spin>
//         {/* <ModalClaimVerify
//           isModalVisible={isModalVisible}
//           setIsModalVisible={setIsModalVisible}
//           setTriggerReward={setTriggerReward}
//           triggerReward={triggerReward}
//           {...(claimData && { claimData })}
//           mode={mode}
//           title={title}
//           id={id}
//         /> */}
//       </div>
//     </div>
//   );
// }

"use client";
import dynamic from "next/dynamic";
import {
  formatDate,
  toastError,
} from "@lib-utils/helper";
import {
  Badge,
  Input,
  Tabs,
  TabsProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import { useSession } from "next-auth/react";
import debounce from "lodash.debounce";
import { CloseCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../i18nConfig";
import type { Route } from "next";
const Loading = dynamic(() => import("@components/Loading"));
const DataTable = dynamic(() => import("@components/Admin/Datatable"));

type ClaimStatus = "InProgress" | "Complete" | "Incomplete";

interface ClaimDataType {
  key: number;
  id: number;
  claimNo: string;
  condition: string;
  details: string;
  createdAt: string;
  status: ClaimStatus;
  user: {
    custNo: string;
    id: number;
    contactName: string;
  };
  product: {
    id: number;
    name: string;
  };
  images: {
    url: string;
    type: string;
    role: string;
  };
}

const statusByTab: Record<string, ClaimStatus> = {
  "1": "InProgress",
  "2": "Complete",
  "3": "Incomplete",
};

export default function Claims({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const { setI18nName } = useCart();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale(i18nConfig);

  const { data: session, status: authStatus } = useSession();

  const [activeTabKey, setActiveTabKey] = useState<"1" | "2" | "3">("1");

  // SSR-safe searchText init (read query in an effect)
  const [searchText, setSearchText] = useState<string>("");
  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    setSearchText(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [claimData, setClaimData] = useState<ClaimDataType[]>([]);
  const [completeCount, setCompleteCount] = useState<number>(0);
  const [incompleteCount, setIncompleteCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  // set page name for your i18n header/etc.
  useEffect(() => {
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    setI18nName(lastPart);
  }, [pathname, setI18nName]);

  // sync ?q= to URL
  useEffect(() => {
    const qp = new URLSearchParams(searchParams?.toString());
    if (searchText) qp.set("q", searchText);
    else qp.delete("q");

    const nextUrl = `${pathname}?${qp.toString()}` as Route;
    router.replace(nextUrl) ;
  }, [searchText, pathname, router, searchParams]);

  const columns: ColumnsType<ClaimDataType> = useMemo(
    () => [
      {
        title: t("claimNo"),
        dataIndex: "claimNo",
        key: "claimNo",
        sorter: (a, b) => a.claimNo.localeCompare(b.claimNo),
        render: (_, record) => (
          <Link href={`/${locale}/admin/adminClaim/${record.id}`}>{record.claimNo}</Link>
        ),
      },
      {
        title: t("name"),
        dataIndex: "name",
        key: "name",
        sorter: (a, b) =>
          (a.user?.contactName || "").localeCompare(b.user?.contactName || ""),
        render: (_, record) => <p>{record.user?.contactName ?? "-"}</p>,
      },
      {
        title: t("product"),
        dataIndex: "product",
        key: "product",
        sorter: (a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""),
        render: (_, record) => <p>{record.product?.name ?? "-"}</p>,
      },
      {
        title: t("Date"),
        dataIndex: "date",
        key: "date",
        render: (_, record) => <p>{formatDate(record.createdAt)}</p>,
        sorter: (a, b) =>
          formatDate(a.createdAt).localeCompare(formatDate(b.createdAt)),
      },
    ],
    [locale, t]
  );

  const handlePageChange = (page: number, ps?: number) => {
    setCurrentPage(page);
    if (ps) setPageSize(ps);
  };

  const fetchData = useCallback(
    async (claimStatus: ClaimStatus, query: string) => {
      if (!session?.user?.id) return;

      setLoading(true);
      try {
        const { data } = await axios.get(`/api/claim`, {
          params: {
            q: query,
            page: currentPage,
            pageSize,
            status: claimStatus,
          },
        });

        const claimUserDataWithKeys: ClaimDataType[] = data.claims.map(
          (claim: ClaimDataType, index: number) => ({
            ...claim,
            key: index + 1 + (currentPage - 1) * pageSize,
          })
        );

        setClaimData(claimUserDataWithKeys);
        setTotal(data.total ?? 0);

        // counts
        const cc = (data.claimCount || []) as ClaimDataType[];
        const complete = cc.filter((x) => x.status === "Complete").length;
        const incomplete = cc.filter((x) => x.status === "Incomplete").length;
        const inprogress = cc.filter((x) => x.status === "InProgress").length;

        setCompleteCount(complete);
        setIncompleteCount(incomplete);
        setInProgressCount(inprogress);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, session?.user?.id]
  );

  // Debounce fetcher that accepts (status, query)
  const debouncedFetchData = useMemo(
    () =>
      debounce((status: ClaimStatus, query: string) => {
        fetchData(status, query);
      }, 500),
    [fetchData]
  );

  useEffect(() => {
    if (authStatus !== "authenticated") return; // wait until ready
  
    const statusStr = statusByTab[activeTabKey];
    debouncedFetchData(statusStr, searchText);
  
    return () => debouncedFetchData.cancel();
  }, [
    activeTabKey,
    currentPage,
    pageSize,
    searchText,
    authStatus,          // 👈 use the renamed var
    debouncedFetchData,
  ]);

  const onChangeTab: TabsProps["onChange"] = (key) => {
    setActiveTabKey(key as "1" | "2" | "3");
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleClear = () => {
    setSearchText("");
  };

  const items: TabsProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: (
          <Badge
            className="redeem-badge default-font"
            count={inProgressCount}
            offset={[10, 1]}
            overflowCount={99}
          >
            <p>{t("Inprogress")}</p>
          </Badge>
        ),
        children: (
          <DataTable
            columns={columns}
            data={claimData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        ),
      },
      {
        key: "2",
        label: (
          <Badge
            className="redeem-badge default-font"
            count={completeCount}
            offset={[10, 1]}
            overflowCount={99}
          >
            <p>{t("complated")}</p>
          </Badge>
        ),
        children: (
          <DataTable
            columns={columns}
            data={claimData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        ),
      },
      {
        key: "3",
        label: (
          <Badge
            className="redeem-badge default-font"
            count={incompleteCount}
            offset={[10, 1]}
            overflowCount={99}
          >
            <p>{t("inComplated")}</p>
          </Badge>
        ),
        children: (
          <DataTable
            columns={columns}
            data={claimData}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        ),
      },
    ],
    [
      claimData,
      columns,
      completeCount,
      incompleteCount,
      inProgressCount,
      currentPage,
      pageSize,
      total,
      t,
    ]
  );

  if (authStatus === "loading" || loading) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div
        className="py-8 px-8 rounded-lg flex flex-col bg-white"
        style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
      >
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold pb-4 grow default-font">
            {t("Claim List")}
          </p>
          <div className="flex">
            <Input.Search
              placeholder={t("search")}
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
          </div>
        </div>

        <Tabs activeKey={activeTabKey} items={items} onChange={onChangeTab} className="redeem-tab" destroyInactiveTabPane />

      </div>
    </div>
  );
}
