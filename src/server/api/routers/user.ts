import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Admin } from "~/lib/types";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findMany();
    // const customers = await ctx.db.customer.findMany();

    //@ts-expeect-error any
    return { admin } as { admin: Admin[] };
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
      const existingUser = await ctx.db.admin.findFirst({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already registered",
        });
      }

      const newUser = await ctx.db.admin.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password, // For security: consider hashing passwords
          phone: input.phone + "",
          role: input.role,
          code: input.code,
        },
      });

      return {
        success: true,
        message: "User created successfully",
        user: newUser,
      };
    }),

  //   edit:
  //   publicProcedure
  //   .input(z.object({ name: z.string() }))
  //     .mutation(async ({ input }) => {

  //       // do something here

  //       // return back the edited user
  //       return {
  //         name: input.name,
  //       };
  //     }),

  delete: publicProcedure
    .input(z.object({ id: z.number() })) // validate email format
    .mutation(async ({ input, ctx }) => {
      // Check if the admin exists
      const user = await ctx.db.admin.findFirst({
        where: { id: +input.id },
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
        where: { id: input.id },
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
        email: input.email,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.password !== input.password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }

    return user;
  }),
});
