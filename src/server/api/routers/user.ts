import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Admin, Customer } from "~/lib/types";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findMany();
    const customers = await ctx.db.customer.findMany();

    return { admin, customers } as { admin: Admin[]; customers: Customer[] };
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
