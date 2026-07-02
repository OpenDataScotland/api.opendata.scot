export const buildPopularDatasetsPayload = (relativeDate: string) => ({
  date_range: "7d",
  relative_date: relativeDate,
  dimensions: ["event:page"],
  metrics: ["visitors"],
  filters: [["contains", "event:page", ["/datasets/"], { case_sensitive: false }]],
  order_by: [
    ["visitors", "desc"],
    ["event:page", "asc"],
  ],
  pagination: { limit: 100, offset: 0 },
  include: {
    imports: true,
    imports_meta: false,
    time_labels: false,
    partial_time_labels: false,
    compare: null,
    compare_match_day_of_week: true,
    empty_metrics: false,
    present_index: false,
  },
});
