import MainLayout from "../../Layouts/MainLayout";
import React, { useEffect, useState } from "react";
import axios from "../../api/axios"


function ApprovalLevelPage(){

const [levels,setLevels] = useState([])
const [roles,setRoles] = useState([])

const [level_no,setLevelNo] = useState("")
const [role_id,setRoleId] = useState("")
const [level_name,setLevelName] = useState("")

const token = localStorage.getItem("token")

// Load Levels
const loadLevels = async()=>{
const res = await axios.get("/approval-level/all",{
headers:{Authorization:`Bearer ${token}`}
})
setLevels(res.data)
}

// Load Roles
const loadRoles = async()=>{
const res = await axios.get("/roles/list",{
headers:{Authorization:`Bearer ${token}`}
})
setRoles(res.data)
}

useEffect(()=>{
loadLevels()
loadRoles()
},[])


// Create Level
const createLevel = async()=>{
await axios.post("/approval-level/create",{
level_no:parseInt(level_no),
role_id:parseInt(role_id),
level_name
},{
headers:{Authorization:`Bearer ${token}`}
})

alert("Level Created")
loadLevels()
}


// Delete Level
const deleteLevel = async(id)=>{
await axios.delete(`/approval-level/delete/${id}`,{
headers:{Authorization:`Bearer ${token}`}
})

alert("Deleted")
loadLevels()
}

return(
<MainLayout>
<div style={{padding:"30px"}}>

<h2>Configure Approval Levels</h2>

<div style={{marginBottom:"20px"}}>

<input placeholder="Level No"
value={level_no}
onChange={(e)=>setLevelNo(e.target.value)}
/>

<select
value={role_id}
onChange={(e)=>setRoleId(e.target.value)}
>
<option>Select Role</option>
{
roles.map(r=>(
<option key={r.id} value={r.id}>
{r.role_name}
</option>
))
}
</select>

<input placeholder="Level Name"
value={level_name}
onChange={(e)=>setLevelName(e.target.value)}
/>

<button onClick={createLevel}>Create</button>

</div>


<table border="1" cellPadding="10">
<thead>
<tr>
<th>Level</th>
<th>Role</th>
<th>Name</th>
<th>Action</th>
</tr>
</thead>

<tbody>
{
levels.map(l=>(
<tr key={l.id}>
<td>{l.level_no}</td>
<td>{l.role_name}</td>
<td>{l.level_name}</td>
<td>
<button onClick={()=>deleteLevel(l.id)}>Delete</button>
</td>
</tr>
))
}
</tbody>
</table>

</div>
</MainLayout>
)
}

export default ApprovalLevelPage