import { useState } from "react";

function InvoiceForm(){

const [vendor,setVendor] = useState("")
const [invoiceNo,setInvoiceNo] = useState("")
const [amount,setAmount] = useState("")

const submitForm = () =>{

console.log({
vendor,
invoiceNo,
amount
})

alert("Invoice Submitted")

}

return(

<div style={{padding:"40px"}}>

<h2>Submit Invoice</h2>

<br/>

<input
placeholder="Vendor Name"
value={vendor}
onChange={(e)=>setVendor(e.target.value)}
/>

<br/><br/>

<input
placeholder="Invoice Number"
value={invoiceNo}
onChange={(e)=>setInvoiceNo(e.target.value)}
/>

<br/><br/>

<input
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<br/><br/>

<button onClick={submitForm}>
Submit Invoice
</button>

</div>

)

}

export default InvoiceForm