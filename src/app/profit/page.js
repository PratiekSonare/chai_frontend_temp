"use client";

import { DataGrid, renderTextEditor } from "react-data-grid";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import QueryDetails from '../components/QueryDetails';

const SCHEMA_COLUMNS = [
    "Style Name",
    "Collection Name",
    "MRP",
    "Gender",
    "BRAND",
    "FACTORY",
    "PRICE",
    "PRICE_1",
    "PRICE_2",
    "PRICE_3",
    "PRICE_4",
    "PRICE_5",
    "PRICE_6",
    "Final price"
];


export default function Profit() {
    const [rowsVCS, setRowsVCS] = useState([]);
    const [rowsPC, setRowsPC] = useState([]);
    const [originalRowsVCS, setOriginalRowsVCS] = useState([]);
    const [originalRowsPC, setOriginalRowsPC] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveErrorVCS, setSaveErrorVCS] = useState(null);
    const [saveErrorPC, setSaveErrorPC] = useState(null);
    const [isSavingVCS, setIsSavingVCS] = useState(false);
    const [isSavingPC, setIsSavingPC] = useState(false);
    const [pendingEditsVCS, setPendingEditsVCS] = useState({});
    const [pendingEditsPC, setPendingEditsPC] = useState({});
    const [sidebarHovered, setSidebarHovered] = useState(false);

    const handleRefreshComponents = useCallback(() => {
        void fetchTables();
    }, []);

    async function fetchTables() {
        setLoading(true);
        setError(null);

        const [vcsResult, pcResult] = await Promise.all([
            supabase.from("vendor_cost_sheet").select("*"),
            supabase.from("payment-cycle-and-cash-discount").select("*")
        ]);

        if (vcsResult.error || pcResult.error) {
            const message = [vcsResult.error?.message, pcResult.error?.message]
                .filter(Boolean)
                .join(" | ");
            setError(message || "Failed to fetch tables");
            setLoading(false);
            return;
        }

        const nextVcsRows = Array.isArray(vcsResult.data) ? vcsResult.data : [];
        const nextPcRows = Array.isArray(pcResult.data) ? pcResult.data : [];

        setRowsVCS(nextVcsRows);
        setRowsPC(nextPcRows);
        setOriginalRowsVCS(nextVcsRows);
        setOriginalRowsPC(nextPcRows);
        setPendingEditsVCS({});
        setPendingEditsPC({});
        setSaveErrorVCS(null);
        setSaveErrorPC(null);
        setLoading(false);
    }

    useEffect(() => {
        const load = async () => {
            await fetchTables();
        };
        load();
    }, []);

    const columnsVCS = useMemo(() => {
        const keys = rowsVCS.length > 0 ? Object.keys(rowsVCS[0]) : SCHEMA_COLUMNS;

        return keys.map((key) => ({
            key,
            name: key,
            editable: key !== "Style Name",
            resizable: true,
            sortable: true,
            renderEditCell: key !== "Style Name" ? renderTextEditor : undefined
        }));
    }, [rowsVCS]);

    const columnsPC = useMemo(() => {
        const keys = rowsPC.length > 0 ? Object.keys(rowsPC[0]) : ["NO."];

        return keys.map((key) => ({
            key,
            name: key,
            editable: key !== "NO.",
            resizable: true,
            renderEditCell: key !== "NO." ? renderTextEditor : undefined
        }));
    }, [rowsPC]);

    function validateCell(columnKey, value) {
        if (columnKey.includes("PRICE") || columnKey === "MRP") {
            return Number(value) >= 0;
        }
        return true;
    }

    function applyPendingEdits({
        updatedRows,
        changeMeta,
        originalRows,
        setPendingEdits,
        primaryKey
    }) {
        const changedIndexes = Array.isArray(changeMeta?.indexes)
            ? changeMeta.indexes
            : [];
        const changedColumn = changeMeta?.column?.key;

        if (changedIndexes.length === 0 || !changedColumn) {
            return;
        }

        setPendingEdits((prev) => {
            const next = { ...prev };

            for (const rowIndex of changedIndexes) {
                const baselineRow = originalRows[rowIndex];
                const editedRow = updatedRows[rowIndex];

                if (!baselineRow || !editedRow) {
                    continue;
                }

                const rowId = baselineRow[primaryKey];
                if (!rowId) {
                    continue;
                }

                const baselineValue = baselineRow[changedColumn];
                const editedValue = editedRow[changedColumn];
                const currentRowPatch = { ...(next[rowId] || {}) };

                if (!validateCell(changedColumn, editedValue)) {
                    return prev;
                }

                if (editedValue === baselineValue) {
                    delete currentRowPatch[changedColumn];
                } else {
                    currentRowPatch[changedColumn] = editedValue;
                }

                if (Object.keys(currentRowPatch).length === 0) {
                    delete next[rowId];
                } else {
                    next[rowId] = currentRowPatch;
                }
            }

            return next;
        });
    }

    function handleRowsChangeVCS(updatedRows, changeMeta) {
        setSaveErrorVCS(null);
        setRowsVCS(updatedRows);
        applyPendingEdits({
            updatedRows,
            changeMeta,
            originalRows: originalRowsVCS,
            setPendingEdits: setPendingEditsVCS,
            primaryKey: "Style Name"
        });
    }

    function handleRowsChangePC(updatedRows, changeMeta) {
        setSaveErrorPC(null);
        setRowsPC(updatedRows);
        applyPendingEdits({
            updatedRows,
            changeMeta,
            originalRows: originalRowsPC,
            setPendingEdits: setPendingEditsPC,
            primaryKey: "NO."
        });
    }

    async function handleConfirmChangesVCS() {
        const edits = Object.entries(pendingEditsVCS);
        if (edits.length === 0) {
            return;
        }

        setIsSavingVCS(true);
        setSaveErrorVCS(null);

        try {
            for (const [styleName, patch] of edits) {
                const { error: updateError } = await supabase
                    .from("vendor_cost_sheet")
                    .update(patch)
                    .eq("Style Name", styleName);

                if (updateError) {
                    throw updateError;
                }
            }

            setOriginalRowsVCS(rowsVCS);
            setPendingEditsVCS({});
        } catch (persistError) {
            console.error("Error saving pending changes:", persistError);
            setSaveErrorVCS(persistError.message || "Failed to save VCS changes");
        } finally {
            setIsSavingVCS(false);
        }
    }

    async function handleConfirmChangesPC() {
        const edits = Object.entries(pendingEditsPC);
        if (edits.length === 0) {
            return;
        }

        setIsSavingPC(true);
        setSaveErrorPC(null);

        try {
            for (const [rowNo, patch] of edits) {
                const { error: updateError } = await supabase
                    .from("payment-cycle-and-cash-discount")
                    .update(patch)
                    .eq("NO.", rowNo);

                if (updateError) {
                    throw updateError;
                }
            }

            setOriginalRowsPC(rowsPC);
            setPendingEditsPC({});
        } catch (persistError) {
            console.error("Error saving PC pending changes:", persistError);
            setSaveErrorPC(persistError.message || "Failed to save PC changes");
        } finally {
            setIsSavingPC(false);
        }
    }

    const pendingChangeCountVCS = Object.keys(pendingEditsVCS).length;
    const pendingChangeCountPC = Object.keys(pendingEditsPC).length;


    if (loading) {
        return <div className="p-4">Loading vendor cost sheet...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="relative overflow-x-hidden h-screen bg-zinc-50 overflow-y-auto font-sans snap-y snap-mandatory scroll-smooth !pointer-events-auto">


            <div className='flex flex-row gap-2 !z-50 fixed bottom-5 right-5'>
                <Button
                    variant='outline'
                    className="!rounded-full active:scale-80 scale-100 transition-all duration-75 ease-in"
                    onClick={handleRefreshComponents}
                >
                    ↻
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="!rounded-full active:scale-80 scale-100 transition-all duration-75 ease-in">
                            ⎙
                        </Button>
                    </DialogTrigger>

                    <DialogContent showCloseButton={false}>
                        <DialogTitle />
                        <DialogHeader>
                            <QueryDetails />
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

            </div>

            {/* sidebar */}
            <Sidebar onHoverChange={setSidebarHovered} />

            {/* aboslute */}
            <Header />
            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10">

                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-col items-start text-left">
                            <span className="poppins font-extrabold text-3xl">Vendor Cost Sheet</span>
                            <span className="poppins text-lg text-gray-500">Click and edit the vendor cost sheet anytime!</span>
                        </div>

                        <div className="flex flex-col justify-center items-end gap-3">
                            <button
                                type="button"
                                onClick={handleConfirmChangesVCS}
                                disabled={pendingChangeCountVCS === 0 || isSavingVCS}
                                className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSavingVCS ? "Saving..." : "Confirm Changes"}
                            </button>
                            <span className="text-sm text-gray-600">
                                {pendingChangeCountVCS} row(s) pending
                            </span>
                        </div>
                    </div>

                    {saveErrorVCS ? (
                        <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                            {saveErrorVCS}
                        </div>
                    ) : null}

                    <DataGrid
                        columns={columnsVCS}
                        rows={rowsVCS}
                        onRowsChange={handleRowsChangeVCS}
                        rowKeyGetter={(row) => row["Style Name"] ?? JSON.stringify(row)}
                        className="rdg-light w-full rounded-lg shadow-sm !h-1/2"
                        defaultColumnOptions={{
                            editable: true
                        }}
                    />
                </div>
            </div>


            <img src='./chupps_life.png' className='mx-auto w-1/12 animate-bounce my-12' />

            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10">

                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-col items-start text-left">
                            <span className="poppins font-extrabold text-3xl">Payment Cycle and Cash Discount</span>
                            <span className="poppins text-lg text-gray-500">Click and edit the payment cycle table anytime!</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleConfirmChangesPC}
                                disabled={pendingChangeCountPC === 0 || isSavingPC}
                                className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSavingPC ? "Saving..." : "Confirm Changes"}
                            </button>
                            <span className="text-sm text-gray-600">
                                {pendingChangeCountPC} row(s) pending
                            </span>
                        </div>
                    </div>
                    {saveErrorPC ? (
                        <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                            {saveErrorPC}
                        </div>
                    ) : null}
                    <DataGrid
                        columns={columnsPC}
                        rows={rowsPC}
                        onRowsChange={handleRowsChangePC}
                        rowKeyGetter={(row) => row["NO."] ?? JSON.stringify(row)}
                        className="rdg-light w-full rounded-lg shadow-sm !h-1/2"
                        defaultColumnOptions={{
                            editable: true
                        }}
                    />
                </div>
            </div>
        </div>
    );
}