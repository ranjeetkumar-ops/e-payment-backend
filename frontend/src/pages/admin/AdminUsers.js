import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaCheck,
  FaCity,
  FaEdit,
  FaEnvelope,
  FaIdBadge,
  FaPlus,
  FaSave,
  FaTrash,
  FaUserCog,
  FaUserPlus,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";
import MainLayout from "../../Layouts/MainLayout";
import axios from "../../api/axios";

const tabs = [
  { id: "users", label: "Users", icon: <FaUsers /> },
  { id: "warehouses", label: "Warehouses", icon: <FaWarehouse /> },
  { id: "vendors", label: "Vendors", icon: <FaBuilding /> },
  { id: "assign", label: "Assignments", icon: <FaUserCog /> },
];

const emptyUser = {
  username: "",
  name: "",
  email: "",
  password: "",
  role_id: "",
  warehouse_id: "",
};

const emptyWarehouse = {
  warehouse_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  contact_person: "",
  contact_phone: "",
  email: "",
};

const emptyVendor = {
  vendor_name: "",
  gst_number: "",
  pan_number: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  contact_person: "",
  contact_phone: "",
  email: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
};

const styles = {
  page: {
    padding: "24px",
    minHeight: "calc(100vh - 45px)",
    overflow: "auto",
    background: "#f3f4f6",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },
  title: { margin: 0, color: "#111827", fontSize: "24px" },
  subtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: "13px" },
  tabs: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" },
  tab: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  activeTab: { background: "#2563eb", color: "#fff", borderColor: "#2563eb" },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 420px) minmax(420px, 1fr)",
    gap: "18px",
    alignItems: "start",
  },
  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "18px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  },
  panelTitle: {
    margin: "0 0 14px",
    color: "#111827",
    fontSize: "17px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  full: { gridColumn: "1 / -1" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#4b5563",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "10px 11px",
    fontSize: "14px",
    outlineColor: "#2563eb",
    background: "#fff",
  },
  buttonRow: { display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" },
  primaryButton: {
    border: 0,
    borderRadius: "6px",
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
  },
  ghostButton: {
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "9px 12px",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 600,
  },
  dangerButton: {
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "8px 10px",
    background: "#fff1f2",
    color: "#be123c",
    cursor: "pointer",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "720px" },
  th: {
    textAlign: "left",
    padding: "11px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "12px",
    background: "#f9fafb",
  },
  td: {
    padding: "11px",
    borderBottom: "1px solid #f3f4f6",
    color: "#1f2937",
    fontSize: "13px",
    verticalAlign: "top",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "999px",
    padding: "4px 8px",
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: 700,
  },
  alert: {
    marginBottom: "14px",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
  },
  error: { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
};

function Field({ label, name, value, onChange, type = "text", children, full, required }) {
  return (
    <label style={full ? styles.full : undefined}>
      <span style={styles.label}>{label}</span>
      {children || (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          style={styles.input}
        />
      )}
    </label>
  );
}

function AdminUsers() {
  const [activeTab, setActiveTab] = useState(() => {
    const tab = window.location.hash.replace("#", "");
    return tabs.some((item) => item.id === tab) ? tab : "users";
  });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [userForm, setUserForm] = useState(emptyUser);
  const [warehouseForm, setWarehouseForm] = useState(emptyWarehouse);
  const [vendorForm, setVendorForm] = useState(emptyVendor);
  const [assignment, setAssignment] = useState({ user_id: "", role_id: "", warehouse_id: "" });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleNameById = useMemo(() => {
    return roles.reduce((map, role) => ({ ...map, [String(role.id)]: role.role_name }), {});
  }, [roles]);

  const warehouseNameById = useMemo(() => {
    return warehouses.reduce(
      (map, warehouse) => ({ ...map, [String(warehouse.id)]: warehouse.warehouse_name }),
      {}
    );
  }, [warehouses]);

  const showMessage = useCallback((text) => {
    setMessage(text);
    setError("");
  }, []);

  const showError = useCallback((err, fallback) => {
    setError(err?.response?.data?.detail || fallback);
    setMessage("");
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [usersRes, rolesRes, warehouseRes, vendorRes] = await Promise.all([
        axios.get("/users/"),
        axios.get("/roles/list"),
        axios.get("/warehouse/list"),
        axios.get("/vendor/list"),
      ]);

      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setWarehouses(warehouseRes.data || []);
      setVendors(vendorRes.data || []);
    } catch (err) {
      showError(err, "Unable to load admin data.");
    }
  }, [showError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const handleHashChange = () => {
      const tab = window.location.hash.replace("#", "");
      if (tabs.some((item) => item.id === tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const cleanPayload = (payload) => {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value])
    );
  };

  const saveUser = async (event) => {
    event.preventDefault();
    const payload = cleanPayload({
      ...userForm,
      role_id: userForm.role_id ? Number(userForm.role_id) : null,
      warehouse_id: userForm.warehouse_id ? Number(userForm.warehouse_id) : null,
    });

    try {
      if (editId) {
        if (!payload.password) delete payload.password;
        await axios.put(`/users/${editId}`, payload);
        showMessage("User updated successfully.");
      } else {
        await axios.post("/users/", payload);
        showMessage("User created successfully.");
      }

      setUserForm(emptyUser);
      setEditId(null);
      loadAll();
    } catch (err) {
      showError(err, "Unable to save user.");
    }
  };

  const editUser = (user) => {
    setEditId(user.id);
    setUserForm({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      password: "",
      role_id: user.role_id ? String(user.role_id) : "",
      warehouse_id: user.warehouse_id ? String(user.warehouse_id) : "",
    });
    setActiveTab("users");
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`/users/${id}`);
      showMessage("User deleted successfully.");
      loadAll();
    } catch (err) {
      showError(err, "Unable to delete user.");
    }
  };

  const saveWarehouse = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/warehouse/create", cleanPayload(warehouseForm));
      setWarehouseForm(emptyWarehouse);
      showMessage("Warehouse created successfully.");
      loadAll();
    } catch (err) {
      showError(err, "Unable to create warehouse.");
    }
  };

  const saveVendor = async (event) => {
    event.preventDefault();
    try {
      await axios.post("/vendor/create", cleanPayload(vendorForm));
      setVendorForm(emptyVendor);
      showMessage("Vendor created successfully.");
      loadAll();
    } catch (err) {
      showError(err, "Unable to create vendor.");
    }
  };

  const saveAssignment = async (event) => {
    event.preventDefault();

    if (!assignment.role_id && !assignment.warehouse_id) {
      showError(null, "Select a role or warehouse to assign.");
      return;
    }

    try {
      if (assignment.role_id) {
        await axios.put(`/users/${assignment.user_id}/role`, null, {
          params: { role_id: Number(assignment.role_id) },
        });
      }

      if (assignment.warehouse_id) {
        await axios.put(`/users/${assignment.user_id}/warehouse`, null, {
          params: { warehouse_id: Number(assignment.warehouse_id) },
        });
      }

      showMessage("Assignment saved successfully.");
      setAssignment({ user_id: "", role_id: "", warehouse_id: "" });
      loadAll();
    } catch (err) {
      showError(err, "Unable to save assignment.");
    }
  };

  const selectRole = (value, onChange) => (
    <select name="role_id" value={value} onChange={onChange} style={styles.input} required>
      <option value="">Select role</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.role_name} - Level {role.level_no}
        </option>
      ))}
    </select>
  );

  const selectWarehouse = (value, onChange, placeholder = "Select warehouse") => (
    <select name="warehouse_id" value={value} onChange={onChange} style={styles.input}>
      <option value="">{placeholder}</option>
      {warehouses.map((warehouse) => (
        <option key={warehouse.id} value={warehouse.id}>
          {warehouse.warehouse_name}
        </option>
      ))}
    </select>
  );

  const renderUserForm = () => (
    <form onSubmit={saveUser} style={styles.panel}>
      <h3 style={styles.panelTitle}>
        {editId ? <FaEdit /> : <FaUserPlus />}
        {editId ? "Update User" : "Create User"}
      </h3>

      <div style={styles.formGrid}>
        <Field label="Username" name="username" value={userForm.username} onChange={updateForm(setUserForm)} required />
        <Field label="Full Name" name="name" value={userForm.name} onChange={updateForm(setUserForm)} required />
        <Field label="Email" name="email" type="email" value={userForm.email} onChange={updateForm(setUserForm)} full required />
        <Field label={editId ? "Password (leave blank to keep)" : "Password"} name="password" type="password" value={userForm.password} onChange={updateForm(setUserForm)} required={!editId} />
        <Field label="Role">{selectRole(userForm.role_id, updateForm(setUserForm))}</Field>
        <Field label="Default Warehouse">{selectWarehouse(userForm.warehouse_id, updateForm(setUserForm))}</Field>
      </div>

      <div style={styles.buttonRow}>
        <button type="submit" style={styles.primaryButton}>
          <FaSave /> {editId ? "Update User" : "Create User"}
        </button>
        {editId && (
          <button type="button" style={styles.ghostButton} onClick={() => { setEditId(null); setUserForm(emptyUser); }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const renderUsers = () => (
    <div style={styles.grid}>
      {renderUserForm()}
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}><FaUsers /> User List</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Warehouse</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>
                    <strong>{user.name || user.username}</strong>
                    <div style={{ color: "#6b7280" }}>@{user.username}</div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{roleNameById[String(user.role_id)] || user.role_id || "-"}</td>
                  <td style={styles.td}>{warehouseNameById[String(user.warehouse_id)] || "-"}</td>
                  <td style={styles.td}><span style={styles.badge}>{user.is_active ? "Active" : "Inactive"}</span></td>
                  <td style={styles.td}>
                    <button type="button" style={styles.ghostButton} onClick={() => editUser(user)}>
                      <FaEdit /> Edit
                    </button>{" "}
                    <button type="button" style={styles.dangerButton} onClick={() => deleteUser(user.id)} title="Delete user">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWarehouses = () => (
    <div style={styles.grid}>
      <form onSubmit={saveWarehouse} style={styles.panel}>
        <h3 style={styles.panelTitle}><FaWarehouse /> Create Warehouse</h3>
        <div style={styles.formGrid}>
          <Field label="Warehouse Name" name="warehouse_name" value={warehouseForm.warehouse_name} onChange={updateForm(setWarehouseForm)} full required />
          <Field label="Address Line 1" name="address_line1" value={warehouseForm.address_line1} onChange={updateForm(setWarehouseForm)} full required />
          <Field label="Address Line 2" name="address_line2" value={warehouseForm.address_line2} onChange={updateForm(setWarehouseForm)} full />
          <Field label="City" name="city" value={warehouseForm.city} onChange={updateForm(setWarehouseForm)} required />
          <Field label="State" name="state" value={warehouseForm.state} onChange={updateForm(setWarehouseForm)} required />
          <Field label="Pincode" name="pincode" value={warehouseForm.pincode} onChange={updateForm(setWarehouseForm)} required />
          <Field label="Country" name="country" value={warehouseForm.country} onChange={updateForm(setWarehouseForm)} />
          <Field label="Contact Person" name="contact_person" value={warehouseForm.contact_person} onChange={updateForm(setWarehouseForm)} />
          <Field label="Contact Phone" name="contact_phone" value={warehouseForm.contact_phone} onChange={updateForm(setWarehouseForm)} />
          <Field label="Email" name="email" type="email" value={warehouseForm.email} onChange={updateForm(setWarehouseForm)} full />
        </div>
        <div style={styles.buttonRow}>
          <button type="submit" style={styles.primaryButton}><FaPlus /> Create Warehouse</button>
        </div>
      </form>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}><FaCity /> Warehouse List</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Warehouse</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td style={styles.td}>{warehouse.warehouse_id}</td>
                  <td style={styles.td}><strong>{warehouse.warehouse_name}</strong></td>
                  <td style={styles.td}>{[warehouse.city, warehouse.state].filter(Boolean).join(", ")}</td>
                  <td style={styles.td}>
                    {warehouse.contact_person || "-"}
                    <div style={{ color: "#6b7280" }}>{warehouse.contact_phone || warehouse.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVendors = () => (
    <div style={styles.grid}>
      <form onSubmit={saveVendor} style={styles.panel}>
        <h3 style={styles.panelTitle}><FaBuilding /> Create Vendor</h3>
        <div style={styles.formGrid}>
          <Field label="Vendor Name" name="vendor_name" value={vendorForm.vendor_name} onChange={updateForm(setVendorForm)} full required />
          <Field label="GST Number" name="gst_number" value={vendorForm.gst_number} onChange={updateForm(setVendorForm)} />
          <Field label="PAN Number" name="pan_number" value={vendorForm.pan_number} onChange={updateForm(setVendorForm)} />
          <Field label="Address Line 1" name="address_line1" value={vendorForm.address_line1} onChange={updateForm(setVendorForm)} full />
          <Field label="Address Line 2" name="address_line2" value={vendorForm.address_line2} onChange={updateForm(setVendorForm)} full />
          <Field label="City" name="city" value={vendorForm.city} onChange={updateForm(setVendorForm)} />
          <Field label="State" name="state" value={vendorForm.state} onChange={updateForm(setVendorForm)} />
          <Field label="Pincode" name="pincode" value={vendorForm.pincode} onChange={updateForm(setVendorForm)} />
          <Field label="Country" name="country" value={vendorForm.country} onChange={updateForm(setVendorForm)} />
          <Field label="Contact Person" name="contact_person" value={vendorForm.contact_person} onChange={updateForm(setVendorForm)} />
          <Field label="Contact Phone" name="contact_phone" value={vendorForm.contact_phone} onChange={updateForm(setVendorForm)} />
          <Field label="Email" name="email" type="email" value={vendorForm.email} onChange={updateForm(setVendorForm)} full />
          <Field label="Bank Name" name="bank_name" value={vendorForm.bank_name} onChange={updateForm(setVendorForm)} />
          <Field label="Account Number" name="account_number" value={vendorForm.account_number} onChange={updateForm(setVendorForm)} />
          <Field label="IFSC Code" name="ifsc_code" value={vendorForm.ifsc_code} onChange={updateForm(setVendorForm)} full />
        </div>
        <div style={styles.buttonRow}>
          <button type="submit" style={styles.primaryButton}><FaPlus /> Create Vendor</button>
        </div>
      </form>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}><FaIdBadge /> Vendor List</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td style={styles.td}>{vendor.vendor_id}</td>
                  <td style={styles.td}><strong>{vendor.vendor_name}</strong></td>
                  <td style={styles.td}>{vendor.city || "-"}</td>
                  <td style={styles.td}>{vendor.email || vendor.contact_phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div style={styles.grid}>
      <form onSubmit={saveAssignment} style={styles.panel}>
        <h3 style={styles.panelTitle}><FaUserCog /> Assign Role and Warehouse</h3>
        <div style={styles.formGrid}>
          <Field label="User" full>
            <select name="user_id" value={assignment.user_id} onChange={updateForm(setAssignment)} required style={styles.input}>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username} ({user.email})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Role">
            <select name="role_id" value={assignment.role_id} onChange={updateForm(setAssignment)} style={styles.input}>
              <option value="">Keep current role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.role_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Warehouse">{selectWarehouse(assignment.warehouse_id, updateForm(setAssignment), "Keep current warehouse")}</Field>
        </div>
        <div style={styles.buttonRow}>
          <button type="submit" style={styles.primaryButton}><FaCheck /> Save Assignment</button>
        </div>
      </form>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}><FaUsers /> Current Assignments</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Warehouse</th>
                <th style={styles.th}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}><strong>{user.name || user.username}</strong></td>
                  <td style={styles.td}>{roleNameById[String(user.role_id)] || "-"}</td>
                  <td style={styles.td}>{warehouseNameById[String(user.warehouse_id)] || "-"}</td>
                  <td style={styles.td}><FaEnvelope /> {user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Admin Management</h2>
            <p style={styles.subtitle}>Create users, warehouses, vendors, and manage user assignments.</p>
          </div>
          <span style={styles.badge}><FaUsers /> {users.length} users</span>
        </div>

        {message && <div style={styles.alert}>{message}</div>}
        {error && <div style={{ ...styles.alert, ...styles.error }}>{error}</div>}

        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) }}
              onClick={() => {
                setActiveTab(tab.id);
                window.history.replaceState(null, "", `#${tab.id}`);
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && renderUsers()}
        {activeTab === "warehouses" && renderWarehouses()}
        {activeTab === "vendors" && renderVendors()}
        {activeTab === "assign" && renderAssignments()}
      </div>
    </MainLayout>
  );
}

export default AdminUsers;
