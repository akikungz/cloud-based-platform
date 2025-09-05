import { qemu, task_status } from "@yuzu/libs/pve";

const vm = Array(28).fill(0).map((_, index) => 1000 + index);

const tasks: Array<Record<string, any>> = [];

// const delete_vms = async () => {
//   for (const id of vm) {
//     const temp_task: any = {};
//     const time_start = Date.now();
//     const get_status = await qemu.getStatusQEMU({
//       vmid: id,
//       node: "pve-1"
//     });

//     if (get_status.data.status === "running") {
//       const set_task = await qemu.setStatusQEMU({
//         vmid: id,
//         node: "pve-1",
//         state: "stop"
//       });
  
//       const set_status = await task_status("pve-1", set_task.data);
//       temp_task.set_status = set_status;
//     }

//     const del_task = await qemu.deleteQEMU({
//       vmid: id,
//       node: "pve-1"
//     });

//     const del_status = await task_status("pve-1", del_task.data);
//     temp_task.del_status = del_status;

//     tasks.push({ id, duration: `${Date.now() - time_start}ms`, ...temp_task });
//   }
// };

const delete_vm = async (id: number, resolve: (value: any) => void) => {
  const time_start = Date.now();

  const get_status = await qemu.getStatusQEMU({
    vmid: id,
    node: "pve-1"
  });

  if (get_status.data.status === "running") {
    const set_task = await qemu.setStatusQEMU({
      vmid: id,
      node: "pve-1",
      state: "stop"
    });

    await task_status("pve-1", set_task.data);
  }

  const del_task = await qemu.deleteQEMU({
    vmid: id,
    node: "pve-1"
  });

  await task_status("pve-1", del_task.data);
  resolve({
    vmid: id,
    duration: Date.now() - time_start
  });
};

console.time("Delete QEMU VMs");
const delete_vms = await Promise.allSettled([
  ...vm.map((id) => new Promise((resolve) => {
    delete_vm(id, resolve);
  }))
]);

// Show results as table with average time
console.table(
  [
    ...delete_vms.map((res, index) => ({
      ...(
        res.status === "fulfilled"
        ? { ...(res.value as Record<string, any>) }
        : { ...(res.reason as Record<string, any>) }
      )
    })),
    {
      // Avg
      duration: `${
        delete_vms.reduce((acc, res) => {
          if (res.status === "fulfilled") {
            return acc + (res.value as Record<string, any>).duration;
          }
          return acc + (res.reason as Record<string, any>).duration;
        }, 0) / delete_vms.length
      } ms`
    }
  ]
);

console.timeEnd("Delete QEMU VMs");
