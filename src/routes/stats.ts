import { Hono } from "hono";
import { applyRoutesToRouter, Handler, OpenApiRoute } from "../openapi";

const popularDatasetsHandler: Handler = (c) => {
  return c.json({ "message": "hello world" });
};

export const statsRoutes: OpenApiRoute[] = [
  {
    method: "get",
    path: "/popular-datasets",
    handler: popularDatasetsHandler,
    openapi: {
      summary: "Popular datasets",
      description: "Returns a hello world message to demonstrate the stats router.",
      tags: ["Statistics"],
      responses: {
        "200": {
          description: "A friendly confirmation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                },
                required: ["message"],
              },
              example: { message: "hello world" },
            },
          },
        },
      },
    },
  },
];

const app = new Hono();
applyRoutesToRouter(app, statsRoutes);

export default app;
