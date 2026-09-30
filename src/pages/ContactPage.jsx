import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";

export default function ContactPage(){
  const [state,setState]=useState({name:"",email:"",phone:"",category:"Account",message:""});
  const [status,setStatus]=useState("");
  const submit=async e=>{e.preventDefault();setStatus("Sending…");try{await api('/support',{method:'POST',body:JSON.stringify(state)});setStatus("Thank you. Your support request has been received.");setState({name:"",email:"",phone:"",category:"Account",message:""})}catch(error){setStatus(error.message)}};
  return <div className="public-shell"><Header solid/><main><section className="public-hero"><div className="page-container"><p className="eyebrow">Contact</p><h1>We’re here to help, discreetly.</h1><p>For account, profile, payment, safety or technical questions, send our support team a note.</p></div></section><section className="contact-section page-container"><div><p className="eyebrow">Support desk</p><h2>Tell us what you need.</h2><p>For immediate danger, contact local emergency services. Never include passwords, OTPs or payment credentials.</p></div><form onSubmit={submit} className="contact-form"><label>Name<input required value={state.name} onChange={e=>setState({...state,name:e.target.value})}/></label><label>Email<input required type="email" value={state.email} onChange={e=>setState({...state,email:e.target.value})}/></label><label>Phone (optional)<input value={state.phone} onChange={e=>setState({...state,phone:e.target.value})}/></label><label>Category<select value={state.category} onChange={e=>setState({...state,category:e.target.value})}>{['Account','Profile','Payment','Safety','Technical','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label className="full">Message<textarea required minLength="10" rows="6" value={state.message} onChange={e=>setState({...state,message:e.target.value})}/></label><button className="primary-button">Send request</button>{status&&<p role="status">{status}</p>}</form></section></main><Footer/></div>;
}
