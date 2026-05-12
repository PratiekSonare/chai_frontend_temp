# RTO Orders Dashboard

This page shows cancelled and returned orders from S3-backed order data.

## Behavior
- Default range: previous day
- Search any date range with `start_date` and `end_date`
- Separate views for `Returned` and `Cancelled`
- Metrics shown per section:
  - total count
  - top states
  - top pincodes
- Order table rendered by `frontend/src/app/components/table/DataTableComponent.js`

## Data source
- Backend endpoint: `POST /cancellation/rto`
- S3 layout: `orders/YYYY-MM/YYYY-MM-DD.json`

## Frontend flow
1. Load yesterday by default.
2. Fetch RTO payload for selected date range.
3. Switch between Returned and Cancelled tabs.
4. Render active section rows through the shared data table.
