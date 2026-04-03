import MainLayout from "../../Layouts/MainLayout";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

function AdminRoles(){

const [roleName,setRoleName] = useState("");
const [level,setLevel] = useState("");
const [roles,setRoles] = useState([]);

const loadRoles = async()=>{
    try{
const res = await axios.get("http://127.0.0.1:8000/roles/list");
console.log("User Data:",res.data);
setRoles(res.data);
    }
    catch(err){
    console.log("ERROR STATUS:", err?.response?.status);
    console.log("ERROR DATA:", err?.response?.data);
    }
};


useEffect(()=>{
loadRoles();
},[])

const saveRole = async()=>{
await axios.post("http://127.0.0.1:8000/roles/create",{
role_name:roleName,
level_no:level
});
setRoleName("");
setLevel("");
loadRoles();
}

return(

<MainLayout>

<h2>Role Management</h2>

<div style={{background:"#fff",padding:"20px",borderRadius:"10px"}}>

<input
placeholder="Role Name"
value={roleName}
onChange={(e)=>setRoleName(e.target.value)}
/>

<input
placeholder="Level"
value={level}
onChange={(e)=>setLevel(e.target.value)}
/>

<button onClick={saveRole}>Save</button>

</div>

<br/>

<table style={{width:"100%",background:"#fff"}}>

<thead>
<tr>
<th>ID</th>
<th>Role</th>
<th>Level</th>
</tr>
</thead>

<tbody style={{textAlign : "center"}}>

{roles.map(r=>(
<tr key={r.id}>
<td>{r.id}</td>
<td>{r.role_name}</td>
<td>{r.level_no}</td>
</tr>
))}

</tbody>

</table>

</MainLayout>

)

}

export default AdminRoles;