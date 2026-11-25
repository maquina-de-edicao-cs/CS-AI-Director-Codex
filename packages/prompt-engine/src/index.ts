import type { DirectorProjectV1 } from '../../director-core/src/index'
import { validateProject } from '../../director-core/src/index'
import { getCommand } from '../../visual-commands/src/index'
export function renderPrompt(project: DirectorProjectV1): { text: string; warnings: string[] } {
  const {errors,warnings}=validateProject(project)
  if(errors.length) return {text:'',warnings:[...warnings,...errors]}
  const lines=[`Cena: ${project.title.trim()}.`]
  if(project.scene.description.trim()) lines.push(`Contexto visual: ${project.scene.description.trim()}.`)
  for(const item of [...project.timeline].filter(item=>item.enabled).sort((a,b)=>a.startSeconds-b.startSeconds||a.id.localeCompare(b.id))) {
    const command=getCommand(item.commandId)
    if(!command) continue
    const unit=command.key==='angleDegrees'?'°':command.key==='distanceMeters'?' m':'×'
    const value=`${item.params[command.key]}${unit}`
    const direction=item.commandId.endsWith('left')?'à esquerda':item.commandId.endsWith('right')?'à direita':item.commandId.endsWith('up')?'para cima':item.commandId.endsWith('down')?'para baixo':''
    const action=item.commandId.startsWith('orbit_')?`A câmera orbita ${value} ${direction} do alvo, mantendo o enquadramento`:item.commandId.startsWith('dolly_')?`A câmera ${item.commandId.endsWith('in')?'se aproxima':'se afasta'} ${value} do alvo`:item.commandId.startsWith('zoom_')?`A lente ${item.commandId.endsWith('in')?'aproxima':'afasta'} o enquadramento por ${value}, sem mover a câmera`:`A câmera executa ${command.label.toLocaleLowerCase('pt-BR')} em ${value}${direction?' '+direction:''}`
    lines.push(`${command.label}: ${value}. ${action} durante ${item.durationSeconds} segundos (início em ${item.startSeconds} s).`)
  }
  return {text:lines.join('\n'),warnings}
}
