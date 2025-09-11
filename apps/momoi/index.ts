import { env } from "@momoi/libs/env";
import { app } from "@momoi/app";

app.listen(env.PORT, () => console.log(`😺 Momoi is running on port ${env.PORT}`));
