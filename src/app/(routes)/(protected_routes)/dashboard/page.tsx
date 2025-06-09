"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { EditableDataTable } from "~/app/_components/editable-data-table";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateTotal } from "~/lib/utils";
import SearchBar from "~/app/_components/search-bar";

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

const DashboardPage = () => {
  const updateMutation = api.dashboard.updateForecast.useMutation();

  const { data: forecast, isLoading } = api.dashboard.getForecast.useQuery<{
    mt: Omit<ForecastRow, "type">[];
    costing: Omit<ForecastRow, "type">[];
  }>();

  const [localData, setLocalData] = useState<{
    mt: Omit<ForecastRow, "type">[];
    costing: Omit<ForecastRow, "type">[];
  }>({ mt: [], costing: [] });

  useEffect(() => {
    setLocalData(forecast ?? { mt: [], costing: [] });
  }, [forecast]);

  const handleUpdateData = (data: ForecastRow, value: number, key: string) => {
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

  return (
    <div className="w-full px-0 py-4 lg:px-4">
      <h1 className="mb-6 text-3xl">Forecast</h1>


      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weight">Weights</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          {" "}
          <section className="space-y-4 rounded-md p-4">
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

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={localData.mt}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item_group" />
                  <YAxis
                    tickFormatter={(value: number) => value.toLocaleString()}
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Bar dataKey="central" fill="#8884d8" />
                  <Bar dataKey="e_coast" fill="#82ca9d" />
                  <Bar dataKey="south" fill="#ffc658" />
                  <Bar dataKey="north" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="currency">
          {" "}
          <section className="space-y-4 rounded-md p-4">
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

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={localData.costing}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item_group" />
                  <YAxis
                    tickFormatter={(value: number) =>
                      `${(value / 1000000).toFixed(0)}m`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Bar dataKey="central" fill="#8884d8" />
                  <Bar dataKey="e_coast" fill="#82ca9d" />
                  <Bar dataKey="south" fill="#ffc658" />
                  <Bar dataKey="north" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
