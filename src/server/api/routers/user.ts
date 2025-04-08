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


  edit: 
  publicProcedure  
  .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      
      
      
      // do something here
      


      // return back the edited user
      return {
        name: input.name,
      };
    }),

  delete: publicProcedure
    .input(z.object({id:z.string()})) // validate email format
    .mutation(async ({ input, ctx }) => {
      // Check if the admin exists
      const user = await ctx.db.admin.findFirst({
        where: { id: input.id},
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
        where: { email: input.id },
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
