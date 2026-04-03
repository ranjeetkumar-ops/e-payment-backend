import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
//import InvoiceForm from "./pages/InvoiceForm";
import Home from "./pages/Home";
import SubmitRequest from "./pages/SubmitRequest";  
import MyRequests  from "./pages/MyRequests";
import Approvals from  "./pages/Approvals";
import RequestDetails from "./pages/RequestDetails";  
import Finance from "./pages/Finance";
import Login from "./pages/Login"

//import { isLoggedIn } from "./utils/auth"
import PrivateRoute from "./utils/PrivateRoute";
import ApprovalDashboard from "./pages/ApprovalDashboard"
import ApprovalLevelPage from "./pages/admin/ApprovalLevelPage";



function App() {
  return (
    <div>
    <Routes>

<Route path="/" element={<Login/>} />

<Route path="/home" element={<PrivateRoute><Home/></PrivateRoute>} />
<Route path="/submit" element={<PrivateRoute><SubmitRequest/></PrivateRoute>} />
<Route path="/requests" element={<PrivateRoute><MyRequests/></PrivateRoute>} />
<Route path="/approvals" element={<PrivateRoute><Approvals/></PrivateRoute>} />
<Route path="/requestdetails" element={<PrivateRoute><RequestDetails/></PrivateRoute>} />
<Route path="/finance" element={<PrivateRoute><Finance/></PrivateRoute>}/>
<Route path="/permissions" element={<PrivateRoute><AdminDashboard/></PrivateRoute>} />
<Route path="/roles" element={<PrivateRoute><AdminRoles/></PrivateRoute>} />
<Route path="/users" element={<PrivateRoute><AdminUsers/></PrivateRoute>} />
<Route path="/notifications" element={<PrivateRoute><Home/></PrivateRoute>}/>
<Route path="/approval" element={<ApprovalDashboard/>}/>
<Route path="/approval-level" element={<ApprovalLevelPage/>}/>
</Routes>
   </div>
    
  );
}

export default App;