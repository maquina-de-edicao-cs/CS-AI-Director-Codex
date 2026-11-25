import type { CameraPose } from '../../camera-engine/src/index'
import { applyCommand } from '../../camera-engine/src/index'
import { getCommand, validateParams } from '../../visual-commands/src/index'
export type CommandInstance = { id: string; commandId: string; startSeconds: number; durationSeconds: number; params: Record<string, number>; enabled: boolean; easing?: 'linear' | 'easeInOut' }
export type DirectorProjectV1 = { schemaVersion: 1; id: string; title: string; scene: { description: string; scaleMeters: number }; camera: CameraPose; timeline: CommandInstance[] }
export const createProject = (title: string, camera: CameraPose): DirectorProjectV1 => ({ schemaVersion: 1, id: crypto.randomUUID(), title, scene: { description: '', scaleMeters: 1 }, camera, timeline: [] })
const sortTimeline = (timeline: CommandInstance[]) => [...timeline].sort((a,b) => a.startSeconds-b.startSeconds || a.id.localeCompare(b.id))
const property = (id: string) => id.startsWith('pan_')?'pan':id.startsWith('tilt_')?'tilt':id.startsWith('roll_')?'roll':getCommand(id)?.group

export function validateProject(project: DirectorProjectV1): { errors: string[]; warnings: string[] } {
  const errors: string[]=[],warnings: string[]=[]
  if(project.schemaVersion!==1) errors.push('Versão de projeto não suportada.')
  if(!project.title?.trim()) errors.push('O título é obrigatório.')
  if(!project.scene || typeof project.scene.description!=='string' || !Number.isFinite(project.scene.scaleMeters) || project.scene.scaleMeters<=0) errors.push('Descrição ou escala da cena inválida.')
  if(!project.camera || [...project.camera.position,...project.camera.target,...project.camera.up,project.camera.focalLengthMm,project.camera.focusDistanceMeters].some(value=>!Number.isFinite(value))) errors.push('Pose inicial inválida.')
  else {
    const {position,target,up,focalLengthMm,focusDistanceMeters}=project.camera
    const separation=Math.hypot(position[0]-target[0],position[1]-target[1],position[2]-target[2])
    const upLength=Math.hypot(...up)
    const forward:[number,number,number]=[target[0]-position[0],target[1]-position[1],target[2]-position[2]]
    const crossLength=Math.hypot(forward[1]*up[2]-forward[2]*up[1],forward[2]*up[0]-forward[0]*up[2],forward[0]*up[1]-forward[1]*up[0])
    if(separation<.1||upLength<1e-6||crossLength<1e-6||focalLengthMm<12||focalLengthMm>200||focusDistanceMeters<.1||focusDistanceMeters>1000) errors.push('Câmera inicial inválida: confira posição, alvo, orientação, lente e foco.')
  }
  const enabled=sortTimeline(project.timeline.filter(item=>item.enabled))
  const ids=new Set<string>()
  for(const item of project.timeline) {
    if(ids.has(item.id)) errors.push(`ID de instância duplicado: ${item.id}.`)
    ids.add(item.id)
    if(!Number.isFinite(item.startSeconds)||item.startSeconds<0||!Number.isFinite(item.durationSeconds)||item.durationSeconds<.1||item.durationSeconds>60) errors.push(`Tempo inválido em ${item.id}.`)
    if(item.easing && item.easing!=='linear' && item.easing!=='easeInOut') errors.push(`Interpolação inválida em ${item.id}.`)
    if(!getCommand(item.commandId)) {warnings.push(`Comando desconhecido: ${item.commandId}.`);continue}
    errors.push(...validateParams(item.commandId,item.params).errors)
  }
  for(let i=0;i<enabled.length;i++) for(let j=i+1;j<enabled.length;j++) {
    const a=enabled[i],b=enabled[j]
    if(b.startSeconds>=a.startSeconds+a.durationSeconds) break
    if(getCommand(a.commandId)&&getCommand(b.commandId)&&property(a.commandId)===property(b.commandId)) errors.push(`Comandos sobrepostos: ${a.id} e ${b.id}.`)
  }
  if(!errors.length) {
    for(const item of enabled) {
      if(!getCommand(item.commandId)) continue
      try { applyCommand(sampleCamera(project,item.startSeconds,true),item.commandId,item.params,1) }
      catch(error) { errors.push(`${item.id}: ${error instanceof Error?error.message:String(error)}`) }
    }
  }
  return {errors,warnings}
}

export function sampleCamera(project: DirectorProjectV1,timeSeconds: number,skipValidation=false): CameraPose {
  if(!Number.isFinite(timeSeconds)||timeSeconds<0) throw new Error('Tempo inválido.')
  if(!skipValidation) { const result=validateProject(project); if(result.errors.length) throw new Error(result.errors.join(' ')) }
  let pose=project.camera
  for(const item of sortTimeline(project.timeline.filter(item=>item.enabled&&item.startSeconds<=timeSeconds))) {
    if(!getCommand(item.commandId) || !validateParams(item.commandId,item.params).ok) continue
    const raw=Math.min(1,Math.max(0,(timeSeconds-item.startSeconds)/item.durationSeconds))
    const progress=item.easing==='linear'?raw:raw*raw*(3-2*raw)
    pose=applyCommand(pose,item.commandId,item.params,progress)
  }
  return pose
}
export const exportProject = (project: DirectorProjectV1) => JSON.stringify(project)
export function importProject(json: string): { project: DirectorProjectV1; warnings: string[] } {
  if(json.length>2_000_000) throw new Error('Arquivo excede 2 MB.')
  let value: unknown
  try {value=JSON.parse(json)} catch {throw new Error('JSON inválido.')}
  if(!value||typeof value!=='object') throw new Error('Projeto inválido.')
  const project=value as DirectorProjectV1
  if(project.schemaVersion!==1||typeof project.title!=='string'||!project.scene||!Array.isArray(project.timeline)||!project.camera||!Array.isArray(project.camera.position)||!Array.isArray(project.camera.target)||!Array.isArray(project.camera.up)) throw new Error('Formato de projeto não suportado.')
  if([project.camera.position,project.camera.target,project.camera.up].some(vec=>vec.length!==3||vec.some(value=>!Number.isFinite(value)))||project.timeline.some(item=>!item||typeof item!=='object'||typeof item.id!=='string'||typeof item.commandId!=='string'||typeof item.enabled!=='boolean'||!item.params||typeof item.params!=='object'||Array.isArray(item.params))) throw new Error('Formato de projeto inválido.')
  const result=validateProject(project)
  if(result.errors.length) throw new Error(result.errors.join(' '))
  return {project,warnings:result.warnings}
}
