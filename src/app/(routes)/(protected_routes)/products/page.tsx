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
import type { ProductType } from "~/lib/types";

const ProductsPage = () => {
  const current_path = usePathname();
  const router = useRouter();
  const [data, setData] = useState<ProductType[]>([]);
  // const [customerData, setCustomerData] = useState<Customer[]>([]);

  const { data: productData, isLoading } = api.product.getAll.useQuery();

  const deleteMutation = api.product.delete.useMutation();

  useEffect(() => {
    try {
      if (productData) {
        setData(productData);
      }
    } catch (e) {
      console.log(e);
    }
  }, [productData]);

  const handleDelete = (id: number) => {
    console.log("delete", id);

    deleteMutation.mutate({ id });

    const newProductTypeData = data.filter((item) => item.ID !== id);

    setData(newProductTypeData);
  };

  const productColumns: ColumnDef<ProductType>[] = [
    {
      // accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "CODE",
      header: "Code",
      size: 120,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.original.NAME;

        const outputText = name ?? "-";

        return <div>{outputText}</div>;
      },
      size: 320,
    },
    {
      accessorKey: "CATEGORY",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.CATEGORY;

        const outputText = category ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "BASE_UOM",
      header: "Base UOM",
      cell: ({ row }) => {
        const base_uom = row.original.BASE_UOM;

        const outputText = base_uom ?? "-";

        return <div>{outputText}</div>;
      },
      size: 80,
    },

    {
      accessorKey: "UNIT_PRICE",
      header: "Unit Price",
      cell: ({ row }) => {
        const role = row.original.UNIT_PRICE;

        const outputText = role ?? "-";

        return <div>{outputText}</div>;
      },
      size: 80,
    },
    {
      accessorKey: "STOCK",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.STOCK;

        const outputText = stock ?? "-";

        return <div>{outputText}</div>;
      },
      size: 80,
    },
    {
      id: "actions",
      size: 40,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              className="text-blue-500 focus:bg-blue-500/10 focus:text-blue-500"
              onClick={() =>
                router.push(current_path + `/edit/${row.original.ID}`)
              }
            >
              <Pencil className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
              onClick={() => handleDelete(row.original.ID)}
            >
              <Trash className="h-2 w-2" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="w-full px-0 py-4 lg:px-4">
        <div className="flex items-center justify-between">
          <h1 className="mb-6 text-3xl">Products</h1>

          <Button
            className="mb-4"
            onClick={() => router.push(current_path + "/create")}
          >
            Add Products
          </Button>
        </div>

        <section className="pb-8">
          <DataTable
            columns={productColumns}
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
