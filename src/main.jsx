import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDotDashed,
  CircleX,
  Clock3,
  Film,
  Megaphone,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { api } from './api.js';
import { calendarDays, isoDate, monthKey, monthLabel, taskOccursInMonth, taskOccursOnDate } from './date.js';
import { calculateMarketingKpis, CONTENT_TYPES } from './kpi.js';
import './styles.css';

const TYPE_ICONS = { reel: Film, story: CircleDotDashed, property: Building2, ad: Megaphone };
const STATUS = {
  pending: { label: 'Pendiente', short: 'Pendiente', points: null, icon: Clock3 },
  done: { label: 'Publicado a tiempo', short: '100 · A tiempo', points: 100, icon: CheckCircle2 },
  late: { label: 'Publicado con atraso', short: '50 · Con atraso', points: 50, icon: Clock3 },
  missed: { label: 'No realizado', short: '0 · No realizado', points: 0, icon: CircleX },
};

function App() {
  const [view, setView] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draftType, setDraftType] = useState('reel');
  const [draftDate, setDraftDate] = useState('');
  const [notice, setNotice] = useState('');
  const days = useMemo(() => calendarDays(view), [view]);

  useEffect(() => { load(); }, [view]);

  async function load() {
    try {
      setTasks(await api.list(monthKey(view)));
      setNotice('');
    } catch {
      const stored = JSON.parse(localStorage.getItem('ritmo.tasks') || '[]');
      setTasks(stored);
      setNotice('Modo local · los cambios se guardan en este dispositivo');
    }
  }

  function saveLocal(next) {
    setTasks(next);
    localStorage.setItem('ritmo.tasks', JSON.stringify(next));
  }

  async function submit(event) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const data = {
      ...formData,
      end_date: formData.task_type === 'ad' ? (formData.end_date || formData.date) : '',
    };
    if (data.end_date && data.end_date < data.date) {
      setNotice('La fecha de finalización no puede ser anterior al inicio');
      return;
    }
    let next;
    if (editing) {
      const item = { ...editing, ...data };
      next = tasks.map((task) => task.id === editing.id ? item : task);
      try { await api.update(editing.id, item); } catch { setNotice('Cambio guardado localmente; no se pudo sincronizar'); }
    } else {
      const item = { ...data, id: crypto.randomUUID(), status: 'pending' };
      next = [...tasks, item];
      try { await api.create(item); } catch { setNotice('Tarea guardada localmente; no se pudo sincronizar'); }
    }
    saveLocal(next);
    setModal(false);
    setEditing(null);
  }

  async function setStatus(task, status) {
    const item = { ...task, status };
    saveLocal(tasks.map((current) => current.id === task.id ? item : current));
    try { await api.update(task.id, item); } catch { setNotice('Evaluación guardada localmente; no se pudo sincronizar'); }
  }

  async function remove(task) {
    saveLocal(tasks.filter((current) => current.id !== task.id));
    setModal(false);
    try { await api.remove(task.id); } catch { setNotice('Se eliminó localmente; no se pudo sincronizar'); }
  }

  const monthTasks = tasks.filter((task) => taskOccursInMonth(task, monthKey(view)));
  const kpis = calculateMarketingKpis(monthTasks);
  const counts = Object.fromEntries(
    ['done', 'late', 'missed'].map((status) => [status, monthTasks.filter((task) => task.status === status).length]),
  );

  function openNew(date) {
    const initialDate = date || isoDate(new Date());
    setSelected(initialDate);
    setEditing(null);
    setDraftType('reel');
    setDraftDate(initialDate);
    setModal(true);
  }

  function openEdit(task) {
    setSelected(task.date);
    setEditing(task);
    setDraftType(task.task_type || 'reel');
    setDraftDate(task.date);
    setModal(true);
  }

  return <main>
    <header>
      <div className="brand">
        <img className="brand-logo" src="/zu-black.png" alt="Zona Urbana" />
        <div><b>ZONA URBANA</b><span>Panel de marketing</span></div>
      </div>
      <button className="primary" onClick={() => openNew()}><Plus size={18} /> Programar contenido</button>
    </header>

    <section className="hero">
      <img className="hero-watermark" src="/zu-black.png" alt="" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">CONTROL DE CONTENIDO</p>
        <h1>tu contenido,<br /><em>tu resultado.</em></h1>
        <p>Planifica reels, historias, propiedades y pautas.<br />Convierte cada publicación en un KPI accionable.</p>
      </div>
      <div className="score">
        <div className="ring" style={{ '--p': `${kpis.score * 3.6}deg` }}>
          <strong>{kpis.score}</strong><span>de 100</span>
        </div>
        <div>
          <b>KPI ponderado mensual</b>
          <span><i className="dot done" />{counts.done} a tiempo · 100 pts</span>
          <span><i className="dot late" />{counts.late} con atraso · 50 pts</span>
          <span><i className="dot missed" />{counts.missed} no realizadas · 0 pts</span>
        </div>
      </div>
    </section>

    <section className="kpi-strip" aria-label="Desglose del KPI mensual">
      {kpis.categories.map((type) => {
        const Icon = TYPE_ICONS[type.id];
        return <article className={`kpi-card ${type.id} ${type.active ? '' : 'inactive'}`} key={type.id}>
          <div className="kpi-icon"><Icon size={19} /></div>
          <div className="kpi-copy"><b>{type.label}</b><span>{type.active ? `${type.scheduled} programadas · ${type.evaluated} evaluadas` : 'Sin programación este mes'}</span></div>
          <div className="kpi-value"><strong>{type.active ? type.score : '—'}</strong><span>{type.active ? `${type.effectiveWeight}% del cálculo` : 'Fuera del cálculo'}</span></div>
        </article>;
      })}
    </section>

    <section className="calendar-card">
      <div className="toolbar">
        <div><h2>{monthLabel(view)}</h2>{notice && <span className="notice">{notice}</span>}</div>
        <div className="nav">
          <button aria-label="Mes anterior" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><ChevronLeft /></button>
          <button onClick={() => setView(new Date())}>Hoy</button>
          <button aria-label="Mes siguiente" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><ChevronRight /></button>
        </div>
      </div>
      <div className="weekdays">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <b key={day}>{day}</b>)}</div>
      <div className="grid">
        {days.map((day) => {
          const key = isoDate(day);
          const dayTasks = tasks.filter((task) => taskOccursOnDate(task, key));
          const outside = day.getMonth() !== view.getMonth();
          const today = key === isoDate(new Date());
          return <div className={`day ${outside ? 'outside' : ''}`} key={key} onDoubleClick={() => openNew(key)}>
            <button className={`date ${today ? 'today' : ''}`} onClick={() => openNew(key)}>{day.getDate()}</button>
            <div className="events">
              {dayTasks.map((task) => {
                const type = CONTENT_TYPES.find((item) => item.id === (task.task_type || 'reel')) || CONTENT_TYPES[0];
                const points = STATUS[task.status]?.points;
                const isMultiDayAd = type.id === 'ad' && task.end_date && task.end_date !== task.date;
                return <button key={task.id} className={`event ${task.status} type-${type.id}`} onClick={() => openEdit(task)}>
                  <span className="event-meta"><b>{type.short}</b>{isMultiDayAd ? `${task.date} → ${task.end_date}` : task.time}</span>
                  <span className="event-title">{task.title}</span>
                  {points !== null && points !== undefined && <strong className="event-points">{points}</strong>}
                </button>;
              })}
            </div>
          </div>;
        })}
      </div>
    </section>

    <footer><span>Doble clic en un día para programar contenido.</span><span>ZONA URBANA · tu ciudad, tu futuro.</span><span>Reels 50% · Historias 20% · Propiedades 20% · Pautas 10%</span></footer>

    {modal && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div><p className="eyebrow">{editing ? 'EDITAR CONTENIDO' : 'NUEVO CONTENIDO'}</p><h2>{editing ? 'Ajusta la publicación' : 'Programa la entrega'}</h2></div>
          <button type="button" className="icon" aria-label="Cerrar" onClick={() => setModal(false)}><X /></button>
        </div>
        <label>Tipo de contenido
          <select name="task_type" required value={draftType} onChange={(event) => setDraftType(event.target.value)}>
            {CONTENT_TYPES.map((type) => <option value={type.id} key={type.id}>{type.singular} · peso {type.weight}%</option>)}
          </select>
        </label>
        <label>Contenido o campaña
          <input name="title" required autoFocus defaultValue={editing?.title} placeholder="Ej. Reel: recorrido Casa Roble" />
        </label>
        <div className="fields">
          <label>{draftType === 'ad' ? 'Fecha de inicio' : 'Fecha de publicación'}<input type="date" name="date" required defaultValue={editing?.date || selected} onChange={(event) => setDraftDate(event.target.value)} /></label>
          <label>Hora<input type="time" name="time" defaultValue={editing?.time || '09:00'} /></label>
        </div>
        {draftType === 'ad' && <label>Fecha de finalización
          <input type="date" name="end_date" required min={draftDate} defaultValue={editing?.end_date || editing?.date || selected} />
        </label>}
        <label>Notas<textarea name="notes" defaultValue={editing?.notes} placeholder="Copy, enlace, responsable o recordatorios…" /></label>
        {editing && <fieldset>
          <legend>Evaluación de la publicación</legend>
          <div className="statuses">
            {Object.entries(STATUS).map(([key, value]) => {
              const Icon = value.icon;
              return <button type="button" key={key} className={editing.status === key ? 'active' : ''} onClick={() => { setStatus(editing, key); setEditing({ ...editing, status: key }); }}>
                <Icon size={17} />{value.short}
              </button>;
            })}
          </div>
          <p className="score-help">100 = publicado a tiempo · 50 = publicado después de la fecha · 0 = no realizado</p>
        </fieldset>}
        <div className="actions">
          {editing && <button type="button" className="danger" onClick={() => remove(editing)}><Trash2 size={17} />Eliminar</button>}
          <span />
          <button type="button" className="ghost" onClick={() => setModal(false)}>Cancelar</button>
          <button className="primary" type="submit">Guardar</button>
        </div>
      </form>
    </div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
