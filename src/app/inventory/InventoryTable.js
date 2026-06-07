"use client";

import DataTableComponent from "../components/table/DataTableComponent";

export default function InventoryTable({ data }) {
  const columns = [
    { key: "sku", label: "SKU", width: "w-28" },
    { key: "product_name", label: "Product", width: "w-48" },
    { key: "category", label: "Category", width: "w-28" },
    { key: "brand", label: "Brand", width: "w-24" },
    { key: "location", label: "Location", width: "w-28" },
    { key: "available_qty", label: "Available", width: "w-20", numeric: true },
    { key: "reserved_picked", label: "Reserved", width: "w-20", numeric: true },
    {
      key: "damaged",
      label: "Damaged",
      width: "w-20",
      numeric: true,
      danger: true,
    },
    {
      key: "total_lost",
      label: "Lost",
      width: "w-20",
      numeric: true,
      danger: true,
    },
    { key: "qc_passed", label: "QC Pass", width: "w-16", numeric: true },
    {
      key: "qc_failed",
      label: "QC Fail",
      width: "w-16",
      numeric: true,
      danger: true,
    },
    {
      key: "marketplace_available",
      label: "Market",
      width: "w-20",
      numeric: true,
    },
    { key: "website_inventory", label: "Web", width: "w-16", numeric: true },
  ];

  const columnKeys = columns.map((c) => c.key);

  const summarized_query = `${data?.data?.length || 0} SKUs`;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <DataTableComponent
        data={data}
        title="INVENTORY"
        summarized_query={summarized_query}
        columnKeys={columnKeys}
        showOrderModal={false}
      />
    </div>
  );
}
