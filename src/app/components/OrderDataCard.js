'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import './OrderDataCard.css';

export default function OrderDataCard({ orderData, position, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({
    x: position?.x || Math.max(window.innerWidth / 2 - 260, 20),
    y: position?.y || 100,
  });
  const [showPositionWidget, setShowPositionWidget] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (position) {
      setModalPosition({
        x: Math.min(position.x, window.innerWidth - 480),
        y: Math.min(position.y, window.innerHeight - 400),
      });
    }
  }, [position]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.close-btn') || e.target.closest('.card-content')) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Boundary detection
      newX = Math.max(0, Math.min(newX, window.innerWidth - 520));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 100));

      setModalPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  if (!orderData) {
    return null;
  }

  // Helper function to format object as key-value pairs
  const renderObjectDetails = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return <p className="text-sm text-gray-600">-</p>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex justify-between items-start py-1 border-b border-gray-200">
            <span className="font-medium text-gray-700 capitalize">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-sm text-gray-600 text-right max-w-md break-words">
              {value === null || value === undefined ? '-' : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render array items
  const renderArrayItems = (arr, title) => {
    if (!Array.isArray(arr) || arr.length === 0) {
      return <p className="text-sm text-gray-500 italic">No {title.toLowerCase()} available</p>;
    }

    return (
      <div className="space-y-4">
        {arr.map((item, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
            {typeof item === 'object' ? renderObjectDetails(item) : <p className="text-sm">{String(item)}</p>}
          </div>
        ))}
      </div>
    );
  };

  // Organize data into categories
  const categories = {
    'Order Details': {
      order_id: orderData.order_id,
      order_date: orderData.order_date,
      order_status: orderData.order_status,
      order_priority: orderData.order_priority,
      order_quantity: orderData.order_quantity,
      marketplace: orderData.marketplace,
      reference_code: orderData.reference_code,
      tat: orderData.tat,
    },
    'Package Information': {
      'Package Length': orderData['Package Length'],
      'Package Width': orderData['Package Width'],
      'Package Height': orderData['Package Height'],
      'Package Weight': orderData['Package Weight'],
      packing_material: orderData.packing_material,
    },
    'Delivery Address': {
      city: orderData.city,
      state: orderData.state,
      pin_code: orderData.pin_code,
      country: orderData.country,
      latitude: orderData.latitude,
      longitude: orderData.longitude,
    },
    'Billing Address': {
      billing_city: orderData.billing_city,
      billing_state: orderData.billing_state,
      billing_pin_code: orderData.billing_pin_code,
      billing_country: orderData.billing_country,
    },
    'Shipping Information': {
      courier: orderData.courier,
      awb_number: orderData.awb_number,
      shipping_status: orderData.shipping_status,
      shipping_last_update_date: orderData.shipping_last_update_date,
      manifest_date: orderData.manifest_date,
      manifest_no: orderData.manifest_no,
      delivery_date: orderData.delivery_date,
    },
    'Payment Information': {
      payment_mode: orderData.payment_mode,
      total_amount: orderData.total_amount,
      total_discount: orderData.total_discount,
      total_tax: orderData.total_tax,
      total_shipping_charge: orderData.total_shipping_charge,
      collectable_amount: orderData.collectable_amount,
      tcs_amount: orderData.tcs_amount,
      tcs_rate: orderData.tcs_rate,
    },
    'Warehouse & Inventory': {
      warehouseId: orderData.warehouseId,
      import_warehouse_id: orderData.import_warehouse_id,
      import_warehouse_name: orderData.import_warehouse_name,
      company_name: orderData.company_name,
      fulfillable_status: orderData.fulfillable_status,
      qcPassed: orderData.qcPassed,
      blockSplit: orderData.blockSplit,
    },
    'Seller & Buyer Information': {
      seller_gst: orderData.seller_gst,
      buyer_gst: orderData.buyer_gst,
      customer_code: orderData.customer_code,
      marketplace_id: orderData.marketplace_id,
      marketplace_invoice_num: orderData.marketplace_invoice_num,
      invoice_id: orderData.invoice_id,
      invoice_number: orderData.invoice_number,
    },
    'Additional Details': {
      carrier_id: orderData.carrier_id,
      batch_id: orderData.batch_id,
      batch_created_at: orderData.batch_created_at,
      last_update_date: orderData.last_update_date,
      import_date: orderData.import_date,
      replacement_order: orderData.replacement_order,
      available_after: orderData.available_after,
    },
  };

  return (
    <div
      className={`order-card-modal ${isClosing ? 'closing' : 'opening'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="modal-backdrop"></div>

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`order-card modal-card ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'fixed',
          top: `${modalPosition.y}px`,
          left: `${modalPosition.x}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="card-header flex items-center justify-between cursor-grab active:cursor-grabbing">
          <div className="flex-1">
            <h2 className="card-title text-lg">Order #{orderData.order_id}</h2>
            <p className="card-subtitle text-xs">{orderData.marketplace} • {orderData.company_name}</p>
            <div className={`status-badge status-${orderData.order_status_id}`}>
              {orderData.order_status}
            </div>
          </div>

          {/* Position Widget Toggle */}
          <button
            onClick={() => setShowPositionWidget(!showPositionWidget)}
            className="position-btn"
            title="Adjust position"
            aria-label="Adjust position"
          >
            ⊕
          </button>

          <button
            onClick={handleClose}
            className="close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Position Control Widget */}


        {/* Accordion with Categories */}
        <div className="card-content max-h-96 overflow-y-scroll">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
          >
            {/* Suborders Section */}
            {orderData.suborders && orderData.suborders.length > 0 && (
              <AccordionItem value="suborders" className="border-b border-gray-200">
                <AccordionTrigger className="hover:bg-gray-50 py-2 px-3">
                  <span className="font-semibold text-gray-800 text-sm">
                    Suborders ({orderData.suborders.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 text-xs">
                  {renderArrayItems(orderData.suborders, 'Suborders')}
                </AccordionContent>
              </AccordionItem>
            )}

            {Object.entries(categories).map(([categoryName, categoryData], idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-gray-200">
                <AccordionTrigger className="hover:bg-gray-50 py-2 px-3">
                  <span className="font-semibold text-gray-800 text-sm">{categoryName}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 text-xs">
                  {renderObjectDetails(categoryData)}
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Documents Section */}
            {orderData.documents && (
              <AccordionItem value="documents" className="border-b border-gray-200">
                <AccordionTrigger className="hover:bg-gray-50 py-2 px-3">
                  <span className="font-semibold text-gray-800 text-sm">Documents</span>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 text-xs">
                  {renderObjectDetails(orderData.documents)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Footer with Quick Stats */}
        <div className="card-footer">
          <div className="flex justify-around text-center gap-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase">Total</p>
              <p className="text-sm font-semibold text-gray-800">₹{orderData.total_amount}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase">Items</p>
              <p className="text-sm font-semibold text-gray-800">{orderData.order_quantity}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase">AWB</p>
              <p className="text-xs font-semibold text-gray-800 truncate">{orderData.awb_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
