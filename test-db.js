const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log("Accounts:", await prisma.account.findMany());
  console.log("Users:", await prisma.user.findMany());
}
main().finally(() => prisma.$disconnect());
