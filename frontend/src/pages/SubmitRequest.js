import MainLayout from "../Layouts/MainLayout";
import { useState, useRef ,useEffect} from "react";
import Swal from "sweetalert2";
import axios from "../api/axios";
function SubmitRequest(){

const [prId,setPrId] = useState(null);
const [vendor,setVendor] = useState("");
const [vendorList,setVendorList] = useState([])

const [list,setList] = useState([])
useEffect
(()=>{ loadData()},[])

useEffect(() => {
   const id = localStorage.getItem("draft_pr_id");
   if (id) {
      setPrId(id);
   }
}, []);

useEffect(() => {
   if (prId) {
      fetchPRDetails(prId);
   }
}, [prId]);

const fetchPRDetails = async (id) => {
   try {
      const res = await axios.get(`/payment-request/${id}`);
      const data = res.data;

      // set vendor
      setVendor(data.vendor_id);

      // map invoices
      const invoices = data.invoices.map(inv => ({
         invoiceNo: inv.invoice_no || "",
         invoiceDate: inv.invoice_date || "",
         gst: inv.gst_percent || 18,
         file: null,
         items: inv.items.map(it => ({
            description: it.description || "",
            qty: it.qty || 1,
            price: it.price || 0
         }))
      }));

      setInvoiceList(invoices.length ? invoices : []);
      
   } catch (err) {
      console.log(err);
   }
};

const loadData = async ()=>{
   const res = await axios.get("/payment-request/my-requests")
   setList(res.data)
}


useEffect(()=>{loadVendor()},[])

const loadVendor = async ()=>{
   const res = await axios.get("/vendor/list")
   setVendorList(res.data)
}


const [invoiceList,setInvoiceList] = useState([
{
invoiceNo:"",
invoiceDate:"",
gst:18,
file:null,
items:[{description:"",qty:1,price:0}]
}
]);

const lastInvoiceRef = useRef(null);

// ADD INVOICE
const addInvoice = ()=>{
setInvoiceList(prev => [
...prev,
{
invoiceNo:"",
invoiceDate:"",
gst:18,
file:null,
items:[{description:"",qty:1,price:0}]
}
]);

setTimeout(()=>{
lastInvoiceRef.current?.scrollIntoView({
behavior:"smooth",
block:"start"
});
},100);
};

// REMOVE INVOICE
const removeInvoice = (invIndex)=>{
const list=[...invoiceList];
list.splice(invIndex,1);
setInvoiceList(list);
};

// ADD ITEM
const addRow = (invIndex)=>{
const list=[...invoiceList];
list[invIndex].items.push({description:"",qty:1,price:0});
setInvoiceList(list);
};

// REMOVE ITEM
const removeRow = (invIndex,itemIndex)=>{
const list=[...invoiceList];
list[invIndex].items.splice(itemIndex,1);
setInvoiceList(list);
};

// UPDATE ITEM
const updateItem = (invIndex,itemIndex,field,value)=>{
const list=[...invoiceList];
list[invIndex].items[itemIndex][field]=value;
setInvoiceList(list);
};

// UPDATE INVOICE FIELD
const updateInvoiceField = (invIndex,field,value)=>{
const list=[...invoiceList];
list[invIndex][field]=value;
setInvoiceList(list);
};

// GRAND TOTAL
const grandTotal = invoiceList.reduce((sum,inv)=>{
const subtotal = inv.items.reduce(
(s,item)=> s + (item.qty * item.price),0
);
const gstAmount = subtotal * inv.gst /100;
return sum + subtotal + gstAmount;
},0);

const validateInvoices = () => {
   const today = new Date().toISOString().split("T")[0];

   for (let i = 0; i < invoiceList.length; i++) {
      const inv = invoiceList[i];

      // ✅ Invoice Number
      if (!inv.invoiceNo || inv.invoiceNo.trim() === "") {
         Swal.fire(`Invoice ${i + 1}: Invoice Number is required`, "", "warning");
         return false;
      }

      // ✅ Invoice Date
      if (!inv.invoiceDate) {
         Swal.fire(`Invoice ${i + 1}: Invoice Date is required`, "", "warning");
         return false;
      }

      if (inv.invoiceDate > today) {
         Swal.fire(`Invoice ${i + 1}: Date cannot be future`, "", "warning");
         return false;
      }

      // ✅ Items validation
      for (let j = 0; j < inv.items.length; j++) {
         const item = inv.items[j];

         // Description
         if (!item.description || item.description.trim() === "") {
            Swal.fire(`Invoice ${i + 1}, Row ${j + 1} \n Description required`, "", "warning");
            return false;
         }

         // Qty
         if (!item.qty || item.qty <= 0) {
            Swal.fire(`Invoice ${i + 1}, Row ${j + 1} \n Qty must be greater than 0`, "", "warning");
            return false;
         }

         // Price
         if (!item.price || item.price <= 0) {
            Swal.fire(`Invoice ${i + 1}, Row ${j + 1} \n Price must not be 0`, "", "warning");
            return false;
         }
      }

      // ✅ File upload required
      if (!inv.file) {
         Swal.fire(`Invoice ${i + 1}: Please upload invoice PDF`, "", "warning");
         return false;
      }
   }

   return true;
};

// SAVE DRAFT
const handleSaveDraft = async ()=>{

   if(!vendor){

      Swal.fire("Vendor Required","","warning");
      return;   
   }
   else if (!validateInvoices()){
      return;
   }

   try{

       const res= await axios.post("/payment-request/create",{
         vendor_id: Number(vendor),
         warehouse_id:Number(localStorage.getItem("warehouse_id")),
         created_by:Number(localStorage.getItem("user_id")),
         grand_total: Number(grandTotal)
      });

        const id = res.data.id;
        const prId = res.data.pr_id;
        setPrId(id);
      // ⭐ Store in localStorage (important if page refresh)
       localStorage.setItem("draft_pr_id",id);
      //  Swal.fire("Draft Created","","success");
       Swal.fire("Draft Created",`Draft ID : ${prId}`,"success"
       )
      //  .then(()=>{window.location.href = "/submit"});
      

   }catch(err){
      Swal.fire("Error",err.message,"error");
   }
   
};

// FINAL SUBMIT

const handleSubmit = async ()=>{

   let finalPrId = prId || localStorage.getItem("draft_pr_id");

   if(!finalPrId){
      Swal.fire("Please Save Draft First","","warning");
      return;
   }

   try{

      // ⭐ ADD INVOICES
       for(const inv of invoiceList){

   const formattedItems = inv.items.map(it => ({
      description: it.description,
      qty: Number(it.qty),
      price: Number(it.price)
   }));

   const subtotal = formattedItems.reduce(
      (s,item)=> s + (item.qty * item.price),0
   );

   const gstAmount = subtotal * Number(inv.gst) / 100;
   const total = subtotal + gstAmount;

   const res =  await axios.post("/invoice/add",{
      payment_request_id: Number(finalPrId),
      invoice_no: inv.invoiceNo,
      invoice_date: inv.invoiceDate,
      gst_percent: Number(inv.gst),
      subtotal: subtotal,
      gst_amount: gstAmount,
      total_amount: total,
      items: formattedItems,   // ⭐ send converted items
      // attachment_path: "demo.pdf"
   });

   const invoice_id = res.data.id;  

   if(inv.file){

      const formData = new FormData()
      formData.append("invoice_id", invoice_id)
      formData.append("file", inv.file)

      await axios.post("/attachments/upload", formData,{
         headers:{
            "Content-Type":"multipart/form-data"
         }
      });

   }

}
      // ⭐ FINAL SUBMIT
       const res = await axios.post(`/payment-request/submit/${finalPrId}`);
       const id = res.data.id;
       const prId = res.data.pr_id;
        setPrId(id);
      Swal.fire("Success","Request ID : "+ prId + " Submitted for Approval","success"
               ).then(()=>{window.location.href = "/requests"});

      // ⭐ clear stored id
      localStorage.removeItem("draft_pr_id");
      setPrId(null);

   }catch(err){
      Swal.fire("Error",err.response?.data?.detail || err.message,"error");
   }
};

return(

<MainLayout>

<h2 style={{marginBottom:"10px", marginTop:"2px"}}>Submit Payment Request</h2>

<div style={{
display:"grid",
gridTemplateColumns:"2fr 1fr",
gap:"25px",
width:"110%"

}}>

{/* LEFT PANEL */}

<div style={{
background:"#fff",
padding:"0px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
//height:"75vh",
height:"calc(100vh - 100px)",
overflowY:"auto",

}}>

{/* STICKY VENDOR */}

<div style={{
position:"sticky",
top:"0",
background:"#fff",
padding:"10px",
zIndex:"5",
borderBottom:"1px solid #eee",
}}>
<tr>
   <th style={{textAlign:"left"}}>Select Vendor </th>
<td>
<select
value={vendor}
onChange={(e)=>setVendor(e.target.value)}
style={{
width:"auto",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
>

<option value="">Select Vendor</option>

{
vendorList.map(v=>(
<option key={v.id} value={v.id}>
{v.vendor_name}
</option>
))
}

</select>
</td>


<label style={{marginLeft:"10px"}}>Search Payment Request </label>
<select value={prId} onChange={(e)=>setPrId(e.target.value)} style={{
width:"50%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}>
<option value="">Payment Request For Editing </option>
{
   
list.map(pr=>(
<option key={pr.id} value={pr.id}>
{pr.request_code}
</option>
))
}
</select> 

</tr>
</div>


{/* INVOICE LIST */}

<div style={{padding:"20px"}}>

{
invoiceList.map((inv,invIndex)=>{

const subtotal = inv.items.reduce(
(s,item)=> s + (item.qty * item.price),0
);

const gstAmount = subtotal * inv.gst /100;
const total = subtotal + gstAmount;

return(

<div
key={invIndex}
ref={invIndex === invoiceList.length-1 ? lastInvoiceRef : null}
style={{
border:"1px solid #eee",
padding:"10px",
width:"98%",
borderRadius:"8px",
marginBottom:"20px",
marginTop:"-15px",

}}>

<h3 style={{marginTop:"-8px"}}>Invoice {invIndex+1} </h3>
<div style={{marginTop:"-5px"}} >
<tr style={{justifyItems:"flex-end"}}>
   <label style={{padding:"10px"}}>Invoice Number</label> 
<input
placeholder="Invoice Number"
value={inv.invoiceNo}
onChange={(e)=>updateInvoiceField(invIndex,"invoiceNo",e.target.value)}
style={{
width:"200px",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>

<label style={{padding:"10px"}}>Invoice Date </label>
<td>
<input className="Submit"
type="date"
value={inv.invoiceDate}
onChange={(e)=>updateInvoiceField(invIndex,"invoiceDate",e.target.value)}
style={{
width:"200px",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"}}
/>
</td>
</tr>
</div>

<table width="100%" style={{marginTop:"15px",borderRadius:"5px" }} >

<thead>
<tr style={{background:"#f3f4f6", }}>

<th style={{width:"40%",padding:"7px",borderRadius:"5px"}}>Description</th>
<th style={{width:"8%",textAlign:"center"}}>Qty</th>
<th style={{width:"10%",padding:"3px",textAlign:"center"}}>Price</th>
<th style={{width:"15%",textAlign:"center"}}>Total</th>
<th style={{width:"10%"}}>Action</th>

</tr>
</thead>

<tbody>

{
inv.items.map((item,itemIndex)=>{

const rowTotal = item.qty * item.price;

return(
<tr key={itemIndex} >
<td>
<input
value={item.description}
onChange={(e)=>updateItem(invIndex,itemIndex,"description",e.target.value)}
type="text"
//onChange={(e)=>updateItem(index,"description",e.target.value)}
style={{
width:"95%",
padding:"10px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
/>
</td>

<td>
<input 
type="number"
value={item.qty}
onChange={(e)=>updateItem(invIndex,itemIndex,"qty",Number(e.target.value))}
style={{
textAlign:"center",
border:"1px solid #ddd",
borderRadius:"5px",
width:"75%",
padding:"8px"}}/>
</td>

<td style={{textAlign:"center"}}>
<input
type="number"
value={item.price}
onChange={(e)=>updateItem(invIndex,itemIndex,"price",Number(e.target.value))}
style={{
width:"80%",
padding:"8px",
textAlign:"center",
border:"1px solid #ddd",
borderRadius:"5px",
}}
/>
</td> 

<td style={{textAlign:"center",fontWeight:"600"}}> ₹ {rowTotal}</td>

<td style={{textAlign:"Center"}}> 
<button onClick={()=>removeRow(invIndex,itemIndex)}
style={{
background:"#ef4444",
color:"white",
border:"none",
padding:"7px 12px",
borderRadius:"5px",
cursor:"pointer"
}}  >
Remove
</button>
</td>
</tr>
)
})
}

</tbody>

</table>

<button onClick={()=>addRow(invIndex)} style={{
background:"#10b981",
color:"white",
padding:"8px 14px",
border:"none",
borderRadius:"6px",
cursor:"pointer",marginTop:"10px"}}>
+ Add Item
</button>

<hr/>

<p>
<label style={{padding:"5px" }}>Subtotal : ₹ {subtotal}</label></p>

<label style={{padding:"5px" }}>GST % </label>
<input
type="number"
value={inv.gst}
onChange={(e)=>updateInvoiceField(invIndex,"gst",Number(e.target.value))}
style={{
width:" 50px",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"}}
/>

<p><label style={{padding:"5px" }}> GST Amount : ₹ {gstAmount}</label></p>
 

<h3><label style={{padding:"5px" }} >Total : ₹ {total}</label></h3>

<label style={{padding:"5px"}} >Upload Invoice PDF</label>

<input
type="file"
accept=".pdf"
onChange={(e)=>updateInvoiceField(invIndex,"file",e.target.files[0])}
 style={{ background:"#dddddd",borderRadius:"5px" }}/>

{
inv.file && (
<button
style={{marginLeft:"10px", background:"#10b981",
color:"white",
padding:"8px 14px",
border:"none",
borderRadius:"6px",  }}
onClick={()=>window.open(URL.createObjectURL(inv.file))}
>
View
</button>
)
}

<br/><br/>

<button onClick={()=>removeInvoice(invIndex)} style={{
background:"#ef4444",
color:"white",
border:"none",
padding:"7px 12px",
borderRadius:"5px",
cursor:"pointer",
marginLeft:"6px"
}} >
Remove Invoice
</button>

</div>

)
})
}

<button onClick={addInvoice}
style={{
background:"#10b981",
color:"white",
padding:"8px 14px",
border:"none",
borderRadius:"6px",
cursor:"pointer",
position: "relative",
  top:" -10px"
}}>
    + Add Another Invoice</button>
</div>

</div>

{/* RIGHT SUMMARY */}

<div style={{
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
height:"fit-content",
position:"sticky",
top:"20px",
width:"60%"
}}>

<h3>Grand Total : ₹ {grandTotal}</h3>


<button
onClick={handleSaveDraft}
style={{
marginTop:"10px",
width:"100%",
background:"#9ca3af",
color:"white",
padding:"10px",
border:"none",
borderRadius:"6px"
}}
>
Save Draft
</button>

<button
onClick={handleSubmit}
style={{
marginTop:"10px",
width:"100%",
background:"#2563eb",
color:"white",
padding:"10px",
border:"none",
borderRadius:"6px"
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