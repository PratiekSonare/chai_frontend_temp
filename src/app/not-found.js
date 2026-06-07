"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Search,
  ShoppingCart,
  RotateCcw,
  Package,
  Boxes,
  ShieldAlert,
} from "lucide-react";

const sections = [
  {
    label: "Data Search",
    href: "/",
    icon: Search,
    desc: "AI-powered data search across all sources.",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    desc: "Order metrics, fetch orders & forecast.",
  },
  {
    label: "RTO",
    href: "/rto",
    icon: RotateCcw,
    desc: "Return & cancellation trends.",
  },
  {
    label: "Catalogue",
    href: "/catalogue",
    icon: Package,
    desc: "Explore SKUs & sales performance.",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Boxes,
    desc: "Stock health, forecasts & insights.",
  },
  {
    label: "Risk",
    href: "/risk",
    icon: ShieldAlert,
    desc: "Order risk estimation & scoring.",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-red-50 rounded-full border border-red-100">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-[#001FB0] mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#001FB0] hover:shadow-md transition-all duration-200"
              >
                <Icon className="w-6 h-6 text-[#001FB0] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#001FB0]">
                  {section.label}
                </span>
                <span className="text-xs text-gray-400 leading-tight">
                  {section.desc}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#001FB0] text-white text-sm font-semibold rounded-xl hover:bg-[#0018a0] transition-colors duration-200 shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-[#001FB0] hover:text-[#001FB0] transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
