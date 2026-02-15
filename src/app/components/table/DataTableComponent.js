'use client';

import { useEffect } from 'react';
import './DataTableComponent.css';

export default function DataTableComponent({ data }) {
  // Initialize DataTables when data is available
  useEffect(() => {
    if (data && data.query_type === "standard" && data.data && data.data.length > 0) {
      const initDataTable = () => {
        try {
          // Use globally loaded jQuery and DataTables from CDN
          const $ = window.$;
          if (!$ || !$.fn.DataTable) {
            console.error('jQuery or DataTables not loaded from CDN');
            return;
          }
          
          // Wait for DOM to be ready
          setTimeout(() => {
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#dataTable')) {
              $('#dataTable').DataTable().destroy();
              $('#dataTable').empty();
            }
            
            // Get column names from data
            const columns = Object.keys(data.data[0]).map(key => ({
              title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              data: key,
              className: 'text-center',
              render: function(data, type, row) {
                // Handle different data types
                if (data === null || data === undefined) {
                  return '<span class="text-muted">-</span>';
                }
                if (typeof data === 'string' && data.length > 50) {
                  return `<span title="${data}" class="text-truncate d-inline-block" style="max-width: 200px;">${data}</span>`;
                }
                return data;
              }
            }));
            
            // Initialize DataTable with enhanced features
            $('#dataTable').DataTable({
              data: data.data,
              columns: columns,
              responsive: true,
              processing: true,
              pageLength: 25,
              lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
              }
            });
          }, 100);
        } catch (error) {
          console.error('Error initializing DataTable:', error);
        }
      };
      
      initDataTable();
    }
    
    return () => {
      // Cleanup
      try {
        const $ = window.$;
        if ($ && $.fn.DataTable && $.fn.DataTable.isDataTable('#dataTable')) {
          $('#dataTable').DataTable().destroy();
        }
      } catch (e) {
        // Silent cleanup
      }
    };
  }, [data]);

  return (
    <div className='datatable-container mt-5 px-4'>
      <div className='table-responsive'>
        <table id='dataTable' className='table table-striped table-hover table-bordered'></table>
      </div>
    </div>
  );
}