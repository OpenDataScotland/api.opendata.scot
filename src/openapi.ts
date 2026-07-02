import { Hono } from "hono";
import type { Handler } from "hono";

export type { Handler };

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head"
  | "trace"
  | "connect";

export type SchemaObject = {
  type: "object" | "array" | "string" | "number" | "integer" | "boolean";
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  description?: string;
  enum?: (string | number | boolean)[];
};

export type MediaTypeObject = {
  schema?: SchemaObject;
  example?: unknown;
};

export type ResponseObject = {
  description: string;
  content?: Record<string, MediaTypeObject>;
};

export type RequestBodyObject = {
  description?: string;
  required?: boolean;
  content: Record<string, MediaTypeObject>;
};

export type ParameterObject = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
};

export interface OpenApiOperation {
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
}

export interface OpenApiRoute {
  method: HttpMethod;
  path: string;
  handler: Handler;
  openapi: OpenApiOperation;
}

export interface RouteGroup {
  basePath: string;
  routes: OpenApiRoute[];
  defaultTags?: string[];
}

export interface OpenApiDocumentInfo {
  title: string;
  version: string;
  description?: string;
}

export interface OpenApiSpecConfig {
  info: OpenApiDocumentInfo;
  servers?: { url: string; description?: string }[];
  tags?: { name: string; description?: string }[];
}

const joinPaths = (base: string, route: string): string => {
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  return `${normalizedBase}${normalizedRoute}`;
};

export const buildOpenApiSpec = (
  groups: RouteGroup[],
  config: OpenApiSpecConfig
): {
  openapi: "3.1.0";
  info: OpenApiDocumentInfo;
  servers?: OpenApiSpecConfig["servers"];
  tags?: OpenApiSpecConfig["tags"];
  paths: Record<string, Record<string, OpenApiOperation>>;
} => {
  const { info, servers = [], tags = [] } = config;
  const paths: Record<string, Record<string, OpenApiOperation>> = {};

  groups.forEach((group) => {
    const { basePath, routes, defaultTags = [] } = group;

    routes.forEach((route) => {
      const path = joinPaths(basePath, route.path);
      const method = route.method.toLowerCase();

      const combinedTags = [
        ...(route.openapi.tags ?? []),
        ...defaultTags,
      ].filter((value, index, self) => self.indexOf(value) === index);

      const operation: OpenApiOperation = {
        summary: route.openapi.summary,
        description: route.openapi.description,
        responses: route.openapi.responses,
        parameters: route.openapi.parameters,
        requestBody: route.openapi.requestBody,
      };

      if (combinedTags.length) {
        operation.tags = combinedTags;
      }

      if (!paths[path]) {
        paths[path] = {};
      }

      paths[path][method] = operation;
    });
  });

  return {
    openapi: "3.1.0",
    info,
    servers,
    tags,
    paths,
  };
};

const registerRoute = (router: Hono, route: OpenApiRoute) => {
  switch (route.method) {
    case "get":
      router.get(route.path, route.handler);
      break;
    case "post":
      router.post(route.path, route.handler);
      break;
    case "put":
      router.put(route.path, route.handler);
      break;
    case "patch":
      router.patch(route.path, route.handler);
      break;
    case "delete":
      router.delete(route.path, route.handler);
      break;
    case "options":
      router.options(route.path, route.handler);
      break;
    case "head":
      router.head(route.path, route.handler);
      break;
    case "trace":
      router.trace(route.path, route.handler);
      break;
    case "connect":
      router.connect(route.path, route.handler);
      break;
    default:
      throw new Error(`Unsupported HTTP method ${route.method}`);
  }
};

export const applyRoutesToRouter = (router: Hono, routes: OpenApiRoute[]) => {
  routes.forEach((route) => registerRoute(router, route));
};
