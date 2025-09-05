import { pve_instance } from "@yuzu/libs/pve/http_client";
import type { AxiosError } from "axios";
import { error_handler } from "utils";

console.time("Cloud-init status check");
const interval = setInterval(async () => {
  const callback = async () => await pve_instance.get("/nodes/pve-5/qemu/1001/agent/info");

  const [err, res] = await error_handler<typeof callback, AxiosError>(callback);

  if (!err) {
    if (res) {
      // Handle successful response
      console.log("Cloud-init status:", res.data);
    }
    clearInterval(interval);
    console.timeEnd("Cloud-init status check");
  } else {
    console.log("Error fetching cloud-init status:", err.response?.status);
  }
}, 1000);