import { app } from "@momoi/index";
import { env } from "@momoi/libs/env";

app.listen(env.BACKEND_PORT, () => console.log(`😺 Momoi is running on port ${env.BACKEND_PORT}`));
