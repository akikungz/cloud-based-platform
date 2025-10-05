import { checkAgentInstalled } from "@yuzu/libs/pve/qemu";

checkAgentInstalled({
  node: "pve-10",
  vmid: 1010,
}).then(console.log).catch(console.error);