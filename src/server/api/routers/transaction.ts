/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EmailTemplate } from "~/app/_components/email-template";
import { Resend } from "resend";
import { Parser } from "json2csv";

const resend = new Resend(process.env.RESEND_API_KEY);

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const admin = await ctx.db.admin.findUnique({
        where: { ID: input.userId },
      });

      const isSalesperson = admin?.ROLE.toLowerCase() === "salesperson";

      const sales = await ctx.db.transaction.findMany({
        where: isSalesperson ? { ADMIN_ID: input.userId } : undefined,
        include: {
          ADMIN: true,
          CUSTOMER: true,
          TransactionDetail: true,
        },
      });

      return sales;
    }),

  getOne: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const transaction = await ctx.db.transaction.findUnique({
        where: { ID: input.id },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const admin = await ctx.db.admin.findUnique({
        where: { ID: transaction.ADMIN_ID },
      });

      const customer = await ctx.db.customer.findUnique({
        where: { ID: transaction.CUSTOMER_ID },
      });

      const details = await ctx.db.transactionDetail.findMany({
        where: { TRANSACTION_ID: transaction.ID },
      });

      const products = await Promise.all(
        details.map(async (detail) => {
          const product = await ctx.db.product.findUnique({
            where: { ID: detail.PRODUCT_ID },
          });

          return { ...detail, NAME: product?.NAME };
        }),
      );

      return {
        ...transaction,
        ADMIN: admin,
        CUSTOMER: customer,
        PRODUCTS: products,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        doc_num: z.string().min(1, "Document number is required"),
        transaction_date: z.string().min(1, "Transaction date is required"),
        customer_id: z.string().min(1, "Customer ID is required"),
        admin_id: z.string().min(1, "Admin ID is required"),
        total_price: z
          .number()
          .min(0, "Total price must be a non-negative number"),
        ref_doc_no: z.string().min(1, "Reference document number is required"),
        delivery_date: z.string().min(1, "Delivery date is required"),
        shipping_method: z.string().min(1, "Remark is required"),
        comission: z.number().min(0, "Comision must be a non-negative number"),
        remark: z.string().optional(),
        deliveryLocation: z.string(),
        products: z.array(
          z.object({ id: z.number(), quantity: z.number(), price: z.number() }),
        ),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      // Step 1: Check stock availability for each product
      const insufficientStock: {
        id: number;
        requested: number;
        available: number;
      }[] = [];

      for (const product of input.products) {
        const existingProduct = await ctx.db.product.findUnique({
          where: { ID: product.id },
          select: { STOCK: true },
        });

        const available = existingProduct?.STOCK ?? 0;

        if (product.quantity > available) {
          insufficientStock.push({
            id: product.id,
            requested: product.quantity,
            available,
          });
        }
      }

      // Step 2: If any product has insufficient stock, stop the process
      if (insufficientStock.length > 0) {
        throw new Error(
          `Insufficient stock for product(s): ${insufficientStock
            .map(
              (p) =>
                `Product ID ${p.id} (requested: ${p.requested}, available: ${p.available})`,
            )
            .join(", ")}`,
        );
      }

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
          LOCATION: input.deliveryLocation,
          STATUS: "PENDING",
        },
      });

      const transactionDetail =
        await ctx.db.transactionDetail.createManyAndReturn({
          data: input.products.map((product) => ({
            TRANSACTION_ID: transactions.ID,
            PRODUCT_ID: product.id,
            QTY: product.quantity,
            UNIT_PRICE: product.price,
          })),
        });

      for (const product of input.products) {
        await ctx.db.product.update({
          where: { ID: product.id },
          data: {
            STOCK: {
              decrement: product.quantity,
            },
          },
        });
      }

      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["heinhtetnaing186@gmail.com"],
        subject: `New Sales ${transactions.ID}`,
        react: EmailTemplate({ sales: transactions }),
      });

      return new Promise((resolve) => {
        resolve({
          success: true,
          message: `Transaction with ID ${transactions.ID} created successfully.`,
          transaction: transactions,
          transactionDetail: transactionDetail,
        });
      });
    }),
  edit: publicProcedure
    .input(
      z.object({
        transaction_id: z.number().min(1, "Transaction ID is required"),
        doc_num: z.string().min(1, "Document number is required"),
        transaction_date: z.string().min(1, "Transaction date is required"),
        customer_id: z.string().min(1, "Customer ID is required"),
        admin_id: z.string().min(1, "Admin ID is required"),
        total_price: z
          .number()
          .min(0, "Total price must be a non-negative number"),
        ref_doc_no: z.string().min(1, "Reference document number is required"),
        delivery_date: z.string().min(1, "Delivery date is required"),
        shipping_method: z.string().min(1, "Shipping method is required"),
        comission: z
          .number()
          .min(0, "Commission must be a non-negative number"),
        remark: z.string().optional(),
        products: z.array(
          z.object({ id: z.number(), quantity: z.number(), price: z.number() }),
        ),
        deliveryLocation: z.string(),
        status: z.string().min(1, "Status is required"),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      const existingTransaction = await ctx.db.transaction.findUnique({
        where: { ID: input.transaction_id },
      });

      if (!existingTransaction) {
        throw new Error(
          `Transaction with ID ${input.transaction_id} not found.`,
        );
      }

      // Update the transaction in the database
      const updatedTransaction = await ctx.db.transaction.update({
        where: { ID: input.transaction_id }, // Ensure the ID matches
        data: {
          DOC_NUM: input.doc_num,
          TOTAL_PRICE: input.total_price,
          REF_DOC_NO: input.ref_doc_no,
          DELIVERY_DATE: input.delivery_date,
          SHIPPING_METHOD: input.shipping_method,
          COMISSION: input.comission,
          REMARK: input.remark,
          LOCATION: input.deliveryLocation,
          STATUS: input.status, // You can modify this status if needed
        },
      });

      // First, delete existing transaction details before adding the new ones
      await ctx.db.transactionDetail.deleteMany({
        where: { TRANSACTION_ID: input.transaction_id },
      });

      // Add the new products to the transaction
      const updatedTransactionDetails =
        await ctx.db.transactionDetail.createMany({
          data: input.products.map((product) => ({
            TRANSACTION_ID: updatedTransaction.ID,
            PRODUCT_ID: product.id,
            QTY: product.quantity,
            UNIT_PRICE: product.price,
          })),
        });

      // ✅ Send email if status changed
      if (existingTransaction.STATUS !== input.status) {
        await resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to: ["heinhtetnaing186@gmail.com"],
          subject: `Updated Sales Status : ${updatedTransaction.ID}`,
          react: EmailTemplate({ sales: updatedTransaction }),
        });
      }

      return new Promise((resolve) => {
        resolve({
          success: true,
          message: `Transaction with ID ${updatedTransaction.ID} updated successfully.`,
          transaction: updatedTransaction,
          transactionDetail: updatedTransactionDetails,
        });
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        transaction_id: z.number().min(1, "Transaction ID is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transactionId = input.transaction_id;

      // First, delete the related transaction details
      await ctx.db.transactionDetail.deleteMany({
        where: { TRANSACTION_ID: transactionId },
      });

      // Then, delete the main transaction
      const deletedTransaction = await ctx.db.transaction.delete({
        where: { ID: transactionId },
      });

      return {
        success: true,
        message: `Transaction with ID ${transactionId} deleted successfully.`,
        deletedTransaction,
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const searchResults = await ctx.db.transaction.findMany({
        where: {
          OR: [
            { DOC_NUM: { contains: input.query, mode: "insensitive" } },
            {
              CUSTOMER: {
                NAME: { contains: input.query, mode: "insensitive" },
              },
            },
          ],
        },
        include: {
          ADMIN: true,
          CUSTOMER: true,
          TransactionDetail: true,
        },
      });

      return searchResults;
    }),

  getCsv: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    const data = await ctx.db.transaction.findMany();

    const parser = new Parser();
    const csv = parser.parse(data);

    return csv ; // We'll return as string
  }),
});
