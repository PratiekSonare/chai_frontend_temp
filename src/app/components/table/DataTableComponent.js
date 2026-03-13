'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import OrderDataCard from '../OrderDataCard';
import './DataTableComponent.css';

export default function DataTableComponent({ data, summarized_query }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('Details');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);

  // Refs for cleanup
  const timeoutRef = useRef(null);
  const tableInstanceRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Create stable reference for data to prevent unnecessary re-initializations
  const memoizedData = useMemo(() => data, [
    data?.query_type,
    data?.data?.length,
    JSON.stringify(data?.data)
  ]);

  // Initialize DataTables when data is available
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (memoizedData && memoizedData.query_type === "standard" && memoizedData.data && memoizedData.data.length > 0) {
      // Check if DataTable is already initialized with the same data
      if (isInitializedRef.current && tableInstanceRef.current) {
        console.log('DataTable already initialized, skipping...');
        return;
      }

      console.log('Initializing DataTable component...');

      const initDataTable = () => {
        try {
          // Use globally loaded jQuery and DataTables from CDN
          const $ = window.$;
          if (!$ || !$.fn.DataTable) {
            console.error('jQuery or DataTables not loaded from CDN');
            return;
          }

          // Store timeout reference for cleanup
          timeoutRef.current = setTimeout(() => {
            // Destroy existing DataTable if it exists
            if (tableInstanceRef.current) {
              try {
                tableInstanceRef.current.destroy();
                tableInstanceRef.current = null;
              } catch (e) {
                console.warn('Error destroying existing DataTable:', e);
              }
            }

            if ($.fn.DataTable.isDataTable('#dataTable')) {
              $('#dataTable').DataTable().destroy();
            }
            $('#dataTable').empty();

            // Get column names from data with orthogonal data support
            const columns = Object.keys(memoizedData.data[0]).map((key, index) => {

              return {
                title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                data: key,
                className: 'text-center',
                targets: index,
                render: {
                  // display: render for display
                  _: function (cellData, type, row) {
                    // For nested data, create a clickable element with data attribute
                    if (typeof cellData === 'object' && cellData !== null) {
                      const encodedData = btoa(JSON.stringify(cellData));
                      const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      if (Array.isArray(cellData)) {
                        const count = cellData.length;
                        if (count === 0) {
                          return '<span class="badge bg-secondary">Empty Array</span>';
                        }
                        return `<span class="badge bg-info cursor-pointer nested-data-btn" data-encoded="${encodedData}" data-title="${title}" style="cursor: pointer;">Array (${count})</span>`;
                      } else {
                        const keys = Object.keys(cellData);
                        return `<span class="badge bg-primary cursor-pointer nested-data-btn" data-encoded="${encodedData}" data-title="${title}" style="cursor: pointer;">Object (${keys.length})</span>`;
                      }
                    }
                    return renderCellData(cellData);
                  },
                  // sort: render data for sorting
                  sort: function (data, type, row) {
                    if (typeof data === 'object') {
                      return JSON.stringify(data);
                    }
                    return data || '';
                  },
                  // filter: render data for filtering
                  filter: function (data, type, row) {
                    if (typeof data === 'object') {
                      return JSON.stringify(data);
                    }
                    return data || '';
                  }
                }
              };
            });

            // Initialize DataTable with enhanced features
            const table = $('#dataTable').DataTable({
              data: memoizedData.data,
              columns: columns,
              responsive: true,
              processing: true,
              pageLength: 5,
              lengthMenu: [[5, 10, -1], [5, 10]],
              order: [[0, 'asc']],
              searching: true,
              paging: true,
              info: true,
              autoWidth: false,
              scrollX: true,
              language: {
                search: "_INPUT_",
                searchPlaceholder: "Search records...",
                lengthMenu: "Show _MENU_ entries per page",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                infoFiltered: "(filtered from _MAX_ total entries)",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous"
                }
              },

              initComplete: function () {
                console.log('DataTable initialized successfully');
                isInitializedRef.current = true;

                // Remove any existing handlers to prevent duplicates
                $(document).off('click.datatable');

                // Add click handler for nested data buttons with namespace
                $(document).on('click.datatable', '.nested-data-btn', function (e) {
                  e.preventDefault();
                  const encodedData = $(this).data('encoded');
                  const title = $(this).data('title');
                  const decodedData = JSON.parse(atob(encodedData));
                  handleOpenModal(decodedData, title);
                });

                // Add click handler for table rows to select order with namespace
                $(document).on('click.datatable', 'tbody tr', function (e) {
                  const rowData = table.row(this).data();
                  setSelectedOrder(rowData);
                  setClickPosition({
                    x: e.clientX,
                    y: e.clientY
                  });
                });
              }
            });

            // Store table instance for cleanup
            tableInstanceRef.current = table;
            window.dataTableInstance = table;
            timeoutRef.current = null; // Clear timeout reference as it's completed

          }, 100);
        } catch (error) {
          console.error('Error initializing DataTable:', error);
          timeoutRef.current = null;
        }
      };

      initDataTable();
    } else {
      console.log('Skipping DataTable initialization - invalid data or not standard query type');
    }

    return () => {
      // Clear timeout if component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Cleanup DataTable
      try {
        if (tableInstanceRef.current) {
          tableInstanceRef.current.destroy();
          tableInstanceRef.current = null;
        }

        const $ = window.$;
        if ($ && $.fn.DataTable && $.fn.DataTable.isDataTable('#dataTable')) {
          $('#dataTable').DataTable().destroy();
        }

        // Remove event handlers with namespace
        if ($) {
          $(document).off('click.datatable');
        }

        isInitializedRef.current = false;
      } catch (e) {
        console.warn('Error during cleanup:', e);
      }
    };
  }, [memoizedData]); // Use memoized data instead of data

  // Function to render cell data
  const renderCellData = (data) => {
    if (data === null || data === undefined) {
      return '<span class="text-muted">-</span>';
    }

    // Handle objects and arrays
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        // For arrays
        const count = data.length;
        if (count === 0) {
          return '<span class="badge bg-secondary">Empty Array</span>';
        }
        return `<span class="badge bg-info cursor-pointer" style="cursor: pointer;">Array (${count})</span>`;
      } else {
        // For objects
        const keys = Object.keys(data);
        return `<span class="badge bg-primary cursor-pointer" style="cursor: pointer;">Object (${keys.length})</span>`;
      }
    }

    // Handle long strings
    if (typeof data === 'string' && data.length > 50) {
      return `<span title="${data}" class="text-truncate d-inline-block" style="max-width: 200px;">${data}</span>`;
    }

    return data;
  };

  const handleOpenModal = (nestedData, title) => {
    setModalData(nestedData);
    setModalTitle(title);
    setShowModal(true);
  };

  return (
    <>
      <div className='datatable-container'>
        <div className='flex justify-between w-full'>
          <span className="text-md! py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">DATA TABLE</span>
          {/* {summarized_query.length > 0 && (<span className="text-xs py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">{summarized_query}</span>)} */}
          <span className="text-md! font-stretch-200%% py-1 px-4 bg-[#001FB0] text-white rounded-t-xl oswald text-center">{summarized_query}</span>
        </div>
        <div className='table-responsive text-xs! poppins'>
          <table id='dataTable' className='table table-striped table-hover table-bordered'></table>
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

      {/* Modal for nested data */}
      {showModal && (
        <div className='modal d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>{modalTitle}</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body' style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <pre style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {JSON.stringify(modalData, null, 2)}
                </pre>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(modalData, null, 2));
                    alert('Copied to clipboard!');
                  }}
                >
                  Copy JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}