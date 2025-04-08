
import React from "react";

const EditUserPage: React.FC<{
  params: Promise<{ slug: string }>;
}> = async ({ params }) => {
  const slug = (await params).slug;
  return <div>My User id: {slug}</div>;
};
export default EditUserPage;
