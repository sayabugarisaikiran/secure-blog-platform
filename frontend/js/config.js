// ============================================================
// Config — API Base URL
// ============================================================
// In Docker Compose: backend runs at http://backend:3000
// Nginx proxies /api/* to the backend container
// So from the browser, we just use /api/*
// ============================================================

const API_BASE = '/api';
