'use client';

// ====================================================
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import OrderDataCard from '../OrderDataCard';
import './DataTableComponent.css';
import { DataGrid } from "react-data-grid";

export default function DataTableComponent({ data, summarized_query }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('Details');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortColumns, setSortColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Convert dictionary-format data to array format
  // Handles both: array of objects AND dictionary format (column -> row_index -> value)
  const memoizedData = useMemo(() => {
    if (!data) return { data: [] };
    
    // If data.data is already an array, return as-is
    if (Array.isArray(data.data)) {
      return data;
    }
    
    // If data.data is an object (dictionary format from vendor cost sheet)
    if (typeof data.data === 'object' && !Array.isArray(data.data)) {
      // Convert {col1: {0: val, 1: val}, col2: {0: val, 1: val}} to [{col1: val, col2: val}, ...]
      const columnData = data.data;
      const columns = Object.keys(columnData);
      
      if (columns.length === 0) return { ...data, data: [] };
      
      // Get number of rows from first column
      const rowCount = Object.keys(columnData[columns[0]]).length;
      const rows = [];
      
      for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const row = {};
        columns.forEach(col => {
          row[col] = columnData[col][rowIdx];
        });
        rows.push(row);
      }
      
      return { ...data, data: rows };
    }
    
    return data;
  }, [data]);

  // ---------- CELL RENDER ----------
  const renderCellData = (data) => {
    if (data === null || data === undefined) return "-";

    if (typeof data === "object") {
      if (Array.isArray(data)) {
        return `Array (${data.length})`;
      }
      return `Object (${Object.keys(data).length})`;
    }

    if (typeof data === "string" && data.length > 50) {
      return data.slice(0, 50) + "...";
    }

    return data;
  };

  // ---------- COLUMNS ----------
  const renderHeaderCell = useCallback(
    // eslint-disable-next-line react/display-name
    (key) => ({ column }) => {
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className='poppins uppercase'>{column.name}</span>
          <input
            type="text"
            value={filters[key] || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                [key]: e.target.value
              }))
            }
            placeholder="Search..."
            className='poppins rounded-sm my-1'
            style={{
              width: "100%",
              fontSize: "10px",
              padding: "2px",
              outline: "1px solid #B2BEB5"
            }}
          />
        </div>
      );
    },
    [filters]
  );

  const columns = useMemo(() => {
    if (!memoizedData?.data?.length) return [];

    return Object.keys(memoizedData.data[0]).map((key) => ({
      key,
      name: key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),

      resizable: true,
      sortable: true,

      renderHeaderCell: renderHeaderCell(key),

      renderCell: ({ row }) => {
        const value = row[key];

        if (typeof value === "object" && value !== null) {
          return (
            <span
              className="px-2 py-1 bg-blue-100 rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(value, key);
              }}
            >
              {Array.isArray(value)
                ? `Array (${value.length})`
                : `Object (${Object.keys(value).length})`}
            </span>
          );
        }

        return value?.toString?.() || "-";
      }
    }));
  }, [memoizedData, renderHeaderCell]);

  // ---------- ROWS ----------
  const rows = useMemo(() => {
    if (!memoizedData?.data) return [];
    return memoizedData.data.map((row, idx) => ({
      id: idx,
      ...row
    }));
  }, [memoizedData]);

  // ----------- FILTERING ----------
  const filteredRows = useMemo(() => {
    if (!memoizedData?.data) return [];

    return memoizedData.data
      .map((row, idx) => ({ id: idx, ...row }))
      .filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          const cell = row[key];
          if (cell === null || cell === undefined) return false;

          // 🔥 HANDLE OBJECTS PROPERLY
          let cellString =
            typeof cell === "object"
              ? JSON.stringify(cell)
              : cell.toString();

          return cellString
            .toLowerCase()
            .includes(value.toLowerCase());
        });
      });
  }, [memoizedData, filters]);

  // ----------- SORTING ----------
  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      for (const sort of sortColumns) {
        const aValue = a[sort.columnKey];
        const bValue = b[sort.columnKey];

        if (aValue > bValue) {
          return sort.direction === "ASC" ? 1 : -1;
        }
        if (aValue < bValue) {
          return sort.direction === "ASC" ? -1 : 1;
        }
      }
      return 0;
    });
  }, [filteredRows, sortColumns]);

  // ----------- PAGINATION ----------
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);

  // ---------- RENDER ----------
  if (!memoizedData?.data?.length) {
    return <div>No data available</div>;
  }

  const handleOpenModal = (nestedData, title) => {
    setModalData(nestedData);
    setModalTitle(title);
    setShowModal(true);
    setSelectedOrder(nestedData);
  };

  return (
    <>
      <div className=''>
        <div className='flex justify-between w-full'>
          <span className="text-md! py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">DATA TABLE</span>
          {/* {summarized_query.length > 0 && (<span className="text-xs py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">{summarized_query}</span>)} */}
          <span className="text-md! font-stretch-200%% py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">{summarized_query}</span>
        </div>
        <DataGrid
          columns={columns}
          rows={paginatedRows}
          headerRowHeight={70}
          className="rdg-light w-full rounded-lg shadow-sm"
          style={{ height: 'calc(66.66vh - 40px)' }}
          defaultColumnOptions={{
            sortable: true,
            resizable: true
          }}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          onCellClick={(args) => {
            // args: { row, column, rowIdx }
            handleOpenModal(args.row, "Order Details");
          }}
        />
        <div className="pagination-controls flex items-center justify-between p-2 bg-gray-100 rounded-b-lg border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reset to first page on page size change
              }}
              className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDataCard
          orderData={selectedOrder}
          position={clickPosition}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}