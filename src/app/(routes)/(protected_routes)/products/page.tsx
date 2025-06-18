"use client";

import type { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { DataTable } from "~/app/_components/data-table";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ProductType } from "~/lib/types";
import SearchBar from "~/app/_components/search-bar";
import { Dialog } from "~/components/ui/dialog";
import DeleteModal from "~/app/_components/DeleteModal";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const current_path = usePathname();
  const router = useRouter();
  const utils = api.useUtils();

  const [isSearching, setIsSearching] = useState(false);

  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  const { data: productData, isLoading } = api.product.getAll.useQuery();
  const getCsv = api.product.getCsv.useQuery();

  const deleteMutation = api.product.delete.useMutation();
  const {
    mutate: searchMutate,
    isPending,
    data: searchData,
  } = api.product.search.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
    },
  });

  const handleDelete = async (id: number) => {
    setSelectedRow(0);
    setShowModal(false);

    await toast.promise(deleteMutation.mutateAsync({ id }), {
      loading: "Deleting...",
      success: "Product deleted successfully",
      error: "Poduct has active transactions. Please delete the transactions first.",
    });
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
              onClick={() => {
                setSelectedRow(row.original.ID);
                setShowModal(true);
              }}
            >
              <Trash className="h-2 w-2" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (value: string) => {
    if (value === "") {
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }

    searchMutate({ query: value });
  };

  const handleExport = async () => {
    const csvData = await getCsv.refetch();
    if (csvData.data) {
      const blob = new Blob([csvData.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Failed to fetch CSV data");
    }
  };

  const displayedData = isSearching ? (searchData ?? []) : (productData ?? []);

  return (
    <>
      <div className="w-full px-0 py-4 lg:px-4">
        <div className="flex items-center justify-between">
          <h1 className="mb-6 text-3xl">Products</h1>

          <div className="flex gap-2">
            <Button className="mb-4" onClick={() => handleExport()}>
              Export
            </Button>
            <Button
              className="mb-4"
              onClick={() => router.push(current_path + "/create")}
            >
              Create Products
            </Button>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isPending} />

        <section className="pb-8">
          <DataTable
            columns={productColumns}
            data={displayedData}
            isLoading={isLoading || isPending}
          />
        </section>

        <Dialog open={showModal} onOpenChange={() => setShowModal(false)}>
          <DeleteModal
            handleDelete={() => handleDelete(selectedRow)}
            closeModal={() => {
              setShowModal(false);
            }}
          />
        </Dialog>
      </div>
    </>
  );
};

export default ProductsPage;
