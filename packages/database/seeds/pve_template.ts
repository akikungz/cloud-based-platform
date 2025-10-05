import { PrismaClient } from "../generated/prisma-client";

const prisma = new PrismaClient();

async function main() {
  // Seed your database with initial data
  await prisma.pve_node.createMany({
    data: [
      {
        name: "pve-1",
        status: "online"
      },
      {
        name: "pve-2",
        status: "online"
      },
      {
        name: "pve-3",
        status: "online"
      },
      {
        name: "pve-4",
        status: "online"
      },
      {
        name: "pve-5",
        status: "online"
      },
      {
        name: "pve-6",
        status: "online"
      },
      {
        name: "pve-7",
        status: "online"
      },
      {
        name: "pve-8",
        status: "online"
      },
      {
        name: "pve-9",
        status: "online"
      },
      {
        name: "pve-10",
        status: "online"
      },
    ]
  });

  await prisma.instance_template.createMany({
    data: [
      {
        os_name: "Ubuntu 24.04 LTS",
        vm_type: "qemu",
        vm_template_id: "101",
        vm_template_host: "pve-1",
        based_size: 3.50
      }
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