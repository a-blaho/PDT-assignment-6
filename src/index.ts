import { prisma } from "./common";
import { exportConversations } from "./conversations";
import { exportOthers } from "./others";

async function main() {
  await exportConversations();
  await exportOthers();
}

main().then(async () => {
  await prisma.$disconnect();
});
