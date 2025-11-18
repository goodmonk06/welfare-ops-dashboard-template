import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { logger } from "@/lib/core/logger";
import { metrics } from "@/lib/core/metrics";
import { emitEvent } from "@/lib/events/domain-events";

export const incidentRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          severity: z.string().optional(),
          residentId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};

      if (input?.status) filters.status = input.status;
      if (input?.severity) filters.severity = input.severity;
      if (input?.residentId) filters.residentId = input.residentId;

      const incidents = await ctx.prisma.incident.findMany({
        where: filters,
        orderBy: { occurredAt: "desc" },
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          resident: {
            select: {
              id: true,
              name: true,
              roomNumber: true,
            },
          },
        },
      });

      metrics.trackBusinessMetric("incidents.total", incidents.length);
      return incidents;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.incident.findUnique({
        where: { id: input.id },
        include: {
          reportedBy: true,
          resident: true,
          documents: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        occurredAt: z.date(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        category: z.string(),
        reportedById: z.string().optional(),
        residentId: z.string().optional(),
        location: z.string().optional(),
        witnesses: z.array(z.string()).optional(),
        actionsTaken: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Creating new incident", { title: input.title, severity: input.severity });

      const incident = await ctx.prisma.incident.create({
        data: {
          ...input,
          witnesses: input.witnesses || [],
          tags: input.tags || [],
        },
      });

      logger.logAudit("create", "Incident", incident.id, {
        title: incident.title,
        severity: incident.severity,
      });
      metrics.recordCounter("incidents.created", 1, { severity: incident.severity });

      // Emit domain event
      await emitEvent({
        type: "incident.created",
        timestamp: new Date(),
        data: {
          incidentId: incident.id,
          severity: incident.severity,
          residentId: incident.residentId || undefined,
          reportedById: incident.reportedById || undefined,
        },
      });

      return incident;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        category: z.string().optional(),
        status: z.enum(["reported", "investigating", "resolved", "closed"]).optional(),
        location: z.string().optional(),
        witnesses: z.array(z.string()).optional(),
        actionsTaken: z.string().optional(),
        preventiveMeasures: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      logger.info("Updating incident", { id });

      const incident = await ctx.prisma.incident.update({
        where: { id },
        data,
      });

      logger.logAudit("update", "Incident", incident.id, { changes: data });
      metrics.recordCounter("incidents.updated", 1);

      if (data.status === "resolved") {
        await emitEvent({
          type: "incident.resolved",
          timestamp: new Date(),
          data: {
            incidentId: incident.id,
            severity: incident.severity,
          },
        });
      }

      return incident;
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["reported", "investigating", "resolved", "closed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const incident = await ctx.prisma.incident.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      logger.logAudit("update_status", "Incident", incident.id, { status: input.status });

      if (input.status === "resolved") {
        await emitEvent({
          type: "incident.resolved",
          timestamp: new Date(),
          data: {
            incidentId: incident.id,
            severity: incident.severity,
          },
        });
      }

      return incident;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logger.warn("Deleting incident", { id: input.id });

      const incident = await ctx.prisma.incident.delete({
        where: { id: input.id },
      });

      logger.logAudit("delete", "Incident", incident.id, { title: incident.title });
      metrics.recordCounter("incidents.deleted", 1);

      return incident;
    }),
});
