"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import BackButton from "~/app/_components/back-button";
import { Category } from "~/app/const";
import { Button } from "~/components/ui/button";
import InputWithLabel from "~/components/ui/input-with-label";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useIsMobile } from "~/hooks/useMobile";
import { api } from "~/trpc/react";

const CreateProductPage = () => {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [baseUom, setBaseUom] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");

  const { mutate, data, isPending, error, isError } =
    api.product.create.useMutation();

  const isMobile = useIsMobile();

  const handleCreate = async () => {
    mutate({
      name,
      category,
      base_uom: baseUom,
      stock: +stock,
      unit_price: +unitPrice,
      code,
    });
  };

  useEffect(() => {
    if (!isPending && data) {
      if (isError) {
        console.log(error);
        return;
      }

      router.push("/products");
    }
  }, [data, isPending, error, isError, router]);

  return (
    <div className="w-full px-0 pt-4 lg:px-14">
      {!isMobile && <BackButton />}

      <h1 className="my-0 mb-10 text-3xl lg:my-10">Create User</h1>

      <div className="flex w-full flex-col gap-6 lg:w-fit">
        <InputWithLabel label="Code" value={code} setValue={setCode} />
        <InputWithLabel label="Name" value={name} setValue={setName} />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Category</Label>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category Type" />
            </SelectTrigger>
            <SelectContent>
              {Category.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputWithLabel
          label="Base UOM"
          value={baseUom}
          setValue={setBaseUom}
        />

        <InputWithLabel
          label="Unit Price"
          value={unitPrice}
          setValue={setUnitPrice}
        />
        <InputWithLabel label="Stocks" value={stock} setValue={setStock} />

        <Button className="w-fit" onClick={handleCreate}>
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreateProductPage;
