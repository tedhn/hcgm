import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { ProductType } from "~/lib/types";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.transaction.findMany();
    const admins = await ctx.db.admin.findMany();
    const customers = await ctx.db.customer.findMany();
    const transactionDetails = await ctx.db.transactionDetail.findMany();

    const sales = transactions.map((transaction) => {
      const admin = admins.find((admin) => admin.ID === transaction.ADMIN_ID);
      const customer = customers.find(
        (customer) => customer.ID === transaction.CUSTOMER_ID,
      );
      const details = transactionDetails.find(
        (detail) => detail.TRANSACTION_ID === transaction.ID,
      );

      return {
        ...transaction,
        ADMIN: admin,
        CUSTOMER: customer,
        DETAILS: details,
      };
    });

    // const customers = await ctx.db.customer.findMany();

    //@ts-expeect-error any
    return { sales  };
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const product = await ctx.db.product.findFirst({
        where: { ID: input.id },
      });
      return product;
    }),

  create: publicProcedure
    .input(
      z.object({
        doc_num: z.string().min(1, "Document number is required"),
        transaction_date: z.string().min(1, "Transaction date is required"), 
        customer_id: z.string().min(1, "Customer ID is required"),
        admin_id: z.string().min(1, "Admin ID is required"),
        total_price: z.number().min(0, "Total price must be a non-negative number"),
        ref_doc_no: z.string().min(1, "Reference document number is required"),
        delivery_date: z.string().min(1, "Delivery date is required"), 
        shipping_method: z.string().min(1, "Remark is required"),
        comission: z.number().min(0, "Comision must be a non-negative number"),
        remark: z.string().min(1, "Remark is required"),
        status: z.string().min(1, "Status is required"),
        products: z.array(z.object({id:z.number(),quantity:z.number(),price:z.number()}))
      }),
    )

    .mutation(async ({ input, ctx }) => {
      console.log(input);

      const transactions = await ctx.db.transaction.create({
        data: {
          DOC_NUM: input.doc_num,
          TRANSACTION_DATE: new Date(input.transaction_date),
          CUSTOMER_ID: +input.customer_id,
          ADMIN_ID: +input.admin_id,
          TOTAL_PRICE: input.total_price,
          REF_DOC_NO: input.ref_doc_no,
          DELIVERY_DATE: input.delivery_date,
          SHIPPING_METHOD: input.shipping_method,
          COMISSION: input.comission,
          REMARK: input.remark,
          STATUS: input.status,
        },
      });

      const transactionDetail = await ctx.db.transactionDetail.createManyAndReturn({
        data: input.products.map((product)=>({TRANSACTION_ID:transactions.ID,PRODUCT_ID:product.id,QTY:product.quantity,UNIT_PRICE:product.price}))
          
        
      });

      return {
        success: true,
        message: "Sales Order created successfully",
      };
    }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),
        doc_num: z.string().min(1, "Document number is required").optional(),
        transaction_date: z.string().min(1, "Transaction date is required").optional(),
        customer_id: z.string().min(1, "Customer ID is required").optional(),
        admin_id: z.string().min(1, "Admin ID is required").optional(),
        total_price: z.number().min(0, "Total price must be a non-negative number").optional(),
        ref_doc_no: z.string().min(1, "Reference Document No is required").optional(),
        delivery_date: z.string().min(1, "Delivery date is required").optional(),
        shipping_method: z.string().min(1, "Shipping method is required").optional(),
        comission: z.number().min(0, "Comission must be a non-negative number").optional(),
        remark: z.string().min(1, "Remark is required").optional(),
        status: z.string().min(1, "Status is required").optional(),
        products: z.array(z.object({id: z.number(),quantity: z.number(),price: z.number(),})).optional(),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      // Find the existing transaction
      const transaction = await ctx.db.transaction.findUnique({
        where: { ID: input.id },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const updateData: any = {};
    if (input.doc_num) updateData.DOC_NUM = input.doc_num;
    if (input.transaction_date) updateData.TRANSACTION_DATE = new Date(input.transaction_date);
    if (input.customer_id) updateData.CUSTOMER_ID = +input.customer_id;
    if (input.admin_id) updateData.ADMIN_ID = +input.admin_id;
    if (input.total_price !== undefined) updateData.TOTAL_PRICE = input.total_price;
    if (input.ref_doc_no) updateData.REF_DOC_NO = input.ref_doc_no;
    if (input.delivery_date) updateData.DELIVERY_DATE = new Date(input.delivery_date);
    if (input.shipping_method) updateData.SHIPPING_METHOD = input.shipping_method;
    if (input.comission !== undefined) updateData.COMISSION = input.comission;
    if (input.remark) updateData.REMARK = input.remark;
    if (input.status) updateData.STATUS = input.status;

    // Perform the update
    const updatedTransaction = await ctx.db.transaction.update({
      where: { ID: input.id },
      data: updateData,
    });



      // returns true if succesfully updated
      return {
        success: true,
        message: `Transaction with ID ${input.id} updated successfully.`,
        updated: updatedTransaction,
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() })) // validate email format
    .mutation(async ({ input, ctx }) => {
      // Check if the product exists
      const product = await ctx.db.product.findFirst({
        where: { ID: +input.id },
      });

      // check if the product is found
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Delete the product
      await ctx.db.product.delete({
        where: { ID: input.id },
      });

      return {
        success: true,
        message: `Product ${input.id} deleted successfully.`,
      };
    }),
});
