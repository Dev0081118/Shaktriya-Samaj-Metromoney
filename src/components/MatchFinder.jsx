import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MatchFinder(){
  const {user}=useAuth(),navigate=useNavigate();
  const [form,setForm]=useState({profileFor:'Self',lookingFor:'Female',ageMin:'24',ageMax:'30',state:'Gujarat'});
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=e=>{e.preventDefault();const criteria={...form,preferredGender:form.lookingFor};if(!user){sessionStorage.setItem('ksm_matchfinder',JSON.stringify(criteria));navigate('/register');return}const q=new URLSearchParams({lookingFor:form.lookingFor,ageMin:form.ageMin,ageMax:form.ageMax,state:form.state});navigate(`/discover?${q}`)};
  return <form onSubmit={submit} className="page-container finder-grid">
    <Finder label="Profile created for"><select name="profileFor" value={form.profileFor} onChange={change}>{['Self','Son','Daughter','Brother','Sister','Relative'].map(x=><option key={x}>{x}</option>)}</select></Finder>
    <Finder label="Looking for"><select name="lookingFor" value={form.lookingFor} onChange={change}><option>Female</option><option>Male</option></select></Finder>
    <Finder label="Age range"><div className="finder-range"><select aria-label="Minimum age" name="ageMin" value={form.ageMin} onChange={change}>{Array.from({length:43},(_,i)=>18+i).map(x=><option key={x}>{x}</option>)}</select><span>–</span><select aria-label="Maximum age" name="ageMax" value={form.ageMax} onChange={change}>{Array.from({length:43},(_,i)=>18+i).map(x=><option key={x}>{x}</option>)}</select></div></Finder>
    <Finder label="Location"><select name="state" value={form.state} onChange={change}>{['Gujarat','Rajasthan','Maharashtra','Delhi','Madhya Pradesh','Uttar Pradesh','Other'].map(x=><option key={x}>{x}</option>)}</select></Finder>
    <button className="finder-submit"><span>Find Matches</span><ArrowUpRight size={18}/></button>
  </form>;
}
function Finder({label,children}){return <label className="finder-field"><span>{label}</span>{children}</label>}
