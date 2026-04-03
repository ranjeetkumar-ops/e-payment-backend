// Invoice Toggle Option 
import MainLayout from "../Layouts/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";

function RequestDetails(){

const location = useLocation();
const navigate = useNavigate();

const request = location.state;

const [activeTab,setActiveTab] = useState(0);

if(!request){
return(
<MainLayout>
<h2>No Request Data Found</h2>
</MainLayout>
)
}

// APPROVE
const handleApprove = ()=>{
Swal.fire("Approved","","success");
};

// REJECT
const handleReject = ()=>{
Swal.fire({
title:"Enter Reject Reason",
input:"text",
showCancelButton:true
}).then(res=>{
if(res.value){
Swal.fire("Rejected","","error");
}
});
};

const inv = request.invoiceList[activeTab];

const subtotal = inv.items.reduce(
(s,item)=> s + (item.qty * item.price),0
);

const gstAmount = subtotal * inv.gst /100;
const total = subtotal + gstAmount;

return(

<MainLayout>

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<h2 style={{marginTop:0}}>Request Details</h2>

<button
onClick={()=>navigate(-1)}
style={{
background:"#2563eb",
color:"white",
border:"none",
padding:"6px 20px",
borderRadius:"5px"
}}
>
Back
</button>

</div>

<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)"
}}>

<p><b>Request ID :</b> {request.id}</p>
<p><b>Vendor :</b> {request.vendor}</p>
<p><b>Status :</b> {request.status}</p>
<p><b>Grand Total :</b> ₹ {request.grandTotal}</p>

<hr/>

{/* INVOICE TABS */}

<div style={{display:"flex",marginBottom:"15px",gap:"10px"}}>

{
request.invoiceList.map((x,i)=>(
<button
key={i}
onClick={()=>setActiveTab(i)}
style={{
padding:"6px 15px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
background: activeTab === i ? "#2563eb" : "#e5e7eb",
color: activeTab === i ? "white" : "black"
}}
>
Invoice {i+1}
</button>
))
}

</div>

{/* ACTIVE INVOICE */}

<div style={{
border:"1px solid #eee",
padding:"15px",
borderRadius:"8px"
}}>

<p><b>Invoice No :</b> {inv.invoiceNo}</p>
<p><b>Date :</b> {inv.invoiceDate}</p>

<table width="100%" border="1" style={{marginTop:"10px"}}>

<thead>
<tr>
<th>Description</th>
<th>Qty</th>
<th>Price</th>
<th>Total</th>
</tr>
</thead>

<tbody>

{
inv.items.map((item,i)=>{

const rowTotal = item.qty * item.price;

return(
<tr key={i}>
<td>{item.description}</td>
<td>{item.qty}</td>
<td>₹ {item.price}</td>
<td>₹ {rowTotal}</td>
</tr>
)
})
}

</tbody>

</table>

<p style={{marginTop:"10px"}}>Subtotal : ₹ {subtotal}</p>
<p>GST : ₹ {gstAmount}</p>
<h4>Total : ₹ {total}</h4>

{/* ATTACHMENT */}

<div style={{marginTop:"10px"}}>

<b>Attachment :</b>

{
inv.file ? (

<button
onClick={()=>window.open(URL.createObjectURL(inv.file))}
style={{
background:"#10b981",
color:"white",
border:"none",
padding:"6px 15px",
borderRadius:"5px",
marginLeft:"10px"
}}
>
View PDF
</button>

) : (
<span style={{marginLeft:"10px",color:"gray"}}>No Attachment</span>
)

}

</div>

</div>

</div>

{/* APPROVAL BUTTONS */}

<div style={{marginTop:"20px"}}>

<button
onClick={handleApprove}
style={{
background:"#10b981",
color:"white",
padding:"10px 25px",
border:"none",
borderRadius:"6px",
marginRight:"10px"
}}
>
Approve
</button>

<button
onClick={handleReject}
style={{
background:"#ef4444",
color:"white",
padding:"10px 25px",
border:"none",
borderRadius:"6px"
}}
>
Reject
</button>

</div>

</MainLayout>

)

}

export default RequestDetails;