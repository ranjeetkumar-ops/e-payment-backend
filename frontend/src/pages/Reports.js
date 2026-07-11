import { useCallback, useEffect, useMemo, useState } from "react";
import { FaDownload, FaFileExcel, FaSearch } from "react-icons/fa";
import MainLayout from "../Layouts/MainLayout";
import axios from "../api/axios";

function Reports() {
  const role = (localStorage.getItem("role") || "USER").trim().toLowerCase();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = role === "admin" || role === "accounts"
        ? "/payment-request/list"
        : "/payment-request/my-requests";
      const res = await axios.get(endpoint);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Reports could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredRequests = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const from = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`) : null;
    const to = filters.toDate ? new Date(`${filters.toDate}T23:59:59`) : null;

    return requests.filter((request) => {
      const status = String(request.status || "").toLowerCase();
      const submittedAt = request.Submitted_at ? new Date(request.Submitted_at) : null;
      const amount = request.grand_total ?? request.amount ?? 0;
      const haystack = [
        request.request_code,
        request.requester,
        request.vendor,
        request.vendor_code,
        request.warehouse,
        request.warehouse_code,
        request.utr_number,
        ...(request.invoice_numbers || []),
      ].join(" ").toLowerCase();

      if (filters.status !== "all" && status !== filters.status) return false;
      if (search && !haystack.includes(search)) return false;
      if (from && (!submittedAt || submittedAt < from)) return false;
      if (to && (!submittedAt || submittedAt > to)) return false;

      return Number.isFinite(Number(amount));
    });
  }, [requests, filters]);

  const stats = useMemo(() => {
    const totalAmount = filteredRequests.reduce(
      (sum, request) => sum + Number(request.grand_total ?? request.amount ?? 0),
      0
    );
    const paidCount = filteredRequests.filter(
      (request) => String(request.status || "").toLowerCase() === "paid"
    ).length;
    const pendingCount = filteredRequests.filter(
      (request) => String(request.status || "").toLowerCase().includes("pending")
    ).length;

    return {
      count: filteredRequests.length,
      totalAmount,
      paidCount,
      pendingCount,
    };
  }, [filteredRequests]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(
      requests
        .map((request) => String(request.status || "").trim())
        .filter(Boolean)
    );
    return ["all", ...Array.from(statuses).sort()];
  }, [requests]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const exportSummary = () => {
    const rows = filteredRequests.map((request) => ({
      "Request ID": request.request_code || "",
      Requester: request.requester || "",
      Vendor: request.vendor || "",
      "Vendor Code": request.vendor_code || "",
      Warehouse: request.warehouse || "",
      "Warehouse Code": request.warehouse_code || "",
      Status: request.status || "",
      Invoices: (request.invoice_numbers || []).join(", "),
      "Invoice Count": request.invoice_count ?? request.invoice_numbers?.length ?? 0,
      Amount: Number(request.grand_total ?? request.amount ?? 0).toFixed(2),
      "Submitted Date": formatDateTime(request.Submitted_at),
      "UTR Number": request.utr_number || "",
      "Paid Date": formatDateTime(request.paid_at),
    }));

    downloadCsv(rows, "payment-request-summary.csv");
  };

  const exportDetails = async () => {
    try {
      setExporting(true);
      setError("");

      const details = await Promise.all(
        filteredRequests.map(async (request) => {
          try {
            const res = await axios.get(`/payment-request/request-details/${request.id}`);
            return { request, detail: res.data };
          } catch (err) {
            return { request, detail: null };
          }
        })
      );

      const rows = details.flatMap(({ request, detail }) => {
        const invoices = detail?.invoiceList || [];

        if (invoices.length === 0) {
          return [detailRow(request, {}, {})];
        }

        return invoices.flatMap((invoice) => {
          const items = invoice.items || [];
          if (items.length === 0) return [detailRow(request, invoice, {})];
          return items.map((item) => detailRow(request, invoice, item));
        });
      });

      downloadCsv(rows, "payment-request-details.csv");
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout>
      <div style={pageHeaderStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Reports</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
            Download request and invoice details for Excel.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={exportSummary}
            disabled={loading || filteredRequests.length === 0}
            style={buttonStyle("#2563eb")}
          >
            <FaFileExcel /> Summary
          </button>
          <button
            onClick={exportDetails}
            disabled={loading || exporting || filteredRequests.length === 0}
            style={buttonStyle("#16a34a")}
          >
            <FaDownload /> {exporting ? "Preparing..." : "Details"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", marginTop: 0 }}>{error}</p>}

      <div style={statsGridStyle}>
        <StatCard title="Requests" value={loading ? "..." : stats.count} color="#2563eb" />
        <StatCard title="Total Amount" value={loading ? "..." : formatCurrency(stats.totalAmount)} color="#16a34a" />
        <StatCard title="Pending" value={loading ? "..." : stats.pendingCount} color="#f59e0b" />
        <StatCard title="Paid" value={loading ? "..." : stats.paidCount} color="#0891b2" />
      </div>

      <div style={filterBarStyle}>
        <label style={labelStyle}>
          Status
          <select
            value={filters.status}
            onChange={(event) => handleFilterChange("status", event.target.value)}
            style={inputStyle}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {status === "all" ? "All Status" : status}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          From
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => handleFilterChange("fromDate", event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          To
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => handleFilterChange("toDate", event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ ...labelStyle, flex: "1 1 240px" }}>
          Search
          <div style={searchBoxStyle}>
            <FaSearch style={{ color: "#6b7280" }} />
            <input
              type="text"
              value={filters.search}
              placeholder="Request, vendor, invoice, warehouse"
              onChange={(event) => handleFilterChange("search", event.target.value)}
              style={{ ...inputStyle, border: "none", padding: 0 }}
            />
          </div>
        </label>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={cellStyle}>Request ID</th>
              <th style={cellStyle}>Requester</th>
              <th style={cellStyle}>Vendor</th>
              <th style={cellStyle}>Warehouse</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Invoices</th>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>UTR</th>
              <th style={cellStyle}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredRequests.length === 0 && (
              <tr>
                <td style={emptyStyle} colSpan="9">No report data found</td>
              </tr>
            )}

            {filteredRequests.map((request) => (
              <tr key={request.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={cellStyle}>{request.request_code}</td>
                <td style={cellStyle}>{request.requester || "-"}</td>
                <td style={cellStyle}>{request.vendor}</td>
                <td style={cellStyle}>{request.warehouse || "-"}</td>
                <td style={cellStyle}>{request.status}</td>
                <td style={cellStyle}>{(request.invoice_numbers || []).join(", ") || "-"}</td>
                <td style={cellStyle}>{formatCurrency(request.grand_total ?? request.amount ?? 0)}</td>
                <td style={cellStyle}>{request.utr_number || "-"}</td>
                <td style={cellStyle}>{formatDateTime(request.Submitted_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

function detailRow(request, invoice, item) {
  return {
    "Request ID": request.request_code || "",
    Requester: request.requester || "",
    Vendor: request.vendor || "",
    Warehouse: request.warehouse || "",
    Status: request.status || "",
    "Submitted Date": formatDateTime(request.Submitted_at),
    "Invoice No": invoice.invoiceNo || "",
    "Invoice Date": formatDateTime(invoice.invoiceDate),
    GST: invoice.gst ?? "",
    Description: item.description || "",
    Qty: item.qty ?? "",
    Price: item.price ?? "",
    Total: item.total ?? "",
    "UTR Number": request.utr_number || "",
    "Paid Date": formatDateTime(request.paid_at),
    "Request Amount": Number(request.grand_total ?? request.amount ?? 0).toFixed(2),
  };
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN");
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...statCardStyle, borderTop: `4px solid ${color}` }}>
      <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>{title}</div>
      <div style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>
        {value}
      </div>
    </div>
  );
}

const pageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  margin: "0 0 15px",
  flexWrap: "wrap",
};

const buttonStyle = (background) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background,
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "9px 14px",
  cursor: "pointer",
  fontWeight: 600,
});

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "12px",
  marginBottom: "14px",
};

const statCardStyle = {
  background: "#fff",
  borderRadius: "8px",
  padding: "14px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const filterBarStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  background: "#fff",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 600,
};

const inputStyle = {
  minHeight: "36px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "0 10px",
  outline: "none",
  background: "#fff",
};

const searchBoxStyle = {
  minHeight: "36px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "0 10px",
};

const tableWrapStyle = {
  background: "#fff",
  borderRadius: "8px",
  height: "calc(100vh - 300px)",
  minHeight: "260px",
  overflow: "auto",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadStyle = {
  background: "#f3f4f6",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const cellStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};

const emptyStyle = {
  ...cellStyle,
  textAlign: "center",
  color: "#6b7280",
};

export default Reports;
