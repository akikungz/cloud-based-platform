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
			const task = await instance({
				path: "/nodes/:node/tasks/:upid/status",
				method: "GET",
				params: { node, upid },
			});

			if (task.data.status === "stopped") {
				if (task.data.exitstatus) {
					if (task.data.exitstatus !== "OK") {
						reject(
							new Error(
								`Task failed with exit status: ${task.data.exitstatus}`,
							),
						);
					}
					resolve(task.data.exitstatus);
					clearInterval(interval);
				}
			}
		}, 1000);
	});

export * as qemu from "./qemu";
