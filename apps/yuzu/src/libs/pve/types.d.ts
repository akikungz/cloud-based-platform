/** biome-ignore-all lint/complexity/noBannedTypes: Record type is needed for flexible API request/response types */
/** biome-ignore-all lint/suspicious/noExplicitAny: <any> is used to allow flexibility in request body and response types */
/** biome-ignore-all lint/correctness/noUnusedVariables: This is used to extract dynamic route parameters from a string */

import type { HttpMethod, RequestOptions } from "@yuzu/libs/http/types";

export type PVE_Node = {
  status: "online" | "offline";
  node: string;
  uptime: number;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
}

export type PVE_QEMU = {
  vmid: number;
  name: string;
  status: "running" | "stopped" | "suspended";
  uptime: number;
  cpu: number;
  cpus: number;
  mem: number;
  maxmem: number;
  maxdisk: number;
}

export type PVE_LXC = {
  vmid: number;
  name: string;
  status: "stopped" | "running";
  uptime: number;
  cpu: number;
  cpus: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
}

export type PVE_Empty_Response = Record<string, never>;

export type PVE_PATH =
  // Node related endpoints
  "/nodes" |
  "/nodes/:node/status" |
  // QEMU related endpoints
  "/nodes/:node/qemu" |
  "/nodes/:node/qemu/:vmid/status/current" |
  "/nodes/:node/qemu/:vmid/status/:state" |
  "/nodes/:node/qemu/:vmid/clone" |
  "/nodes/:node/qemu/:vmid/config" |
  "/nodes/:node/qemu/:vmid/resize" |
  // LXC related endpoints
  "/nodes/:node/lxc" |
  "/nodes/:node/lxc/:vmid/status/current" |
  "/nodes/:node/lxc/:vmid/status/:state" |
  "/nodes/:node/lxc/:vmid/clone" |
  "/nodes/:node/lxc/:vmid/config" |
  "/nodes/:node/lxc/:vmid/resize";

export type PVE_Network_Config = `ip=${string}/${number},gw=${string}`;

export type PVE_Disk_Resize = `+${number}G` | `+${number}M` | `+${number}K`;

export type PVE_API_Structure = {
  [path in PVE_PATH]: {
    [method in HttpMethod]?: RequestOptions<path>;
  }
};

export interface PVE_API_Template extends PVE_API_Structure {
  // Node related endpoints
  "/nodes": {
    GET: RequestOptions<
      "/nodes",
      Record<string, never>,
      Record<string, never>,
      PVE_Node[]
    >;
  },
  "/nodes/:node/status": {
    GET: RequestOptions<
      "/nodes/:node/status",
      {
        node: string;
      },
      Record<string, never>,
      PVE_Node
    >;
  },
  // Qemu related endpoints
  "/nodes/:node/qemu": {
    GET: RequestOptions<
      "/nodes/:node/qemu",
      {
        node: string;
      },
      Record<string, never>,
      PVE_QEMU[]
    >;
  },
  "/nodes/:node/qemu/:vmid": {
    DELETE: RequestOptions<
      "/nodes/:node/qemu/:vmid",
      {
        node: string;
        vmid: number;
      },
      {
        "destroy-unreferenced-disks"?: boolean;
        purge?: boolean;
      },
      PVE_Empty_Response
    >;
  },
  "/nodes/:node/qemu/:vmid/status/current": {
    GET: RequestOptions<
      "/nodes/:node/qemu/:vmid/status/current",
      {
        node: string;
        vmid: number;
      },
      Record<string, never>,
      PVE_QEMU
    >;
  }
  "/nodes/:node/qemu/:vmid/status/:state": {
    POST: RequestOptions<
      "/nodes/:node/qemu/:vmid/status/:state",
      {
        node: string;
        vmid: number;
        state: "start" | "stop" | "suspend" | "resume" | "reboot";
      },
      Record<string, never>,
      PVE_Empty_Response
    >;
  },
  "/nodes/:node/qemu/:vmid/clone": {
    POST: RequestOptions<
      "/nodes/:node/qemu/:vmid/clone",
      {
        node: string;
        vmid: number;
      },
      {
        newid: number;
        name: string;
        full?: boolean;
        target?: string;
      },
      PVE_Empty_Response
    >
  },
  "/nodes/:node/qemu/:vmid/config": {
    GET: RequestOptions<
      "/nodes/:node/qemu/:vmid/config",
      {
        node: string;
        vmid: number;
      },
      Record<string, never>,
      Record<string, any>
    >;
    POST: RequestOptions<
      "/nodes/:node/qemu/:vmid/config",
      {
        node: string;
        vmid: number;
      },
      {
        // Network configuration
        ipconfig0?: PVE_Network_Config;
        // Cloud-init configuration
        cicustom?: string;
        ciuser?: string;
        cipassword?: string;
        sshkeys?: string;
        // Specs configuration
        cores?: number;
        memory?: number;
      },
      PVE_Empty_Response
    >;
    PUT: PVE_API["/nodes/:node/qemu/:vmid/config"]["POST"];
  },
  "/nodes/:node/qemu/:vmid/resize": {
    PUT: RequestOptions<
      "/nodes/:node/qemu/:vmid/resize",
      {
        node: string;
        vmid: number;
      },
      {
        size: PVE_Disk_Resize;
        disk: "scsi0";
      },
      PVE_Empty_Response
    >;
  },
  // LXC related endpoints
  "/nodes/:node/lxc": {
    GET: RequestOptions<
      "/nodes/:node/lxc",
      {
        node: string;
      },
      Record<string, never>,
      PVE_LXC[]
    >;
  },
  "/nodes/:node/lxc/:vmid": {
    GET: RequestOptions<
      "/nodes/:node/lxc/:vmid",
      {
        node: string;
        vmid: number;
      },
      Record<string, never>,
      PVE_LXC
    >;
  },
  "/nodes/:node/lxc/:vmid/status/current": {
    GET: RequestOptions<
      "/nodes/:node/lxc/:vmid/status/current",
      {
        node: string;
        vmid: number;
      },
      Record<string, never>,
      PVE_LXC
    >;
  },
  "/nodes/:node/lxc/:vmid/status/:state": {
    POST: RequestOptions<
      "/nodes/:node/lxc/:vmid/status/:state",
      {
        node: string;
        vmid: number;
        state: "start" | "stop" | "suspend" | "resume" | "reboot";
      },
      Record<string, never>,
      PVE_Empty_Response
    >;
  },
  "/nodes/:node/lxc/:vmid/clone": {
    POST: RequestOptions<
      "/nodes/:node/lxc/:vmid/clone",
      {
        node: string;
        vmid: number;
      },
      {
        newid: number;
        name: string;
        target?: string;
      },
      PVE_Empty_Response
    >;
  },
  "/nodes/:node/lxc/:vmid/config": {
    GET: RequestOptions<
      "/nodes/:node/lxc/:vmid/config",
      {
        node: string;
        vmid: number;
      },
      Record<string, never>,
      Record<string, any>
    >;
    PUT: RequestOptions<
      "/nodes/:node/lxc/:vmid/config",
      {
        node: string;
        vmid: number;
      },
      {
        // Specs configuration
        cores?: number;
        memory?: number;
        swap?: number;
        // Network configuration
        net0?: PVE_Network_Config;
      },
      PVE_Empty_Response
    >
  },
  "/nodes/:node/lxc/:vmid/resize": {
    PUT: RequestOptions<
      "/nodes/:node/lxc/:vmid/resize",
      {
        node: string;
        vmid: number;
      },
      {
        size: PVE_Disk_Resize;
        disk: "rootfs" | `mp${number}`;
      },
      PVE_Empty_Response
    >;
  }
};

export type PVE_API<Path extends keyof PVE_API_Template> = PVE_API_Template[Path];

export type PVE_RequestBody<Path extends keyof PVE_API_Template, Method extends keyof PVE_API_Template[Path]> =
  PVE_API_Template[Path][Method] extends RequestOptions<any, any, infer B, any> ? B : Record<string, never>;

export type PVE_RequestParams<Path extends keyof PVE_API_Template, Method extends keyof PVE_API_Template[Path]> =
  PVE_API_Template[Path][Method] extends RequestOptions<any, infer P, any, any> ? P : Record<string, never>;

export type PVE_RequestResponse<Path extends keyof PVE_API_Template, Method extends keyof PVE_API_Template[Path]> =
  PVE_API_Template[Path][Method] extends RequestOptions<any, any, any, infer R> ? R : Record<string, never>;
