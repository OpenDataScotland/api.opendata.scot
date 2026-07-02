import { Hono } from 'hono';
import { applyRoutesToRouter, Handler, OpenApiRoute } from '../openapi';
import { buildPopularDatasetsPayload } from './payloads/popularDatasets';

const popularDatasetsHandler: Handler = async (c) => {
	const relativeDate = new Date().toISOString().split('T')[0];
	const popularDatasetsPayload = buildPopularDatasetsPayload(relativeDate);

	const response = await fetch('https://plausible.io/api/stats/opendata.scot/query/', {
		method: 'POST',
		body: JSON.stringify(popularDatasetsPayload),
		headers: {
			'Content-Type': 'application/json',
		},
	});

	const body = (await response.json()) as any;

	const filteredResults = body.results?.filter((row: any) => row.dimensions?.[0] !== '/datasets/');

	const transformedResults = filteredResults
		?.map((row: any) => ({
			page: row.dimensions?.[0],
			visitors: row.metrics?.[0],
		}));

	return c.json(transformedResults);
};

export const statsRoutes: OpenApiRoute[] = [
	{
		method: 'get',
		path: '/popular-datasets',
		handler: popularDatasetsHandler,
		openapi: {
			summary: 'Popular datasets',
			description: 'Returns the most popular datasets pages in the last 7 days.',
			tags: ['Statistics'],
			responses: {
				'200': {
					description: 'A list of the most popular datasets pages in the last 7 days.',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										page: { type: 'string' },
										visitors: { type: 'number' },
									},
									required: ['page', 'visitors'],
								},
							},
							example: [
								{
									page: '/datasets/dataset-name/',
									visitors: 10,
								},
							],
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
