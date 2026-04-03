import MainLayout from "../Layouts/MainLayout";

function Home(){

const requests = [
{
id:"REQ001",
vendor:"ABC Logistics",
amount:5000,
status:"Pending",
date:"10 Mar 2026"
},
{
id:"REQ002",
vendor:"XYZ Transport",
amount:12000,
status:"Approved",
date:"09 Mar 2026"
},
{
id:"REQ003",
vendor:"Delhi Warehouse",
amount:8500,
status:"Rejected",
date:"08 Mar 2026"
}
]

return(

<MainLayout>
<h2>Dashboard</h2>

{/* Dashboard Cards */}

<div style={{
display:"flex",
gap:"20px",
marginTop:"20px"
}}>

<div style={{
background:"#3b82f6",
color:"white",
padding:"20px",
borderRadius:"8px",
width:"200px"
}}>
<h3>Total Requests</h3>
<p>15</p>
</div>

<div style={{
background:"#f59e0b",
color:"white",
padding:"20px",
borderRadius:"8px",
width:"200px"
}}>
<h3>Pending</h3>
<p>5</p>
</div>

<div style={{
background:"#10b981",
color:"white",
padding:"20px",
borderRadius:"8px",
width:"200px"
}}>
<h3>Approved</h3>
<p>8</p>
</div>

<div style={{
background:"#ef4444",
color:"white",
padding:"20px",
borderRadius:"8px",
width:"200px"
}}>
<h3>Rejected</h3>
<p>2</p>
</div>

</div>

{/* Recent Requests Table */}

<h3 style={{marginTop:"40px"}}>Recent Requests</h3>

<table style={{
width:"100%",
borderCollapse:"collapse",
background:"white"
}}>

<thead>

<tr style={{background:"#f3f4f6"}}>

<th style={{padding:"10px",border:"1px solid #ddd"}}>Request ID</th>
<th style={{padding:"10px",border:"1px solid #ddd"}}>Vendor</th>
<th style={{padding:"10px",border:"1px solid #ddd"}}>Amount</th>
<th style={{padding:"10px",border:"1px solid #ddd"}}>Status</th>
<th style={{padding:"10px",border:"1px solid #ddd"}}>Date</th>

</tr>

</thead>

<tbody>

{requests.map((r)=>(

<tr key={r.id}>

<td style={{padding:"10px",border:"1px solid #ddd"}}>{r.id}</td>
<td style={{padding:"10px",border:"1px solid #ddd"}}>{r.vendor}</td>
<td style={{padding:"10px",border:"1px solid #ddd"}}>{r.amount}</td>
<td style={{padding:"10px",border:"1px solid #ddd"}}>{r.status}</td>
<td style={{padding:"10px",border:"1px solid #ddd"}}>{r.date}</td>

</tr>

))}

</tbody>

</table>

</MainLayout>

)

}

export default Home