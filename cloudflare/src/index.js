const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,"Content-Type":"application/json"}});
export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers}); const url=new URL(request.url); const match=url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
  try{
    if(request.method==='GET'&&url.pathname==='/api/tasks'){const month=url.searchParams.get('month');const {results}=await env.DB.prepare('SELECT * FROM tasks WHERE date LIKE ? ORDER BY date,time').bind(`${month}%`).all();return json(results)}
    if(request.method==='POST'&&url.pathname==='/api/tasks'){const t=await request.json();await env.DB.prepare('INSERT INTO tasks (id,title,date,time,notes,status) VALUES (?,?,?,?,?,?)').bind(t.id,t.title,t.date,t.time||'',t.notes||'',t.status||'pending').run();return json(t,201)}
    if(request.method==='PUT'&&match){const t=await request.json();await env.DB.prepare('UPDATE tasks SET title=?,date=?,time=?,notes=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(t.title,t.date,t.time||'',t.notes||'',t.status||'pending',match[1]).run();return json({...t,id:match[1]})}
    if(request.method==='DELETE'&&match){await env.DB.prepare('DELETE FROM tasks WHERE id=?').bind(match[1]).run();return new Response(null,{status:204,headers})}
    return json({error:'Not found'},404);
  }catch(error){return json({error:'Database error',detail:error.message},500)}
}};
