import { expect, it } from 'vitest'
import { createProject } from '../packages/director-core/src/index'
import { exportGeneric } from '../packages/platform-adapters/src/index'

it('exporta um projeto e prompt genérico compatíveis entre si', () => {
  const project=createProject('Exemplo',{position:[0,2,5],target:[0,2,0],up:[0,1,0],focalLengthMm:35,focusDistanceMeters:5})
  project.scene.description='Estúdio vazio'
  const result=exportGeneric(project)
  expect(JSON.parse(result.projectJson).scene.description).toBe('Estúdio vazio')
  expect(result.prompt).toContain('Estúdio vazio')
  expect(result.warnings).toEqual([])
})
