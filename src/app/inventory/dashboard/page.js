"use client";

import InventoryLayout from "../InventoryLayout";
import InventoryDashboard from "../InventoryDashboard";

export default function DashboardPage() {
  return (
    <InventoryLayout
      title="Inventory Dashboard"
      subtitle="Key metrics, visual analytics, and inventory insights."
    >
      {({ snapshotData, dateRange }) =>
        snapshotData ? <InventoryDashboard data={snapshotData} dateRange={dateRange} /> : null
      }
    </InventoryLayout>
  );
}
