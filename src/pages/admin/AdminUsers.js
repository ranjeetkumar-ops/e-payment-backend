// import AdminLayout from "../Layouts/MainLayout";
// import { useEffect, useState } from "react";
// import axios from "axios";

// function AdminUsers(){

// return(

// <AdminLayout>

// <h1>Manage Users</h1>

// </AdminLayout>

// )

// }

// export default AdminUsers
import { useEffect, useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import axios from "../../api/axios";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role_id: ""
  });

  const [editId, setEditId] = useState(null);

  // 🔥 LOAD USERS
  // const loadUsers = async () => {
  //   const res = await axios.get("/users/");
  //   setUsers(res.data);
  // };
  const loadUsers = async () => {
  try {
    console.log("Calling Users API...");
    const res = await axios.get("/users/");   // ⭐ FORCE SLASH
    console.log("Users Data:", res.data);
    setUsers(res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err?.response?.status);
    console.log("ERROR DATA:", err?.response?.data);
  }
};

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CREATE OR UPDATE
  const handleSubmit = async () => {

    if (editId) {
      await axios.put(`/users/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post("/users/", form);
    }

    setForm({
      username: "",
      name: "",
      email: "",
      password: "",
      role_id: ""
    });

    loadUsers();
  };

  // 🔥 EDIT CLICK
  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({
      username: u.username,
      name: u.name,
      email: u.email,
      password: "",
      role_id: u.role_id,
   
    });
  };

  // 🔥 DELETE
const handleDelete = async (id) => {
  try {
    await axios.delete(`/users/${id}`);
    alert("User Deleted");
    loadUsers();
  } catch (err) {
    console.log(err.response?.data);
    alert("Delete Failed");
  }
};

  return (
  <MainLayout>
    <div style={{ padding: 30 }}>
      <h2>User Management</h2>

      <div style={{ marginBottom: 20 }}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange}/>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange}/>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange}/>
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange}/>
        <input name="role_id" placeholder="Role ID" value={form.role_id} onChange={handleChange}/>

        <button onClick={handleSubmit}>
          {editId ? "Update User" : "Create User"}
        </button>
      </div>

      <table style={{width:"100%",background:"#fff"}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Role Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role_id}</td>
              <td>{u.role_name}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  </MainLayout>
  );
}

export default AdminUsers;