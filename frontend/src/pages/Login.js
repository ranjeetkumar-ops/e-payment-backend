import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../api/axios";

export default function Login(){

const navigate = useNavigate()

useEffect(()=>{
  const token = localStorage.getItem("token")
  if(token){
    navigate("/home")
  }
}, [navigate])

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [error,setError] = useState("")
const [loading,setLoading] = useState(false)

const handleLogin = async (e)=>{
e.preventDefault()
try{
setLoading(true)
setError("")

const res = await axios.post(
"/auth/login",
new URLSearchParams({
username: username,
password: password
}),
{
headers:{
"Content-Type":"application/x-www-form-urlencoded"
}
}
)

console.log("LOGIN RESPONSE =", res.data)  
localStorage.setItem("token",res.data.access_token)
localStorage.setItem("user_id",res.data.user_id)
localStorage.setItem("username", username)
localStorage.setItem("name", res.data.name)
localStorage.setItem("role", res.data.role)
localStorage.setItem("warehouse", res.data.warehouse)
localStorage.setItem("warehouse_name",res.data.warehouse_name);
localStorage.setItem("warehouse_id",res.data.warehouse_id)

navigate("/home")

}catch(err){
setError("Invalid Username or Password")
}

setLoading(false)

}

return(

<div style={{
height:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"#f1f5f9"
}}>

<form onSubmit={handleLogin}
style={{
width:"350px",
background:"white",
padding:"30px",
borderRadius:"12px",
boxShadow:"0 8px 25px rgba(0,0,0,0.08)",
textAlign:"center"
}}>

<h2 style={{textAlign:"center",marginBottom:"25px"}}>
Payment Request System Protal
</h2>

<input
type="text"
placeholder="Enter Username"
value={username}
onChange={(e)=>setUsername(e.target.value)}
required
style={inputStyle}
/>

<input
type="password"
placeholder="Enter Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
style={inputStyle}
/>

{error && <p style={{color:"red"}}>{error}</p>}

<button style={btnStyle}>
{loading ? "Logging..." : "Login"}
</button>

</form>

</div>

)

}

const inputStyle = {
width:"80%",
padding:"10px",
marginBottom:"15px",
border:"1px solid #ddd",
borderRadius:"6px"
}

const btnStyle = {
width:"30%",
padding:"10px",
background:"#2563eb",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}