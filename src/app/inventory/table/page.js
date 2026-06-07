"use client";

import InventoryLayout from "../InventoryLayout";
import InventoryTable from "../InventoryTable";

export default function TablePage() {
  return (
    <InventoryLayout
      title="Inventory Data Table"
      subtitle="Detailed SKU-level inventory data and metrics."
    >
      {({ snapshotData }) =>
        snapshotData ? <InventoryTable data={snapshotData} /> : null
      }
    </InventoryLayout>
  );
}
