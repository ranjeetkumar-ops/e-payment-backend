import MainLayout from "../Layouts/MainLayout";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios"


function MyRequests(){

const navigate = useNavigate();
const location = useLocation();
const role = (localStorage.getItem("role") || "USER").trim().toLowerCase();
const isAdmin = role === "admin";

 const [list,setList] = useState([])
 const [highlightId,setHighlightId] = useState(location.state?.highlightId || null)
 const loadData = useCallback(async () =>{
      const endpoint = isAdmin ? "/payment-request/list" : "/payment-request/my-requests";
      const res = await axios.get(endpoint)
      setList(res.data)
   }, [isAdmin])

  useEffect(()=>{
      loadData()
   },[loadData])

useEffect(() => {
   if (!highlightId || list.length === 0) return;

   const row = document.getElementById(`request-row-${highlightId}`);
   row?.scrollIntoView({
      behavior: "smooth",
      block: "center"
   });

   const timer = setTimeout(() => {
      setHighlightId(null);
   }, 8000);

   return () => clearTimeout(timer);
}, [highlightId, list]);

const handleEdit = (id) => {
   const selected = list.find((request) => request.id === id);

   localStorage.setItem("draft_pr_id", id);
   if (selected?.request_code) {
      localStorage.setItem("draft_pr_code", selected.request_code);
   }
   localStorage.setItem("edit_payment_request", "true");

   navigate("/submit", {
      state: {
         id,
         requestCode: selected?.request_code || ""
      }
   });
};
const [isIdAsc, setIsIdAsc] = useState(true);

const handleIdSort = () => {
  const sorted = [...list].sort((a, b) => {
    const numA = parseInt(String(a.request_code || "").replace("PR", "")) || 0;
    const numB = parseInt(String(b.request_code || "").replace("PR", "")) || 0;

    return isIdAsc ? numA - numB : numB - numA;
  });

  setList(sorted);
  setIsIdAsc(!isIdAsc);
};

const [isStatusAsc, setIsStatusAsc] = useState(true);

const getStatusRank = (status) => {
  status = String(status || "");
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

const getStatusTooltip = (req) => {
  if (req.next_approval) {
    return `Approver: ${req.next_approval.approvers?.length ? req.next_approval.approvers.join(", ") : "Not assigned"}${req.next_approval.role_name ? ` (${req.next_approval.role_name})` : ""}`;
  }

  if (req.rejected_by) {
    const levelText = req.rejected_by.level_no
      ? `L${req.rejected_by.level_no}${req.rejected_by.level_name ? ` - ${req.rejected_by.level_name}` : ""}`
      : "approval level";
    const rejectedBy = req.rejected_by.name
      ? `Cancelled at ${levelText} by: ${req.rejected_by.name}${req.rejected_by.role_name ? ` (${req.rejected_by.role_name})` : ""}`
      : `Cancelled at ${levelText}`;

    return req.rejected_by.reason
      ? `${rejectedBy}\nReason: ${req.rejected_by.reason}`
      : rejectedBy;
  }

  return "";
};


return(

<MainLayout>


<h2 style={{marginTop:0,marginBottom:"15px"}}>
{isAdmin ? "All Payment Requests" : "My Payment Requests"}
</h2>
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
{isAdmin && <th>Requester</th>}
<th>Vendor</th>
{isAdmin && <th>Warehouse</th>}
<th onClick={handleStatusSort}>Status {isStatusAsc ? "↑" : "↓"}</th>
<th>Invoices</th>
<th>Amount</th>
{isAdmin && <th>UTR</th>}
<th>Action</th>

</tr>

</thead>
{
list.map(req=>(

<tr
key={req.id}
id={`request-row-${req.id}`}
style={{
textAlign:"center",
borderBottom:"1px solid #eee",
background: String(highlightId) === String(req.id) ? "#fef3c7" : "transparent",
boxShadow: String(highlightId) === String(req.id) ? "inset 4px 0 0 #f59e0b" : "none",
transition:"background 0.3s ease"
}}
>

<td style={{padding:"10px"}}>{req.request_code}</td>

{isAdmin && <td>{req.requester || "-"}</td>}

<td>{req.vendor}</td>

{isAdmin && <td>{req.warehouse || "-"}</td>}

<td>

<span
title={getStatusTooltip(req)}
style={{
padding:"4px 10px",
borderRadius:"6px",
background:
req.status === "Draft" ? "#9ca3af" :
String(req.status || "").includes("Pending") ? "#f59e0b" :
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

{isAdmin && <td>{req.utr_number || "-"}</td>}

<td style={{padding:"10px", whiteSpace:"nowrap"}}>

<button
onClick={()=>navigate("/requestdetails",{state:{id: req.id}})}
style={{
background:"#2563eb",
color:"white",
border:"none",
padding:"5px 12px",
borderRadius:"5px",
cursor:"pointer",
marginRight: req.status === "Draft" ? "8px" : "0"
}}
>
Details
</button>
    {req.status === "Draft" && (
      <button onClick={() => handleEdit(req.id)}
        style={{
          background: "#f59e0b",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Edit
      </button>
    )}

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
