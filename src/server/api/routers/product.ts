import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { ProductType, UserType } from "~/lib/types";
import { randomUUID } from "crypto";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany();
    // const customers = await ctx.db.customer.findMany();

    //@ts-expeect-error any
    return { products };
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
        code: z.string().min(1, "Code is required"),
        name: z.string().min(1, "Name is required"),
        category: z.string().min(1, "Category is required"),
        base_uom: z.string().min(1, "Base UOM is required"),
        stock: z.number().min(0, "Stock must be a non-negative number"),
        unit_price: z
          .number()
          .min(0, "Unit Price must be a non-negative number"),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const existingProduct = await ctx.db.product.findFirst({
        where: { CODE: input.code },
      });

      console.log(existingProduct);

      if (existingProduct) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Product Code is already registered",
        });
      }

      const newProduct = await ctx.db.product.create({
        data: {
          NAME: input.name,
          CATEGORY: input.category,
          STOCK: input.stock,
          BASE_UOM: input.base_uom,
          UNIT_PRICE: input.unit_price,
          CODE: input.code,
        },
      });

      return {
        success: true,
        message: "User created successfully",
        product: newProduct,
      };
    }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),

        // optional so that the admin can choose which data to change
        code: z.string().min(1, "Code is required").optional(),
        name: z.string().min(1, "Name is required").optional(),
        category: z.string().min(1, "Category is required").optional(),
        base_uom: z.string().min(1, "Base UOM is required").optional(),
        stock: z
          .number()
          .min(0, "Stock must be a non-negative number")
          .optional(),
        unit_price: z
          .number()
          .min(0, "Unit Price must be a non-negative number")
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // finding the user using ID
      const product = await ctx.db.product.findUnique({
        where: { ID: input.id },
      });

      // if product does not exist, return error message
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // an empty object to fill the updated data
      const updateData: ProductType = {} as ProductType;

      // checking each field to see if any of the data has been updated
      if (input.name) updateData.NAME = input.name;
      if (input.code) updateData.CODE = input.code;
      if (input.category) updateData.CATEGORY = input.category;
      if (input.base_uom) updateData.BASE_UOM = input.base_uom + "";
      if (input.stock) updateData.STOCK = input.stock;
      if (input.unit_price) updateData.UNIT_PRICE = input.unit_price;

      // update the database using the user id
      const updatedProduct = await ctx.db.product.update({
        where: { ID: input.id },
        data: updateData,
      });

      // returns true if succesfully updated
      return {
        success: true,
        message: `Product with ID ${input.id} updated successfully.`,
        user: updatedProduct,
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
