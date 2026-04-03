import Sidebar from "./AdminLayout";

function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <div style={{
          background:"#f5f5f5",
          padding:"15px",
          borderBottom:"1px solid #ddd"
        }}>
          <h2>Admin Panel</h2>
        </div>

        <div style={{ padding:"20px" }}>
          {children}
        </div>

      </div>

    </div>
  );
}

export default AdminLayout;