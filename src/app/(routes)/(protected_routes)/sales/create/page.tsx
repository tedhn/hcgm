"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CalendarIcon, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import BackButton from "~/app/_components/back-button";
import { Category } from "~/app/const";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import InputWithLabel from "~/components/ui/input-with-label";
import { Label } from "~/components/ui/label";
import { useIsMobile } from "~/hooks/useMobile";
import { type DropDownType } from "~/lib/types";
import { format, set } from "date-fns";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Product } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const CreateSalesPage = () => {
  const router = useRouter();

  const [customerId, setCustomerId] = React.useState<string | null>(null);
  const [openCustomerComboBox, setOpenCustomerComboBox] = React.useState(false);

  const [productId, setProductId] = React.useState<string | null>(null);
  const [productArr, setProductArr] = React.useState<Product[]>([]);
  const [openProductComboBox, setOpenProductComboBox] = React.useState(false);

  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(
    undefined,
  );

  const { mutate, data, isPending, error, isError } =
    api.product.create.useMutation();

  const { data: customerData, isLoading: customerLoading } =
    api.user.getAllCustomers.useQuery();
  const { data: productData, isLoading: productLoading } =
    api.product.getAll.useQuery<Product[]>();

  const isMobile = useIsMobile();

  const handleCreate = async () => {
    // mutate({
    //   name,
    //   category,
    //   base_uom: baseUom,
    //   stock: +stock,
    //   unit_price: +unitPrice,
    //   code,
    // });
  };

  return (
    <div className="w-full px-0 pt-4 lg:px-14">
      {!isMobile && <BackButton />}

      <h1 className="my-0 mb-10 text-3xl lg:my-10">Create Sales</h1>

      <div className="flex w-full flex-col gap-6 lg:w-2/3">
        <div className="grid w-full items-center gap-1.5">
          <div className="flex flex-col gap-2">
            <Label>Customer</Label>
            <Popover
              open={openCustomerComboBox}
              onOpenChange={setOpenCustomerComboBox}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {customerId
                    ? customerData?.find((c) => c.ID === +customerId)?.NAME
                    : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 shadow-md">
                <Command>
                  <CommandInput placeholder="Search Customer..." />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {customerData?.map((customer) => (
                        <CommandItem
                          key={customer.ID}
                          value={customer.ID + ""}
                          onSelect={(currentValue) => {
                            setCustomerId(currentValue);
                            setOpenCustomerComboBox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerId === customer.ID + ""
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {customer.NAME}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Products</Label>
            <Popover
              open={openProductComboBox}
              onOpenChange={setOpenProductComboBox}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {productId
                    ? productData?.find((c) => c.ID === +productId)?.NAME
                    : "Select product..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 shadow-md">
                <Command>
                  <CommandInput placeholder="Search product..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {productData?.map((product) => (
                        <CommandItem
                          key={product.ID}
                          value={product.ID + ""}
                          onSelect={(currentValue) => {
                            const product = productData?.find(
                              (c) => c.ID === +currentValue,
                            );

                            if (!product) return;

                            setProductArr([...productArr, product]);
                            setProductId(currentValue);
                            setOpenProductComboBox(false);
                          }}
                        >
                          {product.NAME}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Card className="mx-auto my-6 w-full max-w-5xl">
            <CardHeader>
              <CardTitle className="text-xl">Product Entry Table</CardTitle>
            </CardHeader>
            <CardContent>
              {productArr.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left font-medium">
                          Product Name
                        </th>
                        <th className="p-3 text-left font-medium">Quantity</th>
                        <th className="p-3 text-left font-medium">UOM</th>
                        <th className="p-3 text-left font-medium">Price</th>
                        <th className="p-3 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productArr.map((product, index) => (
                        <tr
                          key={product.ID}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">{product.NAME}</td>
                          <td className="p-3">
                            <Input
                              min="0"
                              placeholder="Quantity"
                              className="h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="text"
                              placeholder="UOM"
                              className="h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              className="h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              variant="destructive"
                              size="icon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>No products added</div>
              )}
            </CardContent>
          </Card>
          <div>
            <Label>Total Price</Label>
            <Input placeholder="0.00" />
          </div>
          <div>
            <Label>Reference Document No.</Label>
            <Input placeholder="REF-00123" />
          </div>
          <div className="flex flex-col items-start justify-center gap-2">
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? (
                    format(deliveryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Shipping Method</Label>
            <Input placeholder="Air / Sea / Land" />
          </div>
          <div>
            <Label>Commission</Label>
            <Input placeholder="Enter commission %" />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input placeholder="Enter remarks" />
          </div>
        </div>

        <Button className="w-fit" onClick={handleCreate}>
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreateSalesPage;
