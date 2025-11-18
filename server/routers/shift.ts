import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

export const shiftRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.shift.findMany({
      include: { staff: true },
      orderBy: { date: "desc" },
    });
  }),

  getByMonth: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      return await ctx.prisma.shift.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { staff: true },
        orderBy: { date: "asc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        staffId: z.string(),
        date: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        shiftType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.shift.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.shift.delete({
        where: { id: input.id },
      });
    }),
});
