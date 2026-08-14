import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, ChevronRight, Plus, X, CalendarDays, Trash2, CheckCircle2, Clock3, CircleX } from 'lucide-react';
import { api } from './api.js';
import { calendarDays, isoDate, monthKey, monthLabel } from './date.js';
import './styles.css';

const STATUS = {
  pending: { label: 'Pendiente', short: 'Pendiente', icon: Clock3 },
  done: { label: 'Logrado', short: 'A tiempo', icon: CheckCircle2 },
  late: { label: 'Con atraso', short: 'Con atraso', icon: Clock3 },
  missed: { label: 'No ejecutado', short: 'No hecho', icon: CircleX },
};
const SAMPLE = [
  { id:'demo-1', title:'Revisión semanal', date:isoDate(new Date()), time:'09:00', status:'done', notes:'Revisar prioridades del mes' },
  { id:'demo-2', title:'Enviar propuesta', date:isoDate(new Date()), time:'14:30', status:'pending', notes:'' },
];

function App(){
  const [view,setView]=useState(new Date()); const [tasks,setTasks]=useState([]); const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null); const [notice,setNotice]=useState('');
  const days=useMemo(()=>calendarDays(view),[view]);
  useEffect(()=>{ load(); },[view]);
  async function load(){
    try { setTasks(await api.list(monthKey(view))); setNotice(''); }
    catch { const stored=JSON.parse(localStorage.getItem('ritmo.tasks')||'null'); setTasks(stored||SAMPLE); if(!api.enabled)setNotice('Modo local · conecta Cloudflare para sincronizar'); }
  }
  function saveLocal(next){ setTasks(next); localStorage.setItem('ritmo.tasks',JSON.stringify(next)); }
  async function submit(e){
    e.preventDefault(); const fd=new FormData(e.currentTarget); const data=Object.fromEntries(fd); let next;
    if(editing){ const item={...editing,...data}; next=tasks.map(t=>t.id===editing.id?item:t); try{await api.update(editing.id,item)}catch{} }
    else { const item={...data,id:crypto.randomUUID(),status:'pending'}; next=[...tasks,item]; try{await api.create(item)}catch{} }
    saveLocal(next); setModal(false); setEditing(null);
  }
  async function setStatus(task,status){ const item={...task,status}; saveLocal(tasks.map(t=>t.id===task.id?item:t)); try{await api.update(task.id,item)}catch{} }
  async function remove(task){ saveLocal(tasks.filter(t=>t.id!==task.id)); setModal(false); try{await api.remove(task.id)}catch{} }
  const monthTasks=tasks.filter(t=>t.date?.startsWith(monthKey(view))); const scored=monthTasks.filter(t=>t.status!=='pending');
  const counts=Object.fromEntries(['done','late','missed'].map(s=>[s,monthTasks.filter(t=>t.status===s).length]));
  const completion=scored.length?Math.round((counts.done+counts.late*.5)/scored.length*100):0;
  function openNew(date){setSelected(date||isoDate(new Date()));setEditing(null);setModal(true)}
  return <main>
    <header><div className="brand"><div className="brandmark"><CalendarDays size={24}/></div><div><b>Ritmo</b><span>Tu mes, con intención.</span></div></div><button className="primary" onClick={()=>openNew()}><Plus size={18}/> Nueva actividad</button></header>
    <section className="hero"><div><p className="eyebrow">PLANIFICADOR MENSUAL</p><h1>Haz espacio para<br/><em>lo que importa.</em></h1><p>Organiza tus compromisos, registra tu progreso<br/>y aprende del ritmo real de tus días.</p></div>
      <div className="score"><div className="ring" style={{'--p':`${completion*3.6}deg`}}><strong>{completion}%</strong><span>cumplimiento</span></div><div><b>Balance del mes</b><span><i className="dot done"/>{counts.done} logradas</span><span><i className="dot late"/>{counts.late} con atraso</span><span><i className="dot missed"/>{counts.missed} no ejecutadas</span></div></div>
    </section>
    <section className="calendar-card"><div className="toolbar"><div><h2>{monthLabel(view)}</h2>{notice&&<span className="notice">{notice}</span>}</div><div className="nav"><button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()-1,1))}><ChevronLeft/></button><button onClick={()=>setView(new Date())}>Hoy</button><button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()+1,1))}><ChevronRight/></button></div></div>
      <div className="weekdays">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=><b key={x}>{x}</b>)}</div>
      <div className="grid">{days.map(day=>{const key=isoDate(day), dayTasks=tasks.filter(t=>t.date===key), outside=day.getMonth()!==view.getMonth(),today=key===isoDate(new Date());return <div className={`day ${outside?'outside':''}`} key={key} onDoubleClick={()=>openNew(key)}><button className={`date ${today?'today':''}`} onClick={()=>openNew(key)}>{day.getDate()}</button><div className="events">{dayTasks.map(t=><button key={t.id} className={`event ${t.status}`} onClick={()=>{setEditing(t);setSelected(t.date);setModal(true)}}><span>{t.time}</span>{t.title}</button>)}</div></div>})}</div>
    </section>
    <footer><span>Doble clic en un día para crear una actividad.</span><span>Ritmo · Progreso sin presión</span></footer>
    {modal&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={submit}><div className="modal-head"><div><p className="eyebrow">{editing?'EDITAR ACTIVIDAD':'NUEVA ACTIVIDAD'}</p><h2>{editing?'Ajusta el plan':'Reserva este momento'}</h2></div><button type="button" className="icon" onClick={()=>setModal(false)}><X/></button></div>
      <label>Actividad<input name="title" required autoFocus defaultValue={editing?.title} placeholder="¿Qué quieres lograr?"/></label><div className="fields"><label>Fecha<input type="date" name="date" required defaultValue={editing?.date||selected}/></label><label>Hora<input type="time" name="time" defaultValue={editing?.time||'09:00'}/></label></div><label>Notas<textarea name="notes" defaultValue={editing?.notes} placeholder="Contexto, pasos o recordatorios…"/></label>
      {editing&&<fieldset><legend>¿Cómo salió?</legend><div className="statuses">{Object.entries(STATUS).map(([key,val])=>{const Icon=val.icon;return <button type="button" key={key} className={editing.status===key?'active':''} onClick={()=>{setStatus(editing,key);setEditing({...editing,status:key})}}><Icon size={17}/>{val.short}</button>})}</div></fieldset>}
      <div className="actions">{editing&&<button type="button" className="danger" onClick={()=>remove(editing)}><Trash2 size={17}/>Eliminar</button>}<span/><button type="button" className="ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="primary" type="submit">Guardar</button></div>
    </form></div>}
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);
