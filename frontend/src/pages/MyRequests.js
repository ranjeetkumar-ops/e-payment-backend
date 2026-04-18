import MainLayout from "../Layouts/MainLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"


function MyRequests(){

const navigate = useNavigate();

 const [list,setList] = useState([])
  useEffect(()=>{
      loadData()
   },[])
 const loadData = async () =>{
      const res = await axios.get("/payment-request/my-requests")
      setList(res.data)
   }

const handleEdit = (id) => {
   // store id if needed
   localStorage.setItem("draft_pr_id", id);

   // navigate to submit/edit page
   window.location.href = "/submit";
};
const [isIdAsc, setIsIdAsc] = useState(true);

const handleIdSort = () => {
  const sorted = [...list].sort((a, b) => {
    const numA = parseInt(a.request_code.replace("PR", "")) || "NA PR";
    const numB = parseInt(b.request_code.replace("PR", "")) || "NA PR";

    return isIdAsc ? numA - numB : numB - numA;
  });

  setList(sorted);
  setIsIdAsc(!isIdAsc);
};

const [isStatusAsc, setIsStatusAsc] = useState(true);

const getStatusRank = (status) => {
  if (status === "Draft") return 1;
  if (status.includes("Pending")) return 2;
  if (status === "Approved") return 3;
  if (status === "Rejected") return 4;
  return 5;
};

const handleStatusSort = () => {
  const sorted = [...list].sort((a, b) => {
    return isStatusAsc
      ? getStatusRank(a.status) - getStatusRank(b.status)
      : getStatusRank(b.status) - getStatusRank(a.status);
  });

  setList(sorted);
  setIsStatusAsc(!isStatusAsc);
};


return(

<MainLayout>


<h2 style={{marginTop:0,marginBottom:"15px"}}>My Payment Requests</h2>
<div style={{
background:"#fff",
padding:"0px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
//height:"75vh",
height:"calc(100vh - 100px)",
overflowY:"auto",

}}>


<table style={{
width:"100%",
background:"#fff",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
borderCollapse:"collapse"
}}>

<thead style={{
background:"#f3f4f6",
position:"sticky",
top:0,
zIndex:10
}}>


<tr>
<th style={{padding:"10px"}} onClick={handleIdSort} >Request ID {isIdAsc ? "↑" : "↓"}</th>
<th>Vendor</th>
<th onClick={handleStatusSort}>Status {isStatusAsc ? "↑" : "↓"}</th>
<th>Invoices</th>
<th>Amount</th>
<th>Action</th>
 <th></th>

</tr>

</thead>
{
list.map(req=>(

<tr key={req.id} style={{textAlign:"center",borderBottom:"1px solid #eee"}}>

<td style={{padding:"10px"}}>{req.request_code}</td>

<td>{req.vendor}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"6px",
background:
req.status === "Draft" ? "#9ca3af" :
req.status.includes("Pending") ? "#f59e0b" :
req.status === "Approved" ? "#10b981" :
req.status === "Rejected" ? "#ef4444" :
"#60a5fa",
}} >
{req.status}
</span>

</td>
{/* 
  {item.invoice_numbers?.map((inv, i) => (
                    <span
                      key={i} */}
<td>
{req.invoice_numbers?.map((inv, i) => (
                      <span
                      key={i}
                      style={{
                        display: "inline-block",
                        background: "#eef",
                        padding: "3px 6px",
                        margin: "2px",
                        borderRadius: "4px",
                      }}
                    >
                      {inv}
                    </span>
                  ))}
                </td>

<td style={{fontWeight:"500"}}>
₹ {req.amount?.toLocaleString()}
</td>

<td style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>

<button
onClick={()=>navigate("/requestdetails",{state:{id: req.id}})}
style={{
background:"#2563eb",
color:"white",
border:"none",
padding:"5px 12px",
borderRadius:"5px",
cursor:"pointer"
}}
>
Details
</button>
 <div style={{ width: "70px", marginLeft: "8px" }}>
    {req.status === "Draft" && (
      <button onClick={() => handleEdit(req.id)}
        style={{
          background: "#f59e0b",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Edit
      </button>
    )}
  </div>

</td>

</tr>

))
}

</table>
</div>

</MainLayout>

)

}

export default MyRequests;