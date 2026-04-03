import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaHome,
  FaFileInvoice,
  FaList,
  FaCheckCircle,
  FaBell,
  FaCog,
  FaFileInvoiceDollar,
  FaUserTie,
  FaUserShield,
  FaRobot,
} from "react-icons/fa";

function Sidebar() {

// const username = localStorage.getItem("username")
const name = localStorage.getItem("name") 
const role = localStorage.getItem("role") || "USER"  
const [adminOpen, setAdminOpen] = useState(false);
const location = useLocation();

const menuItem = (path) => ({
display:"flex",
alignItems:"center",
gap:"12px",
padding:"12px 15px",
marginBottom:"5px",
borderRadius:"6px",
color: location.pathname === path ? "#2563eb" : "#374151",
background: location.pathname === path ? "#e8f0ff" : "transparent",
textDecoration:"none",
fontWeight:"500"
});

return (

<div style={{
width:"200px",
background:"#ffffff",
height:"100vh",
borderRight:"1px solid #e5e7eb",
display:"flex",
flexDirection:"column",
}}>

{/* Logo */}

<div style={{
display:"flex",
alignItems:"center",
gap:"10px",
padding:"18px",
borderBottom:"1px solid #eee"
}}>

<img
src="/cjdlLogo.png"
alt="logo"
style={{width:"180px", height:"60px"}}
/>


</div>

{/* User */}

<div style={{
padding:"10px",
borderBottom:"1px solid #eee"
}}>

{/* <div style={{fontWeight:"600"}}>UserName:{username}</div> */}
<div style={{fontWeight:"600"}}>{name}</div>
<div style={{fontSize:"12px",color:"#6b7280"}}>{role}</div>

</div>

{/* Menu */}

<div style={{
padding:"15px",
flex:"1"
}}>

<Link to="/home" style={menuItem("/home")}>
<FaHome/> Dashboard
</Link>

<Link to="/submit" style={menuItem("/submit")}>
<FaFileInvoice/> Submit Request
</Link>

<Link to="/requests" style={menuItem("/requests")}>
<FaList/> My Requests
</Link>
<Link to="/approval" style={menuItem("/approvals")}>
  <FaCheckCircle/>Approval
</Link>

{(role === "Accounts" || role === "Admin") && (
  <Link to="/finance" style={menuItem("/finance")}>
    <FaFileInvoiceDollar/> Finance
  </Link>
)}
<Link to="/notifications" style={menuItem("/notifications")}>
<FaBell/> Notifications
</Link>

<Link to="/settings" style={menuItem("/settings")}>
<FaCog/> Settings
</Link>
<Link to="/testpage" style={menuItem("/testpage")}>
  <FaCog/>Testpage
</Link>



<div>
{/* ADMIN MENU */}

{role === "Admin" &&
<div
style={{
padding:"10px",
cursor:"pointer",
background: adminOpen ? "#e8f0ff" : "transparent",
borderRadius:"6px"
}}
   onClick={()=>setAdminOpen(prev=>!prev)}
   
>
👤 Admin
</div>
}

{/* SUB MENU */}
{
adminOpen && (
<div style={{marginLeft:"20px"}}>

<div style={{padding:"2px"}}>
<Link to="/users" style={menuItem("/users")}><FaUserTie/>Users</Link>
</div>

<div style={{padding:"2px"}}>
<Link to="/roles" style={menuItem("/roles")}>
<FaList/>Roles</Link>
</div>

<div style={{padding:"2px"}}>
<Link to="/permissions" style={menuItem("/permissions")}>
<FaUserShield/>Permissions</Link>
</div>
<div style={{padding:"2PX"}}> 
<Link to ="/approval-level" state={menuItem("/approval-level")}>
<FaRobot/>Approval Level</Link>
</div>

</div>
)
}

</div>

</div>
</div>

);

}

export default Sidebar;