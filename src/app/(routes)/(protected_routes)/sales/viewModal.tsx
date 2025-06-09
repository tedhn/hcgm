// React dialog component to display detailed sales information

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { SalesType } from "~/lib/types";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loader";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { renderStatus } from "~/lib/utils";

interface SalesDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sales: SalesType;
}

const SalesDetailsDialog: React.FC<SalesDetailsDialogProps> = ({
  open,
  onOpenChange,
  sales,
}) => {
  const { data, isLoading, error } = api.transactions.getOne.useQuery({
    id: sales.ID,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch sales details.");
    }
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Transaction Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Document No.:</strong> {data!.DOC_NUM}
                </div>
                <div>
                  <strong>Reference Document No.:</strong>{" "}
                  {data!.REF_DOC_NO ?? "-"}
                </div>
                <div>
                  <strong>Transaction Date:</strong>{" "}
                  {format(new Date(data!.TRANSACTION_DATE), "PPP")}
                </div>
                <div>
                  <strong>Status:</strong> {renderStatus(data!.STATUS)}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Name:</strong> {data!.CUSTOMER?.NAME ?? "-"}
                </div>
                <div>
                  <strong>Email:</strong> {data!.CUSTOMER?.EMAIL ?? "-"}
                </div>
                <div>
                  <strong>Phone:</strong> {data!.CUSTOMER?.PHONE_NO ?? "-"}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Admin Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Name:</strong> {data!.ADMIN?.NAME ?? "-"}
                </div>
                <div>
                  <strong>Email:</strong> {data!.ADMIN?.EMAIL ?? "-"}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                {data!.PRODUCTS && data!.PRODUCTS.length > 0 ? (
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.PRODUCTS.map((product) => (
                        <tr key={product.ID} className="border-t">
                          <td className="p-2">{product.NAME}</td>
                          <td className="p-2">{product.QTY}</td>
                          <td className="p-2">
                            RM{product.UNIT_PRICE.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No transaction details available.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Total Price:</strong> RM{data!.TOTAL_PRICE.toFixed(2)}
                </div>
                <div>
                  <strong>Delivery Date:</strong>{" "}
                  {data!.DELIVERY_DATE
                    ? format(new Date(data!.DELIVERY_DATE), "PPP")
                    : "-"}
                </div>
                <div>
                  <strong>Shipping Method:</strong>{" "}
                  {data!.SHIPPING_METHOD ?? "-"}
                </div>
                <div>
                  <strong>Commission:</strong>{" "}
                  {data!.COMISSION ? `${data!.COMISSION}%` : "-"}
                </div>
                <div>
                  <strong>Remarks:</strong> {data!.REMARK ?? "-"}
                </div>
                <div>
                  <strong>Delivery Location:</strong> {data!.LOCATION ?? "-"}
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesDetailsDialog;
