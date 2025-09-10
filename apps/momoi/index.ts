import { env } from "@momoi/libs/env";
import { app } from "./src/app";

app.listen(env.BACKEND_PORT, () => console.log(`😺 Momoi is running on port ${env.BACKEND_PORT}`));
