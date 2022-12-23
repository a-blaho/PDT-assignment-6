import { PrismaClient } from "@prisma/client";

export function toObjectId(value: bigint) {
  return { $oid: value.toString().padEnd(24, "a") };
}

export const prisma = new PrismaClient();

export const createdAt = {
  gte: new Date("2022-02-24"),
  lt: new Date("2022-02-25"),
};
