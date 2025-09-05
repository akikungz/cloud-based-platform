import { qemu, task_status } from "@yuzu/libs/pve";
import type { PVE_Disk_Resize, PVE_Interface_Config, PVE_Network_Config } from "@yuzu/libs/pve/types";
import { pick } from "utils";

// Simulate 10 Machine
const target = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `pve-${i}`);

const disks: PVE_Disk_Resize[] = ["+4.5G", "+12.5G", "+20.5G", "+28.5G"];
const memory = [1024];

const newid = Array(28).fill(0).map((_, index) => index + 1000)
  .map((id, index) => {
    const ip: PVE_Network_Config = `ip=10.20.33.${index + 10}/${24},gw=10.20.33.1`;
    const bridge: PVE_Interface_Config = `model=virtio,bridge=v833`;

    return {
      id,
      index,
      name: `test-qemu-${id}`,
      target: target[Math.round(Math.random() * (target.length - 1))],
      // target: "pve-10",
      size: disks[Math.round(Math.random() * (disks.length - 1))],
      cores: Math.floor(Math.random() * 8) + 1, // Between 1 and 8
      memory: memory[Math.floor(Math.random() * memory.length)],
      ipconfig0: ip,
      net0: bridge
    };
  });

const task_keeper: Array<{
  id: number;
  name: string;
  message: string;
  duration: number;
}> = [];

const task = async (item: typeof newid[number], {
  resolve,
  reject
}: {
  resolve: (value: Record<string, any>) => void;
  reject: (reason: Record<string, any>) => void;
}) => {
  const start = Date.now();
  // await new Promise((resolve) => setTimeout(resolve, item.index * 5000));
  const clone_task = await qemu.clone({
    node: "pve-1",
    vmid: 101,
    target: item.target,
    newid: item.id,
    name: item.name,
  });

  const clone_status = await task_status("pve-1", clone_task.data);
  if (clone_status !== "OK") {
    return reject({
      id: item.id,
      name: item.name,
      message: `Task '${item.name}' failed at cloning process`,
      duration: Date.now() - start
    });
  }

  const config_task = await qemu.config({
    vmid: item.id,
    node: item.target,
    ...pick(item, ["ipconfig0", "net0", "cores", "memory"]),
  });

  const config_status = await task_status(item.target, config_task.data);
  if (config_status !== "OK") {
    return reject({
      id: item.id,
      name: item.name,
      message: `Task '${item.name}' failed at configuration process`,
      duration: Date.now() - start
    });
  }

  const resize_task = await qemu.resize({
    vmid: item.id,
    node: item.target,
    size: item.size
  });

  const resize_status = await task_status(item.target, resize_task.data);
  if (resize_status !== "OK") {
    return reject({
      id: item.id,
      name: item.name,
      message: `Task '${item.name}' failed at resizing process`,
      duration: Date.now() - start
    });
  }

  const start_qemu_task = await qemu.setStatusQEMU({
    node: item.target,
    vmid: item.id,
    state: "start"
  });

  const start_qemu_status = await task_status(item.target, start_qemu_task.data);
  if (start_qemu_status !== "OK") {
    return reject({
      id: item.id,
      name: item.name,
      message: `Task '${item.name}' failed at starting process`,
      duration: Date.now() - start
    });
  }

  return resolve({
    id: item.id,
    name: `${item.name}@${item.target}`,
    message: `Task '${item.name}' completed successfully`,
    duration: Date.now() - start,
  });
}

console.time("Clone QEMU VMs");
const result = await Promise.allSettled(newid.map(async (item) => new Promise((resolve, reject) => task(item, { resolve, reject }))));

// Show results as table with average time
console.table(
  [
    ...result.map((res, index) => ({
      ...(
        res.status === "fulfilled"
        ? { ...(res.value as Record<string, any>) }
        : { ...(res.reason as Record<string, any>) }
      )
    })),
    {
      // Avg
      id: "-",
      name: "Average",
      duration: `${
        result.reduce((acc, res) => {
          if (res.status === "fulfilled") {
            return acc + (res.value as Record<string, any>).duration;
          }
          return acc + (res.reason as Record<string, any>).duration;
        }, 0) / result.length
      } ms`
    }
  ]
);

console.timeEnd("Clone QEMU VMs");
