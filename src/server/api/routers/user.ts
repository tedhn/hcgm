import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { CustomerType, UserType } from "~/lib/types";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findMany();
    const customers = await ctx.db.customer.findMany();

    //@ts-expeect-error any
    return { admin, customers } as {
      admin: UserType[];
      customers: CustomerType[];
    };
  }),

  getAllCustomers: publicProcedure.query(async ({ ctx }) => {
    const customers = await ctx.db.customer.findMany();
    return customers;
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const admin = await ctx.db.admin.findFirst({
        where: { ID: input.id },
      });
      return admin;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.number().min(10, "Phone Number is invalid"),
        role: z.string().min(1, "Invalid role"),
        code: z.string().min(1, "Invalid Code"),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      // Check if a user with the same email already exists

      console.log(input);
      const existingUser = await ctx.db.admin.findFirst({
        where: { EMAIL: input.email },
      });

      console.log(existingUser);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already registered",
        });
      }

      const newUser = await ctx.db.admin.create({
        data: {
          NAME: input.name,
          EMAIL: input.email,
          PASSWORD: input.password, // For security: consider hashing passwords
          PHONE: input.phone + "",
          ROLE: input.role,
          CODE: input.code,
        },
      });

      return {
        success: true,
        message: "User created successfully",
        user: newUser,
      };
    }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),

        // optional so that the admin can choose which data to change
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email").optional(),
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
        phone: z.number().min(10, "Phone number is invalid").optional(),
        role: z.string().min(1, "Invalid role").optional(),
        code: z.string().min(1, "Invalid Code").optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // finding the user using ID
      const user = await ctx.db.admin.findUnique({
        where: { ID: input.id },
      });

      // if user does not exist, return error message
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // an empty object to fill the updated data
      const updateData: UserType = {} as UserType;

      // checking each field to see if any of the data has been updated
      if (input.name) updateData.NAME = input.name;
      if (input.email) updateData.EMAIL = input.email;
      if (input.password) updateData.PASSWORD = input.password;
      if (input.phone) updateData.PHONE = input.phone + "";
      if (input.role) updateData.ROLE = input.role;
      if (input.code) updateData.CODE = input.code;

      // update the database using the user id
      const updatedUser = await ctx.db.admin.update({
        where: { ID: input.id },
        data: updateData,
      });

      // returns true if succesfully updated
      return {
        success: true,
        message: `User with ID ${input.id} updated successfully.`,
        user: updatedUser,
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() })) // validate email format
    .mutation(async ({ input, ctx }) => {
      // Check if the admin exists
      const user = await ctx.db.admin.findFirst({
        where: { ID: +input.id },
      });

      // check if the user is found
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Delete the user
      await ctx.db.admin.delete({
        where: { ID: input.id },
      });

      return {
        success: true,
        message: `User with email ${input.id} deleted successfully.`,
      };
    }),

  login: publicProcedure.input(LoginSchema).mutation(async ({ input, ctx }) => {
    console.log("input", input);

    const user = await ctx.db.admin.findFirst({
      where: {
        EMAIL: input.email,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.PASSWORD !== input.password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }

    return user;
  }),
});
