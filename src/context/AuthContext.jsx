import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const hasToken=!!localStorage.getItem("ksm_token"); 
  const [user,setUser]=useState(null); 
  const [loading,setLoading]=useState(hasToken);
  
  useEffect(()=>{ const expired=()=>setUser(null);window.addEventListener('ksm:unauthorized',expired);if(hasToken)api("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("ksm_token")).finally(()=>setLoading(false));return()=>window.removeEventListener('ksm:unauthorized',expired); },[hasToken]);
  const authenticate=async(path,values)=>{const result=await api(path,{method:"POST",body:JSON.stringify(values)});localStorage.setItem("ksm_token",result.data.token);setUser(result.data.user);return result;};
  const value=useMemo(()=>({user,loading,isAuthenticated:!!user,login:v=>authenticate("/auth/login",v),register:v=>authenticate("/auth/register",v),logout:async()=>{try{await api("/auth/logout",{method:"POST"});}finally{localStorage.removeItem("ksm_token");setUser(null);}}}),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
