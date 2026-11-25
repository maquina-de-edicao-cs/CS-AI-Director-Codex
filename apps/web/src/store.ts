import { create } from 'zustand'
import { createProject, importProject, type DirectorProjectV1 } from '../../../packages/director-core/src/index'
import { getCommand } from '../../../packages/visual-commands/src/index'

const initialCamera = { position:[0,2,5] as [number,number,number], target:[0,2,0] as [number,number,number], up:[0,1,0] as [number,number,number], focalLengthMm:35, focusDistanceMeters:5 }
const freshProject = () => createProject('Cena sem título',initialCamera)
type State = {
  project: DirectorProjectV1; selectedId: string | null; time: number; playing: boolean; notice: string
  addCommand: (id:string)=>void; select: (id:string)=>void; updateParam:(key:string,value:number)=>void
  removeSelected:()=>void; setTime:(time:number)=>void; setPlaying:(value:boolean)=>void; setTitle:(title:string)=>void; setSceneDescription:(description:string)=>void
  loadJson:(json:string)=>void; setNotice:(notice:string)=>void; reset:()=>void
}

export const useDirectorStore=create<State>((set,get)=>({
  project:freshProject(),selectedId:null,time:0,playing:false,notice:'',
  addCommand:(id)=>{
    const definition=getCommand(id); if(!definition)return
    const project=get().project
    const startSeconds=Math.max(0,...project.timeline.map(item=>item.startSeconds+item.durationSeconds))
    const instance={id:globalThis.crypto?.randomUUID?.()??`command-${Date.now()}`,commandId:id,startSeconds,durationSeconds:3,params:{...definition.defaults},enabled:true}
    set({project:{...project,timeline:[...project.timeline,instance]},selectedId:instance.id,time:startSeconds,notice:''})
  },
  select:(id)=>set({selectedId:id}),
  updateParam:(key,value)=>set(state=>({project:{...state.project,timeline:state.project.timeline.map(item=>item.id===state.selectedId?{...item,params:{...item.params,[key]:value}}:item)}})),
  removeSelected:()=>set(state=>({project:{...state.project,timeline:state.project.timeline.filter(item=>item.id!==state.selectedId)},selectedId:null})),
  setTime:(time)=>set({time}),setPlaying:(playing)=>set({playing}),
  setTitle:(title)=>set(state=>({project:{...state.project,title}})),
  setSceneDescription:(description)=>set(state=>({project:{...state.project,scene:{...state.project.scene,description}}})),
  loadJson:(json)=>{const result=importProject(json);set({project:result.project,selectedId:null,time:0,playing:false,notice:result.warnings.join(' ')||'Projeto carregado.'})},
  setNotice:(notice)=>set({notice}),
  reset:()=>set({project:freshProject(),selectedId:null,time:0,playing:false,notice:''})
}))
