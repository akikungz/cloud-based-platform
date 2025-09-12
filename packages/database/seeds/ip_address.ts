import { PrismaClient } from "../generated/prisma-client";

const prisma = new PrismaClient();

async function main() {
  // Seed your database with initial data
  await prisma.network.createMany({
    data: [
      {
        name: "v831",
        network: "10.20.31.0/24",
        gateway: "10.20.31.1"
      }, {
        name: "v832",
        network: "10.20.32.0/24",
        gateway: "10.20.32.1"
      }
    ]
  })

  const v831_ip = Array.from({ length: 254 }, (_, i) => `10.20.31.${i + 1}`);
  const v832_ip = Array.from({ length: 254 }, (_, i) => `10.20.32.${i + 1}`)

  // Fetch the network IDs for v831 and v832
  const v831 = await prisma.network.findFirst({ where: { name: "v831" } });
  const v832 = await prisma.network.findFirst({ where: { name: "v832" } });

  if (!v831 || !v832) {
    throw new Error("Required networks (v831, v832) not found. Make sure to run network seeding first.");
  }

  await prisma.ip_address.createMany({
    data: [
      ...v831_ip
        .map(ip => ({
          ip: ip,
          network_id: v831.id,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        }))
        .filter(ipObj => ipObj.ip !== v831.gateway), // Exclude the gateway IP
      ...v832_ip
        .map(ip => ({
          ip: ip,
          network_id: v832.id,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        }))
        .filter(ipObj => ipObj.ip !== v832.gateway), // Exclude the gateway IP
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });