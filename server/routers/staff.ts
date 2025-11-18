import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

export const staffRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.staff.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        role: z.string(),
        email: z.string().email(),
        phoneNumber: z.string().optional(),
        hireDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.staff.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.staff.delete({
        where: { id: input.id },
      });
    }),
});
