import { Hono } from "hono";
import stats, { statsRoutes } from "./routes/stats";
import { buildOpenApiSpec, RouteGroup } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";

const app = new Hono();

// ROUTES - Map any endpoint logic here.
app.route("/stats", stats);

// OPENAPI ROUTE GROUPS - Add any new route groups here to be included in the OpenAPI spec.
const routeGroups: RouteGroup[] = [
	{
		basePath: "/stats",
		routes: statsRoutes,
		defaultTags: ["Statistics"],
	},
];

const openApiDocument = buildOpenApiSpec(routeGroups, {
	info: {
		title: "Open Data Scotland API",
		version: "1.0.0",
		description: "API for backend for opendata.scot.",
	},
	servers: [
		{ url: "http://localhost:8787", description: "Local dev" },
		{ url: "https://api.opendata.scot", description: "Production" }		
	],
});

app.get("/openapi.json", (c) => c.json(openApiDocument));
app.get(
	"/docs",
	swaggerUI({
		url: "/openapi.json",
		title: "Open Data Scotland API docs",
	})
);

export default app;
