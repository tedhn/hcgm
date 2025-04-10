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
import { Admin, Customer } from "~/lib/types";

const UserPage = () => {
  const current_path = usePathname();
  const router = useRouter();
  const [adminData, setAdminData] = useState<Admin[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);

  const { data: userData, isLoading } = api.user.getAll.useQuery();

  const deleteMutation = api.user.delete.useMutation();

  useEffect(() => {
    console.log(typeof api.user.getAll);
    try {
      if (userData?.admin) {
        setAdminData(userData.admin);
        // setCustomerData(userData.customers);
      }
    } catch (e) {
      console.log(e);
    }
  }, [userData]);

  const handleDelete = (id: number) => {
    console.log("delete", id);

    deleteMutation.mutate({ id });

    const newAdminData = adminData.filter((item) => item.id !== id);

    setAdminData(newAdminData);
  };

  const adminColumns: ColumnDef<Admin>[] = [
    {
      // accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 240,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone;

        const outputText = phone ?? "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "password",
      header: "Password",
      cell: ({}) => {
        return <div>**********</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;

        const outputText = role
          ? role.charAt(0).toUpperCase() + role.slice(1)
          : "-";

        return <div>{outputText}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString();
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
                    router.push(current_path + `/edit/${row.original.id}`)
                  }
                  className="focus:bg-gray-100"
                >
                  <Pencil className="h-2 w-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                  onClick={() => handleDelete(row.original.id)}
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

  const customerColumns: ColumnDef<Customer>[] = [
    {
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 160,
    },
    {
      accessorKey: "phoneNo",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phoneNo;
        return <div>{phone ?? "-"}</div>;
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.address1;
        return <div>{address ?? "-"}</div>;
      },
    },
    {
      accessorKey: "creditTerm",
      header: "Credit Term",
      cell: ({ row }) => {
        return row.original.creditTerm ?? "-";
      },
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Limit",
      cell: ({ row }) => {
        return row.original.creditLimit?.toFixed(2) ?? "0.00";
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString();
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
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`${current_path}/edit/${row.original.id}`)
                  }
                  className="focus:bg-gray-100"
                >
                  <Pencil className="h-2 w-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
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
          <h1 className="mb-6 text-3xl">Users</h1>

          <Button
            className="mb-4"
            onClick={() => router.push(current_path + "/create")}
          >
            Create User
          </Button>
        </div>

        <section className="pb-8">
          <h1>Admin</h1>
          <DataTable
            columns={adminColumns}
            data={adminData}
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

export default UserPage;
