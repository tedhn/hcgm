/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { DataTable } from "~/app/_components/data-table";
import { api } from "~/trpc/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { SalesType, TransactionType } from "~/lib/types";

const ProductsPage = () => {
  const current_path = usePathname();
  const router = useRouter();
  const [data, setData] = useState<SalesType[]>([]);
  // const [customerData, setCustomerData] = useState<Customer[]>([]);

  const { data: apiData, isLoading } = api.transactions.getAll.useQuery();

  const deleteMutation = api.transactions.delete.useMutation();

  useEffect(() => {
    try {
      if (apiData?.sales) {
        console.log(apiData);
        setData(apiData.sales);
      }
    } catch (e) {
      console.log(e);
    }
  }, [apiData]);

  const handleDelete = (id: number) => {
    console.log("delete", id);

    deleteMutation.mutate({ id });

    const newProductTypeData = data.filter((item) => item.ID !== id);

    setData(newProductTypeData);
  };

  const transactionsColumns: ColumnDef<SalesType>[] = [
    {
      // accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "DOC_NUM",
      header: "Document Number",
      size: 120,
    },
    {
      accessorKey: "ADMIN",
      header: "Admin",
      size: 120,
      cell: ({ row }) => {
        return <div>{row.original.ADMIN?.NAME}</div>;
      },
    },
    {
      accessorKey: "CUSTOMER",
      header: "Customer",
      size: 120,
      cell: ({ row }) => {
        return <div>{row.original.CUSTOMER?.NAME}</div>;
      },
    },

    {
      id: "actions",
      size: 40,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                <DropdownMenuItem
                  onClick={() =>
                    router.push(current_path + `/edit/${row.original.ID}`)
                  }
                  className="focus:bg-gray-100"
                >
                  <Pencil className="h-2 w-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                  onClick={() => handleDelete(row.original.ID)}
                >
                  <Trash className="h-2 w-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="w-full px-0 py-4 lg:px-14">
        <div className="flex items-center justify-between">
          <h1 className="mb-6 text-3xl">Sales</h1>

          <Button
            className="mb-4"
            onClick={() => router.push(current_path + "/create")}
          >
            Add Sales
          </Button>
        </div>

        <section className="pb-8">
          <DataTable
            columns={transactionsColumns}
            data={data}
            isLoading={isLoading}
          />
        </section>

        {/* <section>
          <h1>Customers</h1>
          <DataTable
            columns={customerColumns}
            data={customerData}
            isLoading={isLoading}
          />
        </section> */}
      </div>
    </>
  );
};

export default ProductsPage;
