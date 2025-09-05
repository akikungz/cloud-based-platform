import { instance } from "./http_client";

/**
 * Waits for a PVE task to complete and returns its exit status.
 * @param node The node where the task is running.
 * @param upid The unique process ID of the task.
 * @returns A promise that resolves with the exit status of the task.
 * @throws An error if the task fails with a non-OK exit status.
 */
export const task_status = async (node: string, upid: string) =>
	new Promise<string>((resolve, reject) => {
		const interval = setInterval(async () => {
			const { data: task } = await instance({
				path: "/nodes/:node/tasks/:upid/status",
				method: "GET",
				params: { node, upid },
			});

			// console.info("PVE task status:", task);
			if (task.data.status === "stopped") {
				// console.info("PVE task status:", task.data);
				clearInterval(interval);
				if (task.data.exitstatus) {
					if (task.data.exitstatus !== "OK") {
						return reject(task.data.exitstatus);
					}
					return resolve(task.data.exitstatus);
				}
				return reject("<unknown>");
			}
		}, 1000);
	});

export * as qemu from "./qemu";
