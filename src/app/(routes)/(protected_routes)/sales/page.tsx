/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
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
import type { SalesType } from "~/lib/types";
import { Badge } from "~/components/ui/badge";
import SalesDetailsDialog from "./viewModal";
import toast from "react-hot-toast";

const renderStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant={"pending"}>Pending</Badge>;
    case "approved":
      return <Badge variant={"done"}>Approved</Badge>;
    case "delivered":
      return <Badge variant={"success"}>Delivered</Badge>;
    case "cancelled":
      return <Badge variant={"destructive"}>Cancelled</Badge>;
  }
};

const ProductsPage = () => {
  const current_path = usePathname();
  const router = useRouter();

  const utils = api.useUtils();
  const [selectedRow, setSelectedRow] = useState<SalesType | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  const { data: apiData, isLoading } = api.transactions.getAll.useQuery();

  const { mutate: deleteTransaction } = api.transactions.delete.useMutation({
    onSuccess: () => {
      void utils.transactions.getAll.invalidate();
      toast.success("Transaction deleted successfully");
    },
  });

  const handleDelete = (id: number) => {
    deleteTransaction({ transaction_id: id });
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
      accessorKey: "TOTAL_PRICE",
      header: "Total Price",
      cell: ({ row }) => <div>RM {row.original.TOTAL_PRICE}</div>,
    },
    {
      accessorKey: "STATUS",
      header: "Status",
      cell: ({ row }) => renderStatus(row.original.STATUS),
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
      <div className="w-full px-0 py-4 lg:px-4">
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
            data={apiData ?? []}
            isLoading={isLoading}
            onRowDoubleClick={(row) => {
              console.log(row);
              setOpenViewModal(true);
              setSelectedRow(row);
            }}
          />
        </section>

        {selectedRow && openViewModal && (
          <SalesDetailsDialog
            sales={selectedRow}
            open={openViewModal}
            onOpenChange={setOpenViewModal}
          />
        )}
      </div>
    </>
  );
};

export default ProductsPage;
