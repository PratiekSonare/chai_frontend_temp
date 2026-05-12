import { useState, useCallback } from "react";

export const useFilterState = () => {
  const [selectedMarketplaces, setSelectedMarketplaces] = useState([]);
  const [selectedCouriers, setSelectedCouriers] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectedBillingStates, setSelectedBillingStates] = useState([]);
  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [courierSearch, setCourierSearch] = useState("");
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [billingStateSearch, setBillingStateSearch] = useState("");

  const toggleSelection = useCallback((value, setter) => {
    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  }, []);

  const resetSelections = useCallback((setter) => {
    setter([]);
  }, []);

  return {
    selectedMarketplaces,
    setSelectedMarketplaces,
    selectedCouriers,
    setSelectedCouriers,
    selectedWarehouses,
    setSelectedWarehouses,
    selectedBillingStates,
    setSelectedBillingStates,
    marketplaceSearch,
    setMarketplaceSearch,
    courierSearch,
    setCourierSearch,
    warehouseSearch,
    setWarehouseSearch,
    billingStateSearch,
    setBillingStateSearch,
    toggleSelection,
    resetSelections,
  };
};

export const useBuildFilters = (
  selectedMarketplaces,
  selectedCouriers,
  selectedWarehouses,
  selectedBillingStates,
  billingStateKey
) => {
  return useCallback(() => {
    const filters = {
      order_type: "B2B",
    };
    if (selectedMarketplaces.length > 0) {
      filters.marketplace = selectedMarketplaces;
    }
    if (selectedCouriers.length > 0) {
      filters.courier = selectedCouriers;
    }
    if (selectedWarehouses.length > 0) {
      filters.import_warehouse_name = selectedWarehouses;
    }
    if (selectedBillingStates.length > 0) {
      filters[billingStateKey || "state"] = selectedBillingStates;
    }
    return filters;
  }, [
    selectedMarketplaces,
    selectedCouriers,
    selectedWarehouses,
    selectedBillingStates,
    billingStateKey,
  ]);
};
