import { useState, useEffect, useCallback } from "react";
import { FaBell, FaUserCircle, FaWarehouse } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function Header(){

const [warehouses, setWarehouses] = useState([])
const [showWarehouslist, setShowWarehouselist] = useState(false);
const [showMenu,setShowMenu] = useState(false);

const [selectedWarehouse, setSelectedWarehouse] = useState(
  localStorage.getItem("warehouse") || ""
)

const [selectedWarehouseName, setSelectedWarehouseName] = useState(
  localStorage.getItem("warehouse_name") || "Select Warehouse"
)

const navigate = useNavigate();

const loadWarehouses = useCallback(async ()=>{
  try{
    const res = await axios.get("/warehouse/my-warehouses")
    setWarehouses(res.data)

    const defaultWH = res.data.find(w => w.is_default === 1)

    if(defaultWH && !selectedWarehouse){
      selectWarehouse(defaultWH.id, defaultWH.warehouse_name)
    }else if(res.data.length > 0 && !selectedWarehouse){
      const first = res.data[0]
      selectWarehouse(first.id, first.warehouse_name)
    }

  }catch(err){
    console.log("Error loading warehouses")
  }
}, [selectedWarehouse])

const selectWarehouse = (id, name)=>{
  localStorage.setItem("warehouse", id)
  localStorage.setItem("warehouse_name", name) 

  setSelectedWarehouse(id)
  setSelectedWarehouseName(name)
  setShowWarehouselist(false)

  window.location.reload()
} 
const handleLogout = ()=>{
  localStorage.clear()
  navigate("/")
}

useEffect(()=>{
  loadWarehouses()
},[loadWarehouses])

return(

<div style={{
height:"45px",
background:"#ffffff",
borderBottom:"1px solid #ddd",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 20px",
zIndex: "1000"
}}>

<h3>Vendor Payment Portal</h3>

<div style={{
   display:"flex",
   alignItems:"center",
   gap:"20px"
}}>

<FaBell size={15} />

{/* Warehouse Dropdown */}
<div style={{position:"relative"}}>

<div
style={{display:"flex",alignItems:"center",gap:"5px",cursor:"pointer"}}
onClick={()=>setShowWarehouselist(!showWarehouslist)}
>
<FaWarehouse size={18}/>
<span>{selectedWarehouseName}</span>
</div>

{showWarehouslist && (
  <div style={{
    position:"absolute",
    top:"30px",
    background:"#fff",
    border:"1px solid #ddd",
    width:"200px",
  }}>
    {warehouses.map(w => (
      <div 
        key={w.id}
        style={{padding:"8px",cursor:"pointer"}}
        onClick={()=>selectWarehouse(w.id, w.warehouse_name)}
      >
        {w.warehouse_name}
      </div>
    ))}
  </div>
)}

</div>

{/* User */}
<div onClick={() => setShowMenu(prev => !prev)}>
    <FaUserCircle size={18}/>
</div>

{showMenu && (
<div style={{
position:"absolute",
right:"10px",
top:"45px",
background:"#fff",
border:"1px solid #ddd",
width:"150px"
}}>
<div style={{padding:"10px"}}>Profile</div>
<div style={{padding:"10px"}}>Change Password</div>
<div style={{padding:"10px",color:"red"}} onClick={handleLogout}>
Logout
</div>
</div>
)}

</div>
</div>

)
}

export default Header