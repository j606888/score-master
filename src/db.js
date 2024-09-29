import { PrismaClient } from "@prisma/client";

const isLocal = process.env.APP_ENV === 'local'

BigInt.prototype.toJSON = function() {       
  return Number(this)
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isLocal ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  });
}

const prisma = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
