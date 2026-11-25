import { exportProject, validateProject, type DirectorProjectV1 } from '../../director-core/src/index'
import { renderPrompt } from '../../prompt-engine/src/index'
export function exportGeneric(project: DirectorProjectV1): { projectJson: string; prompt: string; warnings: string[] } {
  const validation=validateProject(project)
  if(validation.errors.length) throw new Error(validation.errors.join(' '))
  const rendered=renderPrompt(project)
  return {projectJson:exportProject(project),prompt:rendered.text,warnings:rendered.warnings}
}
