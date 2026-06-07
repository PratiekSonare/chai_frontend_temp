"use client";

import InventoryLayout from "../InventoryLayout";
import InventoryForecast from "../InventoryForecast";

export default function ForecastPage() {
  return (
    <InventoryLayout
      title="Inventory Forecast"
      subtitle="AI-powered inventory demand forecasting and predictions."
    >
      {({ snapshotData }) => <InventoryForecast snapshotData={snapshotData} />}
    </InventoryLayout>
  );
}
