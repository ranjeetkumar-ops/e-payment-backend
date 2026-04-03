import MainLayout from "../Layouts/MainLayout";
import Swal from "sweetalert2";
function Approvals()
{


const approvals = [
{
id:"REQ101",
vendor:"Delhi Warehouse",
invoice:"INV-500",
amount:6500,
status:"Pending"
},
{
id:"REQ102",
vendor:"Mumbai Vendor",
invoice:"INV-501",
amount:8200,
status:"Pending"
}
];

// const approve = (id)=>{
// alert("Approved : " + id);
// }
const approve = (id)=>{
  Swal.fire({
      title: "Success!",
      text: "Req ID : "+id,
      icon: "success",
      confirmButtonText: "OK"
    });
  };

const reject = (id)=>{
Swal.fire({
      title: "Reject!",
      text: "Req ID : "+id,
      icon: "error",
      confirmButtonText: "OK"
    });
}

return(

<MainLayout>

<h2 style={{marginBottom:"20px"}}>Pending Approvals</h2>

<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)"
}}>

<table style={{
width:"100%",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{background:"#f3f4f6"}}>

<th style={{padding:"10px"}}>Request ID</th>
<th style={{padding:"10px"}}>Vendor</th>
<th style={{padding:"10px"}}>Invoice</th>
<th style={{padding:"10px"}}>Amount</th>
<th style={{padding:"10px"}}>Action</th>

</tr>

</thead>

<tbody>

{approvals.map((r)=> (

<tr key={r.id} style={{borderBottom:"1px solid #eee"}}>

<td style={{padding:"10px"}}>{r.id}</td>
<td style={{padding:"10px"}}>{r.vendor}</td>
<td style={{padding:"10px"}}>{r.invoice}</td>
<td style={{padding:"10px"}}>₹ {r.amount}</td>

<td style={{padding:"10px"}}>

<button
onClick={()=>approve(r.id)}
style={{
background:"#16a34a",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"5px",
marginRight:"8px",
cursor:"pointer"
}}
>
Approve
</button>

<button
onClick={()=>reject(r.id)}
style={{
background:"#dc2626",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"5px",
cursor:"pointer"
}}
>
Reject
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</MainLayout>

)

}

export default Approvals