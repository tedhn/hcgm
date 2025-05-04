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

  if (isLoading) return <Dialog>Loading...</Dialog>;
  if (error ?? !data) return <div>Error loading sales data.</div>;

  const {
    DOC_NUM,
    REF_DOC_NO,
    TRANSACTION_DATE,
    CUSTOMER,
    ADMIN,
    TOTAL_PRICE,
    DELIVERY_DATE,
    SHIPPING_METHOD,
    COMISSION,
    REMARK,
    STATUS,
  } = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Transaction Details</DialogTitle>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Document No.:</strong> {DOC_NUM}
            </div>
            <div>
              <strong>Reference Document No.:</strong> {REF_DOC_NO ?? "-"}
            </div>
            <div>
              <strong>Transaction Date:</strong>{" "}
              {format(new Date(TRANSACTION_DATE), "PPP")}
            </div>
            <div>
              <strong>Status:</strong> {STATUS}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Name:</strong> {CUSTOMER?.NAME ?? "-"}
            </div>
            <div>
              <strong>Email:</strong> {CUSTOMER?.EMAIL ?? "-"}
            </div>
            <div>
              <strong>Phone:</strong> {CUSTOMER?.PHONE_NO ?? "-"}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Name:</strong> {ADMIN?.NAME ?? "-"}
            </div>
            <div>
              <strong>Email:</strong> {ADMIN?.EMAIL ?? "-"}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            {data.PRODUCTS && data.PRODUCTS.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Quantity</th>
                    <th className="p-2 text-left">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.PRODUCTS.map((product) => (
                    <tr key={product.ID} className="border-t">
                      <td className="p-2">{product.NAME}</td>
                      <td className="p-2">{product.QTY}</td>
                      <td className="p-2">RM{product.UNIT_PRICE.toFixed(2)}</td>
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
              <strong>Total Price:</strong> RM{TOTAL_PRICE.toFixed(2)}
            </div>
            <div>
              <strong>Delivery Date:</strong>{" "}
              {DELIVERY_DATE ? format(new Date(DELIVERY_DATE), "PPP") : "-"}
            </div>
            <div>
              <strong>Shipping Method:</strong> {SHIPPING_METHOD ?? "-"}
            </div>
            <div>
              <strong>Commission:</strong> {COMISSION ? `${COMISSION}%` : "-"}
            </div>
            <div>
              <strong>Remarks:</strong> {REMARK ?? "-"}
            </div>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SalesDetailsDialog;
