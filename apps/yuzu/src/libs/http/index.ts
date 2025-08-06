import { Agent } from "node:https";
import axios from "axios";

export const http_instance = axios.create({
	httpsAgent: new Agent({
		rejectUnauthorized: false,
	}),
});
