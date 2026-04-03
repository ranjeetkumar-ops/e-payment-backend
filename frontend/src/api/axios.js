import axios from "axios";

const instance = axios.create({
  baseURL:process.env.REACT_APP_API_URL
})

instance.interceptors.request.use((config)=>{
  const token = localStorage.getItem("token")
  const warehouse = localStorage.getItem("warehouse")   // ⭐ ADD THIS

  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }

  if(warehouse){
    config.headers["warehouse"] = warehouse   // ⭐ ADD THIS
  }

  return config
})

export default instance