import { instance } from "./http_client";
import type {
	PVE_API_Template,
	PVE_Disk_Resize,
	PVE_Interface_Config,
	PVE_Network_Config,
} from "./types";

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
	const task = await instance({
		path: "/nodes/:node/qemu/:vmid/clone",
		method: "POST",
		params: { node, vmid },
		body: { target, newid, name, full },
	});

	if (task.status !== 200) {
		throw new Error(`Failed to clone QEMU: ${task.status}`);
	}

	return task.data;
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
	const task = await instance({
		path: "/nodes/:node/qemu/:vmid/resize",
		method: "PUT",
		params: { node, vmid },
		body: { disk: "scsi0", size },
	});

	if (task.status !== 200) {
		throw new Error(`Failed to resize QEMU: ${task.status}`);
	}

	return task.data;
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
		throw new Error(`Failed to configure QEMU: ${task.status}`);
	}

	return task.data;
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
	const task = await instance({
		path: "/nodes/:node/qemu/:vmid",
		method: "DELETE",
		params,
	});

	if (task.status !== 200) {
		throw new Error(`Failed to delete QEMU: ${task.status}`);
	}

	return task.data;
};

export type GetStatusQEMUProps = NonNullable<PVE_API_Template["/nodes/:node/qemu/:vmid/status/current"]["GET"]["params"]>;

export const getStatusQEMU = async (params: GetStatusQEMUProps) => {
	const task = await instance({
		path: "/nodes/:node/qemu/:vmid/status/current",
		method: "GET",
		params,
	});

	if (task.status !== 200) {
		throw new Error(`Failed to get status for QEMU: ${task.status}`);
	}

	return task.data;
}

export type SetStatusQEMUProps = NonNullable<PVE_API_Template["/nodes/:node/qemu/:vmid/status/:state"]["POST"]["params"]>;

export const setStatusQEMU = async (params: SetStatusQEMUProps) => {
	const task = await instance({
		path: "/nodes/:node/qemu/:vmid/status/:state",
		method: "POST",
		params,
	});

	if (task.status !== 200) {
		throw new Error(`Failed to set status for QEMU: ${task.status}`);
	}

	return task.data;
};
