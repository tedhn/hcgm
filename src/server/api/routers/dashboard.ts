import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  getForecast: publicProcedure.query(async ({ ctx }) => {
    const mt = await ctx.db.regional_forecast_mt.findMany();
    const costing = await ctx.db.regional_forecast_costing.findMany();

    return { mt, costing };
  }),

  updateForecast: publicProcedure
    .input(
      z.object({
        id: z.number(),
        item_group: z.string(),
        central: z.number(),
        e_coast: z.number(),
        south: z.number(),
        north: z.number(),
        type: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.type === "MT") {
        await ctx.db.regional_forecast_mt.update({
          where: { id: input.id },
          data: {
            central: input.central,
            e_coast: input.e_coast,
            north: input.north,
            south: input.south,
          },
        });
      } else {
        await ctx.db.regional_forecast_costing.update({
          where: { id: input.id },
          data: {
            central: input.central,
            e_coast: input.e_coast,
            north: input.north,
            south: input.south,
          },
        });
      }
    }),
});
