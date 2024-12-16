"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toastError } from "@lib-utils/helper";
import { Skeleton } from "antd";

// Register required Chart.js components
ChartJS.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip
);

interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  amount: number;
  price: number;
  discount: number;
  discountPrice: number;
}

interface Invoice {
  id: number;
  userId: number;
  documentNo: string;
  date: string;
  totalAmount: number;
  totalPrice: number;
  subTotal: number;
  groupDiscount: number;
  externalDocument: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

interface FilterItem {
  id: number | string;
  name: string;
}

interface SelectedFilter {
  type: string;
  selected: FilterItem[];
}

interface ChartProps {
  selectedFilters: SelectedFilter[];
  userId: string;
}

const MixedBarLineChart: React.FC<ChartProps> = ({
  selectedFilters,
  userId,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartData<"bar" | "line">>({
    labels: [],
    datasets: [],
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (selectedFilters) {
        setLoading(true);
        try {
          const currentYear = new Date().getFullYear();
          const allMonths = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]

          // Get selected months and years from filters
          const monthFilters =
            selectedFilters.find((filter) => filter.type === "month")
              ?.selected || [];
          const yearFilters =
            selectedFilters.find((filter) => filter.type === "year")
              ?.selected || [];

          let selectedMonths = monthFilters.map((item) => Number(item.id));
          let selectedYears = yearFilters.map((item) => Number(item.id));

          // If no months are selected, use all months
          if (selectedMonths.length === 0) {
            selectedMonths = allMonths;
          }

          // If no year is selected, use the current year
          if (selectedYears.length === 0) {
            selectedYears = [currentYear];
          }

          const { data } = await axios.post<{ invoices: Invoice[] }>(
            "/api/getFilteredInvoices",
            {
              userId,
              filters: selectedFilters,
            }
          );

          // Process invoices data
          const invoices = data.invoices;
          setInvoices(data.invoices);
          // Create an object to group total prices by month
          const groupedData: Record<number, number> = {};
          invoices.forEach((invoice) => {
            const invoiceDate = new Date(invoice.date);
            const invoiceMonth = invoiceDate.getMonth() + 1; // Get month (0-based, so +1)
            const invoiceYear = invoiceDate.getFullYear(); // Get year

            if (selectedYears.includes(invoiceYear)) {
              if (!groupedData[invoiceMonth]) {
                groupedData[invoiceMonth] = 0;
              }
              groupedData[invoiceMonth] += invoice.totalPrice;
            }
          });

          // Prepare labels and datasets based on the selected months
          const labels = selectedMonths.map((month) => {
            const date = new Date(0, month - 1); // Map month number to name
            return date.toLocaleString("default", { month: "long" }); // Month name (January, February, etc.)
          });

          // Prepare datasets for bar and line charts
          const barData = selectedMonths.map(
            (month) => groupedData[month] || 0
          ); // Data for bar chart
          const lineData = [...barData]; // Data for line chart (same in this case)

          setChartData({
            labels: labels,
            datasets: [
              {
                type: "bar", // Specify the type explicitly
                label: "Total Sales (Bar)",
                data: barData,
                backgroundColor: "#E8727A",
                borderColor: "#E8727A",
                stack: "combined",
              },
              {
                type: "line", // Specify the type explicitly
                label: "Total Sales (Line)",
                data: lineData,
                borderColor: "#6AD5AC",
                borderWidth: 2,
                stack: "combined",
              },
            ],
          });
        } catch (error: any) {
          toastError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInvoices();
  }, [selectedFilters, userId]);

  // Calculate totals
  const totalPurchase = invoices.reduce(
    (sum, invoice) => sum + invoice.totalPrice,
    0
  );
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );
  const totalDiscount = invoices.reduce(
    (sum, invoice) => sum + (invoice.subTotal - invoice.totalPrice),
    0
  );
  const totalBillCount = invoices.length;

  // Chart options
  const options: ChartOptions<"bar" | "line"> = {
    plugins: {
      title: {
        display: true,
        text: "Sales Chart (Bar and Line)",
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        stacked: true,
      },
    },
  };

  return (
    <>
      {loading ? (
        <><Skeleton active /><Skeleton active /><Skeleton active /></>
      ) : (
        <div className="grid grid-rows-4 grid-flow-col gap-4">
          <div
            className="row-span-1 mt-4 p-4 rounded-lg bg-white place-content-center"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid">
              <p className="text-comp-natural-base default-font text-lg self-center">
                {t("all total purchase")}
              </p>
              <p className="default-font text-3xl font-semibold py-4 text-[#41b264] text-end">
                ฿{totalPurchase.toLocaleString()}
              </p>
            </div>
          </div>
          <div
            className="row-span-1 mt-4 p-4 rounded-lg bg-white place-content-center"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid">
              <p className="text-comp-natural-base default-font text-lg self-center">
                {t("all total amount")}
              </p>
              <p className="default-font text-3xl font-semibold py-4 text-[#4C4C4C] text-end">
                {totalAmount} {t("items")}
              </p>
            </div>
          </div>
          {/* <div
            className="row-span-1 mt-4 p-4 rounded-lg bg-white place-content-center"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid">
              <p className="text-comp-natural-base default-font text-lg self-center">
                {t("all total discount")}
              </p>
              <p className="default-font text-3xl font-semibold py-4 text-[#4C4C4C] text-end">
                ฿{totalDiscount.toLocaleString()}
              </p>
            </div>
          </div> */}
          <div
            className="row-span-1 mt-4 p-4 rounded-lg bg-white place-content-center"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid">
              <p className="text-comp-natural-base default-font text-lg self-center">
                {t("all total bill")}
              </p>
              <p className="default-font text-3xl font-semibold py-4 text-[#4C4C4C] text-end">
                {totalBillCount} {t("items")}
              </p>
            </div>
          </div>

          <div
            className="row-span-1 mt-4 p-4 rounded-lg bg-white place-content-center"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <div className="grid">
              <p className="text-comp-natural-base default-font text-lg self-center">
                {t("Growth rate")}
              </p>
              <p className="default-font text-3xl font-semibold pt-8 pb-4 text-[#41b264] text-center">
                {+ 0} %
              </p>
              <p className="default-font text-comp-natural-base text-[#4C4C4C] text-end">
                {t("Latest year")}
              </p>
            </div>
          </div>
          <div
            className="row-span-4 col-span-2 mt-4 p-6 rounded-lg bg-white"
            style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
          >
            <Chart type="bar" data={chartData} options={options} className="w-full"/>
          </div>
        </div>
      )}
    </>
  );
};

export default MixedBarLineChart;
