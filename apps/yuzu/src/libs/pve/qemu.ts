import { instance } from "./http_client";
import type {
	PVE_API_Template,
	PVE_Disk_Resize,
	PVE_Interface_Config,
	PVE_Network_Config,
} from "./types";
import { RetryHandler, PVEAPIError, ValidationError } from "@yuzu/libs/errors";

export interface CloneQEMUProps {
	node: string;
	vmid: number;
	target: string;
	newid: number;
	name: string;
	full?: boolean;
}

/**
 * Clones a QEMU in Proxmox VE.
 * @param node The node where the QEMU is located.
 * @param vmid The ID of the QEMU to clone.
 * @param target The target storage for the clone.
 * @param newid The new ID for the cloned QEMU.
 * @param name The hostname for the cloned QEMU.
 * @return A promise that resolves with the task details of the clone operation.
 * @throws An error if the clone operation fails.
 */
export const clone = async ({
	node,
	vmid,
	target,
	newid,
	name,
	full,
}: CloneQEMUProps) => {
	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}
	if (!target?.trim()) {
		throw new ValidationError('Target storage is required', 'target', target);
	}
	if (!newid || newid <= 0) {
		throw new ValidationError('Valid new VM ID is required', 'newid', newid);
	}
	if (!name?.trim()) {
		throw new ValidationError('VM name is required', 'name', name);
	}

	const context = {
		operation: 'qemu_clone',
		node,
		vmid,
		requestId: `clone-${vmid}-${newid}`,
		additional: { target, newid, name, full }
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid/clone",
			method: "POST",
			params: { node, vmid },
			body: { target, newid, name, full },
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to clone QEMU ${vmid} to ${newid}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}/clone`,
				'POST',
				{ target, newid, name, full }
			);
		}

		return task.data;
	}, context);
};

export interface ResizeQEMUProps {
	node: string;
	vmid: number;
	size: PVE_Disk_Resize;
}

/**
 * Resizes the disk of a QEMU in Proxmox VE.
 * @param node The node where the QEMU is located.
 * @param vmid The ID of the QEMU to resize.
 * @param size The new size for the disk, formatted as a string (e.g., "+10G", "+512M", "+1024K").
 * @return A promise that resolves with the task details of the resize operation.
 * @throws An error if the resize operation fails.
 */
export const resize = async ({ node, vmid, size }: ResizeQEMUProps) => {
	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}
	if (!size || !size.match(/^\+\d+[GMK]$/)) {
		throw new ValidationError('Valid size format is required (e.g., +10G, +512M)', 'size', size);
	}

	const context = {
		operation: 'qemu_resize',
		node,
		vmid,
		requestId: `resize-${vmid}`,
		additional: { size }
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid/resize",
			method: "PUT",
			params: { node, vmid },
			body: { disk: "scsi0", size },
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to resize QEMU ${vmid} disk by ${size}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}/resize`,
				'PUT',
				{ size }
			);
		}

		return task.data;
	}, context);
};

export interface ConfigQEMUProps {
	// Params
	node: string;
	vmid: number;
	// Body
	ipconfig0?: PVE_Network_Config; // Network configuration
	net0?: PVE_Interface_Config; // Interface configuration
	cicustom?: string; // Cloud-init custom configuration
	ciuser?: string; // Cloud-init user
	cipassword?: string; // Cloud-init password
	sshkeys?: string; // SSH keys for cloud-init
	cores?: number; // Number of CPU cores
	memory?: number; // Memory in MB
}

/**
 * Configures a QEMU in Proxmox VE.
 * @param node The node where the QEMU is located.
 * @param vmid The ID of the QEMU to configure.
 * @param ipconfig0 Optional network configuration string.
 * @param ciuser Optional cloud-init user.
 * @param cipassword Optional cloud-init password.
 * @param sshkeys Optional SSH keys for cloud-init.
 * @param cores Optional number of CPU cores.
 * @param memory Optional memory size in MB.
 * @return A promise that resolves with the task details of the configuration operation.
 * @throws An error if the configuration operation fails.
 */
export const config = async (spec: ConfigQEMUProps) => {
	const { node, vmid, ...body } = spec;

	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}

	const context = {
		operation: 'qemu_config',
		node,
		vmid,
		requestId: `config-${vmid}`,
		additional: { configKeys: Object.keys(body) }
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid/config",
			method: "POST",
			params: { node, vmid },
			body: {
				...body,
				sshkeys: body.sshkeys && encodeURIComponent(body.sshkeys),
				cicustom: "user=cephfs:snippets/allow_ssh.yaml", // Use the SSH password authentication configuration snippet
			},
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to configure QEMU ${vmid}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}/config`,
				'POST',
				{ configKeys: Object.keys(body) }
			);
		}

		return task.data;
	}, context);
};

export interface DeleteQEMUProps {
	node: string;
	vmid: number;
}

/**
 * Deletes a QEMU in Proxmox VE.
 * @param node The node where the QEMU is located.
 * @param vmid The ID of the QEMU to delete.
 * @return A promise that resolves with the task details of the delete operation.
 * @throws An error if the delete operation fails.
 */
export const deleteQEMU = async (params: DeleteQEMUProps) => {
	const { node, vmid } = params;

	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}

	const context = {
		operation: 'qemu_delete',
		node,
		vmid,
		requestId: `delete-${vmid}`
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid",
			method: "DELETE",
			params,
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to delete QEMU ${vmid}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}`,
				'DELETE'
			);
		}

		return task.data;
	}, context);
};

export type GetStatusQEMUProps = NonNullable<PVE_API_Template["/nodes/:node/qemu/:vmid/status/current"]["GET"]["params"]>;

export const getStatusQEMU = async (params: GetStatusQEMUProps) => {
	const { node, vmid } = params;

	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}

	const context = {
		operation: 'qemu_get_status',
		node,
		vmid,
		requestId: `status-${vmid}`
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid/status/current",
			method: "GET",
			params,
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to get status for QEMU ${vmid}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}/status/current`,
				'GET'
			);
		}

		return task.data;
	}, context);
}

export type SetStatusQEMUProps = NonNullable<PVE_API_Template["/nodes/:node/qemu/:vmid/status/:state"]["POST"]["params"]>;

export const setStatusQEMU = async (params: SetStatusQEMUProps) => {
	const { node, vmid, state } = params;

	// Validate input parameters
	if (!node?.trim()) {
		throw new ValidationError('Node name is required', 'node', node);
	}
	if (!vmid || vmid <= 0) {
		throw new ValidationError('Valid VM ID is required', 'vmid', vmid);
	}
	if (!state?.trim()) {
		throw new ValidationError('State is required', 'state', state);
	}

	const context = {
		operation: 'qemu_set_status',
		node,
		vmid,
		requestId: `set-status-${vmid}-${state}`,
		additional: { state }
	};

	return RetryHandler.executeWithRetry(async () => {
		const task = await instance({
			path: "/nodes/:node/qemu/:vmid/status/:state",
			method: "POST",
			params,
		});

		if (task.status !== 200) {
			throw new PVEAPIError(
				`Failed to set status for QEMU ${vmid} to ${state}`,
				task.status,
				`/nodes/${node}/qemu/${vmid}/status/${state}`,
				'POST',
				{ state }
			);
		}

		return task.data;
	}, context);
};
