// /**
//  * Microservices Architecture Router
//  * Routes API calls to appropriate backend service
//  * - Query Service (Port 5001): /plan, /query, /execute, /query/logs, /query/*/cancel
//  * - Metrics Service (Port 5002): /orders/*, /revenue/*, /payment/*, /cancellation/*, /geography/*, /history/*
//  */

const QUERY_SERVICE_ENDPOINTS = [
  "/plan",
  "/query",
  "/execute",
  "/query/logs",
  "/query/",
  "/query_v2/",
  "/query-v2/",
];
const METRICS_SERVICE_ENDPOINTS = [
  "/orders/",
  "/revenue/",
  "/payment/",
  "/cancellation/",
  "/geography/",
  "/history/",
  "/predict",
  "/forecast/",
];

const getQueryServiceUrl = (path = "") => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_QUERY_API_URL?.trim();

  if (!rawBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_QUERY_API_URL is not set. Add it to frontend/.env or frontend/.env.local",
    );
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const getMetricsServiceUrl = (path = "") => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_METRICS_API_URL?.trim();

  if (!rawBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_METRICS_API_URL is not set. Add it to frontend/.env or frontend/.env.local",
    );
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

/**
 * Smart API URL router - determines which service to use based on endpoint
 * @param {string} path - API endpoint path
 * @returns {string} - Full URL to appropriate service
 */
export const apiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Route to Query Service
  if (
    QUERY_SERVICE_ENDPOINTS.some((endpoint) =>
      normalizedPath.startsWith(endpoint),
    )
  ) {
    return getQueryServiceUrl(normalizedPath);
  }

  // Route to Metrics Service
  if (
    METRICS_SERVICE_ENDPOINTS.some((endpoint) =>
      normalizedPath.startsWith(endpoint),
    )
  ) {
    return getMetricsServiceUrl(normalizedPath);
  }

  // Default fallback to Query Service for backward compatibility
  console.warn(
    `Unknown endpoint: ${normalizedPath}. Routing to Query Service by default.`,
  );
  return getQueryServiceUrl(normalizedPath);
};

/**
 * Explicitly use Query Service for /plan, /query, /execute endpoints
 * @param {string} path - API endpoint path
 * @returns {string} - Full URL to Query Service
 */
export const queryApiUrl = (path = "") => {
  return getQueryServiceUrl(path);
};

/**
 * Explicitly use Metrics Service for metric/chart endpoints
 * @param {string} path - API endpoint path
 * @returns {string} - Full URL to Metrics Service
 */
export const metricsApiUrl = (path = "") => {
  return getMetricsServiceUrl(path);
};

/**
 * Fetch pre-calculated metrics from S3
 * @param {string} executionDate - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {Promise<Object|null>} - Full metrics payload with all presets or null if not available
 */
export const fetchMetricsFromS3 = async (executionDate = null) => {
  try {
    const s3BucketUrl = process.env.NEXT_PUBLIC_METRICS_S3_BUCKET_URL?.trim();
    const s3Prefix =
      process.env.NEXT_PUBLIC_METRICS_S3_PREFIX || "metrics-presets";

    if (!s3BucketUrl) {
      console.warn(
        "NEXT_PUBLIC_METRICS_S3_BUCKET_URL not set, skipping S3 fetch",
      );
      return null;
    }

    // Use provided date or default to yesterday
    const targetDate =
      executionDate || new Date(new Date().setDate(new Date().getDate() - 1));
    const dateStr =
      targetDate instanceof Date
        ? targetDate.toISOString().split("T")[0]
        : targetDate;

    const s3Url = `${s3BucketUrl.replace(/\/+$/, "")}/${s3Prefix}/${dateStr}/all.json`;

    console.log(`📦 Fetching pre-calculated metrics from S3: ${s3Url}`);

    const response = await fetch(s3Url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `S3 fetch returned status ${response.status}. Falling back to API.`,
      );
      return null;
    }

    const metricsPayload = await response.json();
    console.log("✅ Metrics loaded from S3");
    return metricsPayload;
  } catch (error) {
    console.warn(`⚠️  Error fetching metrics from S3: ${error.message}`);
    return null;
  }
};
