"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import BackButton from "~/app/_components/back-button";
import { Regions, Roles } from "~/app/const";
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
import { useUserStore } from "~/lib/store/useUserStore";
import { isMasterAdmin } from "~/lib/utils";
import { api } from "~/trpc/react";

const CreateAdminPage = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<string>("Salesperson");
  const [region, setRegion] = React.useState<string>("Central");

  const { mutate, data, isPending, error, isError } =
    api.user.createAdmin.useMutation();

  const isMobile = useIsMobile();

  const handleCreate = async () => {
    console.log(role);

    if (!isNaN(+phone)) {
      mutate({
        name,
        email,
        password,
        phone: +phone,
        role: role.toUpperCase().replaceAll(" ", "_"),
        code,
      });
    }
  };

  useEffect(() => {
    if (!isPending && data) {
      if (isError) {
        console.log(error);
        return;
      }

      router.push("/user");
    }
  }, [data, isPending, error, isError, router]);

  useEffect(() => {
    if (!isMasterAdmin(user?.ROLE)) {
      toast.error("You are not authorized to edit this.");
      router.push("/user");
    }
  }, [router, user]);

  return (
    <div className="w-full px-0 pt-4 lg:px-14">
      {!isMobile && <BackButton />}

      <h1 className="my-0 mb-10 text-3xl lg:my-10">Create Admin</h1>

      <div className="flex w-full flex-col gap-6 lg:w-fit">
        <InputWithLabel label="Code" value={code} setValue={setCode} />
        <InputWithLabel label="Name" value={name} setValue={setName} />
        <InputWithLabel label="Phone" value={phone} setValue={setPhone} />
        <InputWithLabel label="Email" value={email} setValue={setEmail} />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Role</Label>

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role Type" />
            </SelectTrigger>
            <SelectContent>
              {Roles.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Region</Label>

          <Select
            value={region}
            onValueChange={setRegion}
            disabled={role.toLowerCase() !== "salesperson"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role Type" />
            </SelectTrigger>
            <SelectContent>
              {Regions.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputWithLabel
          label="Password"
          value={password}
          setValue={setPassword}
        />

        <Button className="w-fit" onClick={handleCreate}>
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreateAdminPage;
