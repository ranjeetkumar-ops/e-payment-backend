import MainLayout from "../Layouts/MainLayout";
import { useState } from "react";
import Swal from "sweetalert2"

function SubmitRequest(){

const [vendor,setVendor] = useState("");
const [invoiceNo,setInvoiceNo] = useState("");
const [invoiceDate,setInvoiceDate] = useState("");
const [gst,setGst] = useState(18);

const [items,setItems] = useState([
{description:"",qty:1,price:0}
]);

const addRow = () =>{
setItems([...items,{description:"",qty:1,price:0}]);
};

const removeRow = (index)=>{
const updated=[...items];
updated.splice(index,1);
setItems(updated);
};

const updateItem = (index,field,value)=>{
const updated=[...items];
updated[index][field]=value;
setItems(updated);
};

const subtotal = items.reduce((sum,item)=>
sum + (item.qty * item.price)
,0);

const gstAmount = subtotal * gst / 100;
const grandTotal = subtotal + gstAmount;

// const handleSubmit = ()=>{
// alert("Payment Request Submitted");
// };
 const handleSubmit = () => {
    Swal.fire({
      title: "Success!",
      text: "Payment Request Submitted",
      icon: "success",
      confirmButtonText: "OK"
    });
  };

return(

<MainLayout>

<h2 style={{marginBottom:"20px"}}>Submit Payment Request</h2>

<div style={{
display:"grid",
gridTemplateColumns:"2fr 1fr",
gap:"25px"
}}>

{/* LEFT SIDE */}

<div style={{
background:"#fff",
padding:"25px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)"
}}>

{/* Invoice Details */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"20px",
marginBottom:"20px"
}}>

<div>
<label>Vendor / Warehouse</label>
<input
type="text"
value={vendor}
onChange={(e)=>setVendor(e.target.value)}
style={{
width:"100%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>
</div>

<div>
<label>Invoice Number</label>
<input
type="text"
value={invoiceNo}
onChange={(e)=>setInvoiceNo(e.target.value)}
style={{
width:"100%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>
</div>

<div>
<label>Invoice Date</label>
<input
type="date"
value={invoiceDate}
onChange={(e)=>setInvoiceDate(e.target.value)}
style={{
width:"100%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>
</div>

</div>


{/* Items Table */}

<table style={{
width:"100%",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{background:"#f3f4f6"}}>

<th style={{width:"50%",padding:"10px"}}>Description</th>
<th style={{width:"15%",textAlign:"center"}}>Qty</th>
<th style={{width:"15%",textAlign:"center"}}>Price</th>
<th style={{width:"10%",textAlign:"center"}}>Total</th>
<th style={{width:"10%"}}></th>

</tr>

</thead>

<tbody>

{items.map((item,index)=>{

const rowTotal = item.qty * item.price;

return(

<tr key={index}>

<td>

<input
type="text"
value={item.description}
onChange={(e)=>updateItem(index,"description",e.target.value)}
style={{
width:"100%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>

</td>

<td style={{textAlign:"center"}}>

<input
type="number"
value={item.qty}
onChange={(e)=>updateItem(index,"qty",e.target.value)}
style={{
width:"60px",
textAlign:"center"
}}
/>

</td>

<td style={{textAlign:"center"}}>

<input
type="number"
value={item.price}
onChange={(e)=>updateItem(index,"price",e.target.value)}
style={{
width:"80px",
textAlign:"center"
}}
/>

</td>

<td style={{textAlign:"center",fontWeight:"600"}}>
₹ {rowTotal}
</td>

<td style={{textAlign:"center"}}>

<button
onClick={()=>removeRow(index)}
style={{
background:"#ef4444",
color:"white",
border:"none",
padding:"5px 10px",
borderRadius:"5px",
cursor:"pointer"
}}
>
Remove
</button>

</td>

</tr>

)

})}

</tbody>

</table>


{/* Add Item */}

<div style={{marginTop:"15px"}}>

<button
onClick={addRow}
style={{
background:"#10b981",
color:"white",
padding:"8px 14px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
+ Add Item
</button>

</div>

</div>


{/* RIGHT SIDE SUMMARY */}

<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
height:"fit-content"
}}>

<h3>Summary</h3>

<hr/>

<p>Subtotal : ₹ {subtotal}</p>

<div style={{marginTop:"10px"}}>

<label>GST %</label>

<input
type="number"
value={gst}
onChange={(e)=>setGst(e.target.value)}
style={{
width:"60px",
marginLeft:"10px"
}}
/>

</div>

<p style={{marginTop:"10px"}}>

GST Amount : ₹ {gstAmount}

</p>

<h3 style={{marginTop:"10px"}}>

Grand Total : ₹ {grandTotal}

</h3>

<hr/>

<label>Upload Invoice PDF</label>

<br/>

<input type="file" accept=".pdf"/>

<button
onClick={handleSubmit}
style={{
marginTop:"20px",
width:"100%",
background:"#2563eb",
color:"white",
padding:"10px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Submit Payment Request
</button>

</div>

</div>

</MainLayout>

)

}

export default SubmitRequest;