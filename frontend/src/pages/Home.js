import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../Layouts/MainLayout";
import axios from "../api/axios";

function Home() {
  const role = (localStorage.getItem("role") || "USER").trim().toLowerCase();
  const isAdmin = role === "admin";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = isAdmin ? "/payment-request/list" : "/payment-request/my-requests";
      const res = await axios.get(endpoint);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Dashboard data could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const statusOf = (request) => String(request.status || "").toLowerCase();

    return {
      total: requests.length,
      pending: requests.filter((request) => statusOf(request).includes("pending")).length,
      approved: requests.filter((request) =>
        ["approved", "paid", "pending_payment"].some((status) =>
          statusOf(request).includes(status)
        )
      ).length,
      rejected: requests.filter((request) => statusOf(request).includes("rejected")).length,
    };
  }, [requests]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.Submitted_at || 0) - new Date(a.Submitted_at || 0))
      .slice(0, 5);
  }, [requests]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
  };

  return (
    <MainLayout>
      <h2>{isAdmin ? "Admin Dashboard" : "Dashboard"}</h2>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div style={{
        display: "flex",
        gap: "20px",
        marginTop: "20px",
        flexWrap: "wrap"
      }}>
        <DashboardCard title="Total Requests" value={loading ? "..." : stats.total} color="#3b82f6" />
        <DashboardCard title="Pending" value={loading ? "..." : stats.pending} color="#f59e0b" />
        <DashboardCard title="Approved" value={loading ? "..." : stats.approved} color="#10b981" />
        <DashboardCard title="Rejected" value={loading ? "..." : stats.rejected} color="#ef4444" />
      </div>

      <h3 style={{ marginTop: "40px" }}>Recent Requests</h3>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white"
      }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={cellStyle}>Request ID</th>
            {isAdmin && <th style={cellStyle}>Requester</th>}
            <th style={cellStyle}>Vendor</th>
            {isAdmin && <th style={cellStyle}>Warehouse</th>}
            <th style={cellStyle}>Amount</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Date</th>
          </tr>
        </thead>

        <tbody>
          {!loading && recentRequests.length === 0 && (
            <tr>
              <td style={cellStyle} colSpan={isAdmin ? "7" : "5"}>No requests found</td>
            </tr>
          )}

          {recentRequests.map((request) => (
            <tr key={request.id}>
              <td style={cellStyle}>{request.request_code}</td>
              {isAdmin && <td style={cellStyle}>{request.requester || "-"}</td>}
              <td style={cellStyle}>{request.vendor}</td>
              {isAdmin && <td style={cellStyle}>{request.warehouse || "-"}</td>}
              <td style={cellStyle}>Rs. {Number(request.grand_total ?? request.amount ?? 0).toFixed(2)}</td>
              <td style={cellStyle}>{request.status}</td>
              <td style={cellStyle}>{formatDate(request.Submitted_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
}

function DashboardCard({ title, value, color }) {
  return (
    <div style={{
      background: color,
      color: "white",
      padding: "20px",
      borderRadius: "8px",
      width: "200px"
    }}>
      <h3>{title}</h3>
      <p style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>{value}</p>
    </div>
  );
}

const cellStyle = {
  padding: "10px",
  border: "1px solid #ddd"
};

export default Home;
