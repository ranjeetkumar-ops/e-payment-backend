import { useEffect, useState  } from "react"
import axios from "../api/axios"
import MainLayout from "../Layouts/MainLayout"
import { useNavigate } from "react-router-dom";

function ApprovalDashboard(){
   const navigate = useNavigate();
   const storedWarehouse = JSON.parse(localStorage.getItem("selectedWarehouse"));
   const [list, setList] = useState([])
   const [loadingId, setLoadingId] = useState(null)

   useEffect(()=>{
      loadData()
   },[])

   const loadData = async () =>{
      try{
         const res = await axios.get("/payment-request/pending-approval")
         setList(res.data)
      }catch(err){
         alert("Failed to load data")
      }
   }

   const [isIdAsc, setIsIdAsc] = useState(true);

   const handleIdSort = () => {
      const sorted = [...list].sort((a, b) => {
         const numA = parseInt(a.request_code.replace("PR", ""));
         const numB = parseInt(b.request_code.replace("PR", ""));

         return isIdAsc ? numA - numB : numB - numA;
      });

      setList(sorted);
      setIsIdAsc(!isIdAsc);
      };

   const [isStatusAsc, setIsStatusAsc] = useState(true);

   

   const approvePR = async (id) =>{
      setLoadingId(id)
      try{
         await axios.post(`/payment-request/approve/${id}`, {
         warehouse_id: storedWarehouse?.id});
         alert("Approved successfully")
         loadData()
      }catch(err){
         alert(err.response?.data?.detail || "Approval failed")
      }
      setLoadingId(null)
   }

   const rejectPR = async (id) =>{
      const reason = prompt("Enter Reject Reason")

      if(!reason) return

      setLoadingId(id)

      try{
         await axios.post(`/payment-request/reject/${id}?reason=${reason}`)
         alert("Rejected successfully")
         loadData()
      }catch(err){
         alert(err.response?.data?.detail || "Reject failed")
      }

      setLoadingId(null)
   }

   return(
    <MainLayout>
      <h2 style={{marginTop:0,marginBottom:"15px"}}>Pending Approvals</h2>
      <div style={{
                  background:"#fff",
                  padding:"20px",
                  borderRadius:"10px",
                  boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
                  //height:"75vh",
                  height:"calc(100vh - 100px)",overflowY:"auto",
                  textAlign:"center",
               }}>
                  

         <table style={{
                        width:"100%",
                        background:"#fff",
                        borderRadius:"10px",
                        boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
                        borderCollapse:"collapse"}}>
            <thead>
               <tr style={{background:"#f3f4f6"}}>
                  <th style={{padding:"10px",background:"#f3f4f6"}} 
                  onClick={handleIdSort} >Request ID {isIdAsc ? "↑" : "↓"}</th>
                  {/* <th>Vendor</th> */}
                  <th>Status</th>
                  <th>Invoices</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Action</th>
                  
               </tr>
            </thead>

            <tbody>
               {list.length === 0 ? (
                  <tr>
                     <td colSpan="5" style={{textAlign:"center"}}>
                        No pending approvals
                     </td>
                  </tr>
               ) : (
                  list.map(req => (
                     <tr key={req.id} style={{textAlign :"center"}}>
                        <td>{req.request_code}</td>
                     
                        <td>
                          {req.status === "Pending"
                            ? `Pending at L${req.current_level}`
                            : req.status}
                        </td>
                        
                            <td>{req.invoice_numbers?.map((inv, i) => (
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
                        <td>₹ {req.grand_total}</td>
                        <td>
                           <button
                           onClick={()=>navigate("/requestdetails",{state:{id: req.id}})}
                           style={{
                           background:"#2563eb",
                           color:"white",
                           border:"none",
                           padding:"5px 12px",
                           borderRadius:"5px",cursor:"pointer"}} >Details </button>
                           
                        </td>

                        <td>
                           <button 
                              onClick={()=>approvePR(req.id)}
                              disabled={loadingId === req.id}
                               style={{background:"#16a34a",
                                       color:"white",
                                       border:"none",
                                       padding:"6px 12px",
                                       borderRadius:"5px",
                                       marginRight:"8px",
                                       cursor:"pointer"
                                       }}>
                                       
                              {loadingId === req.id ? "Processing..." : "Approve"}
                           </button>

                           <button 
                              onClick={()=>rejectPR(req.id)}
                              disabled={loadingId === req.id}
                              style={{background:"#dc2626",
                                       color:"white",
                                       border:"none",
                                       padding:"6px 12px",
                                       borderRadius:"5px",
                                       cursor:"pointer"
                                       }}>
                              Reject
                           </button>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>

         </table>
      </div>
    </MainLayout>
   )
}

export default ApprovalDashboard