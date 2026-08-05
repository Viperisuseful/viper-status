import { z } from "zod";

export const heartbeatSchema = z
  .object({
    status: z.number(),
    time: z.string(),
    msg: z.string().optional().nullable(),
    ping: z.number().optional().nullable(),
    important: z.boolean().optional(),
  })
  .passthrough();

export const statusPageSchema = z
  .object({
    incident: z.unknown().optional().nullable(),
    incidents: z.array(z.unknown()).optional(),
    publicGroupList: z.array(
      z
        .object({
          monitorList: z.array(
            z
              .object({
                id: z.number(),
                name: z.string(),
              })
              .passthrough(),
          ),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const heartbeatResponseSchema = z
  .object({
    heartbeatList: z.record(z.string(), z.array(heartbeatSchema)),
    uptimeList: z.record(z.string(), z.number()),
  })
  .passthrough();

export const incidentHistorySchema = z
  .object({
    incidentList: z.array(z.unknown()).optional(),
    incidents: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type KumaStatusPage = z.infer<typeof statusPageSchema>;
export type KumaHeartbeatResponse = z.infer<typeof heartbeatResponseSchema>;

