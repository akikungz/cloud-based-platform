import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

import { auth as auth_server } from "auth/server";

export const auth = auth_server(db, {
  base_url: env.API_URL,
  base_path: "/api/auth",
  frontend_url: env.FRONTEND_BASE_URL,
  social_providers: {
    google: {
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trusted_origins: env.TRUSTED_ORIGINS,
  NODE_ENV: env.NODE_ENV,
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
// biome-ignore lint/suspicious/noAssignInExpressions: lazy initialization pattern for caching schema
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          // biome-ignore lint/suspicious/noExplicitAny: <any>
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
      // biome-ignore lint/suspicious/noExplicitAny: <any>
    }) as Promise<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <any>
  components: getSchema().then(({ components }) => components) as Promise<any>,
};
