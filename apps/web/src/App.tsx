import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useDirectorStore } from './store'
import { PreviewBoundary } from './PreviewBoundary'
import { commands, getCommand } from '../../../packages/visual-commands/src/index'
import { exportProject, sampleCamera, validateProject } from '../../../packages/director-core/src/index'
import { renderPrompt } from '../../../packages/prompt-engine/src/index'

const units:Record<string,string>={angleDegrees:'Graus (°)',distanceMeters:'Distância (m)',factor:'Fator (×)'}
const Scene=lazy(()=>import('./Scene'))
const fileDownload=(name:string,text:string)=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const hasWebGL=()=>{if(typeof window==='undefined'||typeof window.WebGLRenderingContext==='undefined')return false;try{const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2')||canvas.getContext('webgl');context?.getExtension('WEBGL_lose_context')?.loseContext();return !!context}catch{return false}}

export default function App(){
  const {project,selectedId,time,playing,notice,addCommand,select,updateParam,removeSelected,setTime,setPlaying,setTitle,setSceneDescription,loadJson,setNotice}=useDirectorStore()
  const [query,setQuery]=useState('')
  const [viewMode,setViewMode]=useState<'camera'|'external'>('camera')
  const fileRef=useRef<HTMLInputElement>(null)
  const selected=project.timeline.find(item=>item.id===selectedId)
  const definition=selected?getCommand(selected.commandId):undefined
  const total=Math.max(3,...project.timeline.map(item=>item.startSeconds+item.durationSeconds))
  const validation=useMemo(()=>validateProject(project),[project])
  const prompt=useMemo(()=>renderPrompt(project),[project])
  let pose=project.camera
  try {pose=sampleCamera(project,time,true)} catch { /* exibe última pose válida */ }
  useEffect(()=>{
    if(!playing)return
    let frame=0,last=performance.now()
    const tick=(now:number)=>{const delta=(now-last)/1000;last=now;const state=useDirectorStore.getState();const end=Math.max(3,...state.project.timeline.map(item=>item.startSeconds+item.durationSeconds));const next=Math.min(end,state.time+delta);state.setTime(next);if(next>=end){state.setPlaying(false);return}frame=requestAnimationFrame(tick)}
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)
  },[playing])
  const onImport=async(file?:File)=>{if(!file)return;try{loadJson(await file.text())}catch(error){setNotice(error instanceof Error?error.message:'Arquivo inválido.')}}
  const webgl=useMemo(hasWebGL,[])
  const filtered=commands.filter(command=>(command.label+' '+command.id).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark">CS<span>·</span></div><div className="brand-title"><strong>AI Director</strong><small>ESTÚDIO DE CÂMERA</small></div>
      <div className="project-name"><label htmlFor="project-title">PROJETO</label><input id="project-title" value={project.title} onChange={event=>setTitle(event.target.value)}/></div>
      <label className="scene-description">Descrição da cena<input value={project.scene.description} onChange={event=>setSceneDescription(event.target.value)} placeholder="O que acontece na cena?"/></label>
      <span className="status-pill">● PROJETO LOCAL</span>
      <div className="header-actions"><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={event=>{void onImport(event.target.files?.[0]);event.target.value=''}}/><button onClick={()=>fileRef.current?.click()}>Importar</button><button disabled={validation.errors.length>0} title={validation.errors.length?'Corrija os erros antes de exportar.':''} onClick={()=>fileDownload('cs-ai-director.json',exportProject(project))}>Exportar projeto</button></div>
    </header>
    <main className="workspace-grid">
      <aside className="catalog-panel panel"><div className="panel-heading"><div><small>BIBLIOTECA</small><h2>Comandos</h2></div><span className="count">{commands.length}</span></div><p className="panel-intro">Movimentos cinematográficos para compor sua cena.</p><input className="search" aria-label="Buscar comandos" placeholder="Buscar movimento..." value={query} onChange={event=>setQuery(event.target.value)}/><div className="catalog-list">{filtered.map(command=><button className="command-card" key={command.id} onClick={()=>addCommand(command.id)}><span className="command-icon">↗</span><span><strong>{command.label}</strong><small>{command.group==='position'?'MOVIMENTO':command.group==='orientation'?'ORIENTAÇÃO':command.group==='lens'?'LENTE':'FOCO'}</small></span><span className="command-add">＋</span></button>)}</div><p className="catalog-note">Catálogo candidato · aguardando validação das referências originais.</p></aside>
      <section className="center-stack"><div className="viewport-panel panel"><div className="viewport-header"><div><small>SIMULADOR 3D</small><h2>Pré-visualização da cena</h2></div><div className="view-switch"><button className={viewMode==='camera'?'active':''} onClick={()=>setViewMode('camera')}>Visão da câmera</button><button className={viewMode==='external'?'active':''} onClick={()=>setViewMode('external')}>Visão externa</button></div></div><div className="viewport">{webgl?<PreviewBoundary><Suspense fallback={<div className="fallback">Preparando prévia 3D...</div>}><Scene project={project} time={time} mode={viewMode}/></Suspense></PreviewBoundary>:<div className="fallback"><strong>Prévia 3D indisponível neste navegador</strong><span>Os comandos, controles e prompts continuam disponíveis.</span></div>}{viewMode==='external'&&<div className="viewport-overlay">Arraste para orbitar · Role para aproximar</div>}</div><div className="transport"><button aria-label={playing?'Pausar':'Reproduzir'} className="play-button" onClick={()=>{if(time>=total)setTime(0);setPlaying(!playing)}}>{playing?'Ⅱ':'▶'}</button><button aria-label="Reiniciar" onClick={()=>{setPlaying(false);setTime(0)}}>↺</button><label className="timeline-slider"><span>{time.toFixed(1)} s</span><input aria-label="Posição na linha do tempo" type="range" min="0" max={total} step="0.05" value={time} onChange={event=>{setPlaying(false);setTime(Number(event.target.value))}}/><span>{total.toFixed(1)} s</span></label></div></div>
      <div className="timeline-panel panel"><div className="panel-heading"><div><small>SEQUÊNCIA</small><h2>Linha do tempo</h2></div><span className="count">{project.timeline.length} comandos</span></div>{project.timeline.length===0?<p className="empty-state">Selecione um comando à esquerda para começar a direção da cena.</p>:<div className="timeline-items">{project.timeline.map((item,index)=><button key={item.id} className={'timeline-item '+(selectedId===item.id?'active':'')} onClick={()=>{select(item.id);setTime(item.startSeconds)}}><span className="sequence-number">{String(index+1).padStart(2,'0')}</span><strong>{getCommand(item.commandId)?.label??item.commandId}</strong><small>{item.startSeconds.toFixed(1)}–{(item.startSeconds+item.durationSeconds).toFixed(1)} s</small></button>)}</div>}</div></section>
      <aside className="inspector-stack"><section role="region" aria-label="Parâmetros" className="inspector-panel panel"><div className="panel-heading"><div><small>CONTROLE DE CÂMERA</small><h2>Parâmetros</h2></div></div>{selected&&definition?<><p className="selected-command">{definition.label}</p><label className="field">{units[definition.key]}<input type="number" min={definition.min} max={definition.max} step="any" value={selected.params[definition.key]} onChange={event=>updateParam(definition.key,Number(event.target.value))}/><small>Intervalo: {definition.min}–{definition.max}</small></label><label className="field">Duração (s)<input type="number" min="0.1" max="60" step="0.1" value={selected.durationSeconds} onChange={event=>useDirectorStore.setState(state=>({project:{...state.project,timeline:state.project.timeline.map(item=>item.id===selected.id?{...item,durationSeconds:Number(event.target.value)}:item)}}))}/></label><button className="danger-button" onClick={removeSelected}>Remover comando</button></>:<p className="empty-state">Selecione um comando da linha do tempo para ajustar distância, ângulo ou foco.</p>}<div className="pose-data"><span>POSIÇÃO <b>{pose.position.map(n=>n.toFixed(1)).join(' · ')}</b></span><span>LENTE <b>{pose.focalLengthMm.toFixed(0)} mm</b></span></div></section><section className="prompt-panel panel"><div className="panel-heading"><div><small>SAÍDA</small><h2>Prompt cinematográfico</h2></div></div><textarea aria-label="Prompt gerado" readOnly value={prompt.text} /><div className="prompt-actions"><button onClick={()=>{void navigator.clipboard?.writeText(prompt.text).then(()=>setNotice('Prompt copiado.')).catch(()=>setNotice('Não foi possível copiar.'))}}>Copiar prompt</button><span>GENÉRICO · PT-BR</span></div></section></aside>
    </main>
    {(validation.errors.length>0||validation.warnings.length>0||notice)&&<div className="notice" role="status">{[...validation.errors,...validation.warnings,notice].filter(Boolean).join(' ')}</div>}
  </div>
}
