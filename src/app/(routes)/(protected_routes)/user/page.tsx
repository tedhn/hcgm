"use client";

import type { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { DataTable } from "~/app/_components/data-table";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { UserType, CustomerType } from "~/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { type REGION, REGION_LABELS } from "~/app/const";
import toast from "react-hot-toast";
import SearchBar from "~/app/_components/search-bar";

const UserPage = () => {
  const current_path = usePathname();
  const router = useRouter();
  const utils = api.useUtils();

  const [currentTab, setCurrentTab] = useState<string>("admin");
  const [isSearching, setIsSearching] = useState(false);

  const { data: userData, isLoading } = api.user.getAll.useQuery();
  const {
    mutate: searchMutate,
    data: searchData,
    isPending,
  } = api.user.search.useMutation();

  const deleteUserMutation = api.user.deleteUser.useMutation();

  const handleDelete = async (id: number, type: string) => {
    const promise = deleteUserMutation.mutateAsync({ id: id, type });

    await toast.promise(promise, {
      loading: "Deleting...",
      success: "User deleted successfully",
      error: "Error deleting user",
    });

    void utils.user.getAll.invalidate();
  };

  const adminColumns: ColumnDef<UserType>[] = [
    {
      // accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "CODE",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.original.NAME;

        const outputText = name ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 240,
      cell: ({ row }) => {
        const email = row.original.EMAIL;

        const outputText = email ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.PHONE;

        const outputText = phone ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.ROLE;

        const outputText = role
          ? role.charAt(0).toUpperCase() + role.slice(1)
          : "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "REGION",
      header: "Region",
      cell: ({ row }) => {
        const outputText = REGION_LABELS[row.original.REGION as REGION] ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.original.CREATED_AT).toLocaleDateString();
      },
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
                router.push(current_path + `/admin/edit/${row.original.ID}`)
              }
            >
              <Pencil className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
              onClick={() => handleDelete(row.original.ID, "admin")}
            >
              <Trash className="h-2 w-2" />
            </Button>
          </div>
        );
      },
    },
  ];

  const customerColumns: ColumnDef<CustomerType>[] = [
    {
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "CODE",
      header: "Code",
      size: 110,
    },
    {
      accessorKey: "NAME",
      header: "Name",
      size: 300,
    },
    {
      accessorKey: "EMAIL",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.EMAIL;
        return <div>{email ?? "-"}</div>;
      },
    },
    {
      accessorKey: "PHONE_NO",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.PHONE_NO;
        return <div>{phone ?? "-"}</div>;
      },
      size: 150,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.ADDRESS;
        return <div>{address === "" || !address ? "-" : address}</div>;
      },
      size: 300,
    },
    {
      accessorKey: "creditTerm",
      header: "Credit Term",
      cell: ({ row }) => {
        return row.original.CREDIT_TERM?.replace("Net", "").trim() ?? "-";
      },
      size: 110,
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Limit",
      cell: ({ row }) => {
        return `${row.original.CREDIT_LIMIT! / 1000}k`;
      },
      size: 110,
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
                router.push(`${current_path}/customer/edit/${row.original.ID}`)
              }
            >
              <Pencil className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
              onClick={() => handleDelete(row.original.ID, "customer")}
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

  const displayedAdminData = isSearching
    ? (searchData?.admins ?? [])
    : (userData?.admins ?? []);
  const displayedCustomerData = isSearching
    ? (searchData?.customers ?? [])
    : (userData?.customers ?? []);

  return (
    <>
      <div className="w-full px-0 py-4 lg:px-4">
        <div className="flex items-center justify-between">
          <h1 className="mb-6 text-3xl">Users</h1>

          <Button
            className="mb-4"
            onClick={() => router.push(current_path + `/${currentTab}/create`)}
          >
            Create {currentTab === "admin" ? "Admin" : "Customer"}
          </Button>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isPending} />

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <DataTable
              columns={adminColumns}
              data={displayedAdminData}
              isLoading={isLoading || isPending}
            />
          </TabsContent>

          <TabsContent value="customer">
            <DataTable
              columns={customerColumns}
              data={displayedCustomerData}
              isLoading={isLoading || isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UserPage;
