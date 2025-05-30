"use client";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect } from "react";
import BackButton from "~/app/_components/back-button";
import { Roles } from "~/app/const";
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

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const isMobile = useIsMobile();

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<string>("");

  const { data, isLoading } = api.user.getOne.useQuery({
    id: params.slug ? +params.slug : -1,
  });

  const { mutate, isPending, data: editData } = api.user.edit.useMutation();

  useEffect(() => {
    if (data && !isLoading) {
      setCode(data.CODE);
      setName(data.NAME);
      setPhone(data.PHONE);
      setEmail(data.EMAIL);
      setPassword(data.PASSWORD);
      // setRole(data.ROLE.replace("_", " ").);

      const role = Roles.find(
        (r) => r.name.toUpperCase() === data.ROLE.replace("_", " "),
      );

      if (role) {
        setRole(role.name);
      }
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (!isPending && editData) router.push(`/user`);
  }, [isPending, router, editData]);

  const handleEdit = () => {
    console.log("edit", data?.ID);
    mutate({
      id: data!.ID,
      name,
      email,
      password,
      phone: +phone,
      role: role.toUpperCase().replaceAll(" ", "_"),
      code,
    });
  };

  return (
    <div className="w-full px-0 pt-4 lg:px-14">
      {!isMobile && <BackButton />}

      <h1 className="my-0 mb-10 text-3xl lg:my-10">Edit User</h1>

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

        {/* <InputWithLabel
          label="Password"
          value={password}
          setValue={setPassword}
        /> */}

        <Button className="w-fit" onClick={handleEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
};
export default EditUserPage;
