"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { type Product } from "@prisma/client";
import { api } from "~/trpc/react";

interface ConfirmSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string | undefined;
  productDetails: {
    uom: string;
    quantity: string;
    price: string;
    name: string;
    id: string;
  }[];
  totalPrice: string;
  docNumber: string;
  referenceDoc: string;
  deliveryDate: Date | undefined;
  shippingMethod: string;
  commission: string;
  remarks: string;
}

const ConfirmSalesModal: React.FC<ConfirmSalesModalProps> = ({
  open,
  onOpenChange,
  customerName,
  productDetails,
  totalPrice,
  docNumber,
  referenceDoc,
  deliveryDate,
  shippingMethod,
  commission,
  remarks,
}) => {
  const {
    mutate: createSales,
    data,
    isPending,
    error,
    isError,
  } = api.transactions.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleCreate = () => {
    createSales({
      customerName,
      productDetails,
      totalPrice,
      docNumber,
      referenceDoc,
      deliveryDate,
      shippingMethod,
      commission,
      remarks,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Sales Creation</DialogTitle>
          <DialogDescription>
            Please review the details below before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Document No.:</strong> {docNumber || "-"}
          </div>
          <div>
            <strong>Reference Document No.:</strong> {referenceDoc || "-"}
          </div>

          <div>
            <strong>Customer:</strong> {customerName ?? "-"}
          </div>

          <Card className="mx-auto my-6 w-full max-w-5xl">
            <CardHeader>
              <CardTitle className="text-xl">Product Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {productDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#254336] text-white">
                      <tr>
                        <th className="p-3 text-left font-medium">
                          Product Name
                        </th>
                        <th className="p-3 text-left font-medium">Quantity</th>
                        <th className="p-3 text-left font-medium">UOM</th>
                        <th className="p-3 text-left font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productDetails.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">{product.name}</td>
                          <td className="p-3">{product.quantity || "-"}</td>
                          <td className="p-3">{product.uom || "-"}</td>
                          <td className="p-3">{product.price || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-muted-foreground">No products added</div>
              )}
            </CardContent>
          </Card>

          <div>
            <strong>Total Price:</strong> {totalPrice || "-"}
          </div>

          <div>
            <strong>Delivery Date:</strong>{" "}
            {deliveryDate ? format(deliveryDate, "PPP") : "-"}
          </div>
          <div>
            <strong>Shipping Method:</strong> {shippingMethod || "-"}
          </div>
          <div>
            <strong>Commission:</strong> {commission || "-"}%
          </div>
          <div>
            <strong>Remarks:</strong> {remarks || "-"}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCreate();
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmSalesModal;
