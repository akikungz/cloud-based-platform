import { instance } from "./http_client";
import { RetryHandler, TaskError, ValidationError } from "@yuzu/libs/errors";
import { logger } from "@yuzu/libs/log";

/**
 * Waits for a PVE task to complete and returns its exit status.
 * @param node The node where the task is running.
 * @param upid The unique process ID of the task.
 * @returns A promise that resolves with the exit status of the task.
 * @throws An error if the task fails with a non-OK exit status.
 */
export const task_status = async (node: string, upid: string) => {
	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!upid?.trim()) {
		throw new ValidationError('Task UPID is required', 'upid', upid);
	}

	const context = {
		operation: 'task_status',
		node,
		requestId: `task-${upid}`,
		additional: { upid }
	};

	return new Promise<string>((resolve, reject) => {
		let attempts = 0;
		const maxAttempts = 300; // 5 minutes timeout (300 * 1000ms)

		const interval = setInterval(async () => {
			attempts++;

			try {
				const { data: task } = await instance({
					path: "/nodes/:node/tasks/:upid/status",
					method: "GET",
					params: { node, upid },
				});

				if (task.data.status === "stopped") {
					clearInterval(interval);

					if (task.data.exitstatus) {
						if (task.data.exitstatus !== "OK") {
							const error = new TaskError(
								`Task ${upid} failed with exit status: ${task.data.exitstatus}`,
								upid,
								task.data.exitstatus,
								{ node, operation: 'task_status' }
							);
							return reject(error);
						}
						return resolve(task.data.exitstatus);
					}

					const error = new TaskError(
						`Task ${upid} completed with unknown exit status`,
						upid,
						'<unknown>',
						{ node, operation: 'task_status' }
					);
					return reject(error);
				}

				// Check for timeout
				if (attempts >= maxAttempts) {
					clearInterval(interval);
					const error = new TaskError(
						`Task ${upid} timed out after ${maxAttempts} seconds`,
						upid,
						'timeout',
						{ node, operation: 'task_status', attempts }
					);
					return reject(error);
				}
			} catch (error) {
				// If we get an error checking task status, it might be a network issue
				// Log it but continue trying unless we've hit max attempts
				if (attempts >= maxAttempts) {
					clearInterval(interval);
					return reject(error);
				}

				logger.warn({
					error,
					attempt: attempts,
					maxAttempts,
					node,
					upid
				}, 'Error checking task status');
			}
		}, 1000);
	});
};

export * as qemu from "./qemu";
