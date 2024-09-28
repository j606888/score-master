import { PrismaClient } from "@prisma/client";

BigInt.prototype.toJSON = function() {       
  return this.toString()
}

const prismaClientSingleton = () => {
  return new PrismaClient();
}

const prisma = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
