import { type Admin } from "@prisma/client";

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { CustomerType, UserType } from "~/lib/types";
import { Resend } from "resend";
import { EmailTemplate } from "~/app/_components/email-template";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      console.log(input.email);
      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: [input.email],
        subject: "Hello world",
        react: EmailTemplate({ firstName: "TED TESTING" }),
      });

      console.log(data);

      console.log("FINDME");
      console.log(error);

      // return { };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findMany();
    const customers = await ctx.db.customer.findMany();

    const safeAdmin = admin.map((a: Admin) => {
      return {
        ID: a.ID,
        NAME: a.NAME,
        EMAIL: a.EMAIL,
        PHONE: a.PHONE,
        ROLE: a.ROLE,
        CODE: a.CODE,
      };
    });

    //@ts-expeect-error any
    return { safeAdmin, customers } as {
      safeAdmin: UserType[];
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
        password: z
          .string()
          .min(6, "Password must be at least 6 characters")
          .optional(),
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
      const updateData: Admin = {} as Admin;

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
