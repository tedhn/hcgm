"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUserStore } from "~/lib/store/useUserStore";
import { api } from "~/trpc/react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { EditableDataTable } from "~/app/_components/editable-data-table";
import toast from "react-hot-toast";

export type ForecastRow = {
  id: number;
  item_group: string;
  central: number;
  e_coast: number;
  south: number;
  north: number;
  type: string;
};

function formatNumberWithCommas(value: number | string) {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString();
}

export const calculateTotal = (arr: ForecastRow[] | undefined) => {
  if (arr === undefined || arr.length === 0) {
    return [];
  }
  const type = arr[0]!.type;

  const totalRow = arr.reduce(
    (acc, cur) => {
      acc.central += Number(cur.central) ?? 0;
      acc.e_coast += Number(cur.e_coast) ?? 0;
      acc.south += Number(cur.south) ?? 0;
      acc.north += Number(cur.north) ?? 0;
      return acc;
    },
    {
      id: 0,
      central: 0,
      e_coast: 0,
      south: 0,
      north: 0,
      item_group: "Total",
      type: type,
    } as ForecastRow,
  );

  return [...arr.sort((a, b) => a.id - b.id), totalRow];
};

const DashboardPage = () => {
  const { mutate, isPending } = api.user.sendEmail.useMutation();

  const { user } = useUserStore();

  const utils = api.useUtils();
  const updateMutation = api.dashboard.updateForecast.useMutation();

  const { data: forecast, isLoading } = api.dashboard.getForecast.useQuery<{
    mt: Omit<ForecastRow, "type">[];
    costing: Omit<ForecastRow, "type">[];
  }>();

  const [localData, setLocalData] = useState<{
    mt: Omit<ForecastRow, "type">[];
    costing: Omit<ForecastRow, "type">[];
  }>({ mt: [], costing: [] });

  const handleUpdateData = (data: ForecastRow, value: number, key: string) => {
    console.log(data);
    console.log(key);
    console.log(typeof value);

    if (Number.isNaN(+value)) {
      toast.error("Please enter a valid number.");
      return;
    }

    const newData = localData.mt.map((item) => {
      if (item.id === data.id) {
        return { ...item, [key]: +value };
      }
      return { ...item, type: data.type };
    });

    if (data.type === "MT") {
      setLocalData({ ...localData, mt: newData });
    } else if (data.type === "COSTING") {
      setLocalData({ ...localData, costing: newData });
    }

    updateMutation.mutate({ ...data, [key]: +value });
  };

  const handleSendEmail = async () => {
    mutate({ email: "heinhtetnaing186@gmail.com" });
  };

  const forecastColumns: ColumnDef<ForecastRow>[] = [
    {
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "ITEM_GROUP",
      header: "Item Group",
      cell: ({ row }) => <div>{row.original.item_group || "-"}</div>,
      size: 150,
    },
    ...["central", "e_coast", "south", "north"].map((key) => ({
      accessorKey: key.toUpperCase(),
      header: key.replace("_", " ").toUpperCase(),
      cell: ({ row }: { row: Row<ForecastRow> }) => {
        const val = row.original[key as keyof ForecastRow] as
          | number
          | null
          | undefined;
        const isCosting = row.original.type === "COSTING";
        return (
          <div className="cursor-pointer">
            {val == null
              ? "-"
              : isCosting
                ? `RM ${formatNumberWithCommas(val)}`
                : formatNumberWithCommas(val)}
          </div>
        );
      },
      size: 80,
    })),

    {
      accessorKey: "Total",
      header: "Total",
      cell: ({ row }) => {
        const { central, e_coast, south, north, type } = row.original;
        const total =
          (central ?? 0) + (e_coast ?? 0) + (south ?? 0) + (north ?? 0);

        return (
          <div>
            {type === "COSTING"
              ? `RM ${formatNumberWithCommas(total)}`
              : formatNumberWithCommas(total)}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLocalData(forecast ? forecast : { mt: [], costing: [] });
  }, [forecast]);

  return (
    <div className="w-full px-0 py-4 lg:px-4">
      <h1 className="mb-6 text-3xl">Forecast</h1>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weight">Weights</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="weight"></TabsContent>

        <TabsContent value="currency"></TabsContent>
      </Tabs>

      <div className="flex flex-col gap-8">
        <section className="rounded-md p-4">
          <h2
            className="mb-4 text-xl font-semibold"
            style={{ color: "#254336" }}
          >
            Weights
          </h2>
          <EditableDataTable
            columns={forecastColumns}
            data={calculateTotal(
              localData.mt.map((row) => ({ ...row, type: "MT" })),
            )}
            isLoading={isLoading}
            onDataChange={handleUpdateData}
            setLocalData={setLocalData}
          />
        </section>

        <section className="rounded-md p-4">
          <h2
            className="mb-4 text-xl font-semibold"
            style={{ color: "#254336" }}
          >
            Cost
          </h2>
          <EditableDataTable
            columns={forecastColumns}
            data={calculateTotal(
              localData.costing.map((row) => ({ ...row, type: "COSTING" })),
            )}
            isLoading={isLoading}
            onDataChange={handleUpdateData}
            setLocalData={setLocalData}
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
