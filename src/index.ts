import { Hono } from "hono";
import stats, { statsRoutes } from "./routes/stats";
import { buildOpenApiSpec, RouteGroup } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";

const app = new Hono();

// CORS - Allow requests from opendata.scot and its subdomains, but block all other origins.
const allowedOriginPattern = /^https?:\/\/([\w-]+\.)*opendata\.scot$/i;

app.use(
	"*",
	cors({
		origin: (origin) => {
			if (origin && allowedOriginPattern.test(origin)) {
				return origin;
			}
			return "";
		},
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Accept", "Authorization", "Content-Type", "Origin", "X-Requested-With"],
	})
);

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
