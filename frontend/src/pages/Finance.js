import MainLayout from "../Layouts/MainLayout";
import { useEffect, useState } from "react";
import axios from "../api/axios";

function Financepage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await axios.get("/payment-request/list");

      // ✅ Show only payment pending requests
      const filtered = res.data.filter(
        (item) => item.status === "pending_payment" || item.status === "Paid"
      );

      setList(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const markPaid = async (item) => {
    if (!item.utr) {
      alert("Enter UTR");
      return;
    }

    try {
      await axios.put(`/payment-request/update/${item.id}`, {
        utr_number: item.utr,
        status: "Paid", // ✅ Important
      });

      alert("Payment Done ✅");

      // ✅ Update UI instantly
      const updated = list.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            status: "Paid",
            utr_number: item.utr,
          };
        }
        return i;
      });

      setList(updated);
    } catch (err) {
      console.error(err);
      alert("Payment Failed ❌");
    }
  };

  const statusColor = (status) => {
    if (status === "Paid") {
      return { color: "#16a34a", fontWeight: "600" };
    }
    return { color: "#2563eb", fontWeight: "600" };
  };

  return (
    <MainLayout>
      <h2 style={{marginTop:0,marginBottom:"15px"}}>
        Payment Processing
      </h2>

      <div style={{background:"#fff",
                    padding:"0px",
                    borderRadius:"10px",
                    boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
                    //height:"75vh",
                    height:"calc(100vh - 100px)",
                    overflowY:"auto",
                     textAlign:"center",}}>
        <table style={{
                width:"100%",
                background:"#fff",
                borderRadius:"10px",
                boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
                borderCollapse:"collapse"
                }}>
          <thead style={{background:"#f3f4f6",
                            position:"sticky",
                            top:0,
                            zIndex:10
                            }}>
            <tr>
              <th>Request ID</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>UTR</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{item.request_code}</td>
                <td>{item.vendor}</td>

                <td style={statusColor(item.status)}>
                  {item.status}
                </td>

                <td>
                  {item.invoice_numbers?.map((inv, i) => (
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

                <td>₹ {item.grand_total}</td>

                <td>
                  {item.status === "pending_payment" ? (
                    <input
                      type="text"
                      placeholder="Enter UTR"
                      onChange={(e) =>
                        (item.utr = e.target.value)
                      }
                    />
                  ) : (
                    item.utr_number
                  )}
                </td>

                <td>
                  {item.status === "pending_payment" && (
                    <button
                      onClick={() => markPaid(item)} // ✅ FIXED
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Mark Paid
                    </button>
                  )}

                  {item.status === "Paid" && (
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "600",
                      }}
                    >
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Financepage;