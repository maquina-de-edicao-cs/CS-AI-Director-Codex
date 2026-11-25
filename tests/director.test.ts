import { describe, expect, it } from 'vitest'
import { commands, getCommand, validateParams } from '../packages/visual-commands/src/index'
import { applyCommand, cameraFieldOfViewDegrees, type CameraPose } from '../packages/camera-engine/src/index'
import { createProject, exportProject, importProject, sampleCamera, validateProject } from '../packages/director-core/src/index'
import { renderPrompt } from '../packages/prompt-engine/src/index'

const start: CameraPose = {
  position: [0, 2, 5], target: [0, 2, 0], up: [0, 1, 0], focalLengthMm: 35, focusDistanceMeters: 5
}

describe('catálogo proposto', () => {
  it('oferece 20 comandos únicos com parâmetros padrão válidos', () => {
    expect(commands).toHaveLength(20)
    expect(new Set(commands.map(command => command.id)).size).toBe(20)
    for (const command of commands) expect(validateParams(command.id, command.defaults).ok).toBe(true)
  })
  it('rejeita parâmetros fora do intervalo', () => {
    expect(validateParams('pan_left', { angleDegrees: 181 }).ok).toBe(false)
    expect(getCommand('desconhecido')).toBeUndefined()
  })
})

describe('motor de câmera', () => {
  it('dolly aproxima sem atravessar o alvo', () => {
    const pose = applyCommand(start, 'dolly_in', { distanceMeters: 2 }, 1)
    expect(pose.position[2]).toBeCloseTo(3)
    expect(() => applyCommand(start, 'dolly_in', { distanceMeters: 6 }, 1)).toThrow()
  })
  it('zoom altera lente sem deslocar posição', () => {
    const pose = applyCommand(start, 'zoom_in', { factor: 2 }, 1)
    expect(pose.focalLengthMm).toBe(70)
    expect(pose.position).toEqual(start.position)
    expect(cameraFieldOfViewDegrees(pose)).toBeLessThan(cameraFieldOfViewDegrees(start))
  })
  it('órbita preserva a distância ao alvo', () => {
    const pose = applyCommand(start, 'orbit_left', { angleDegrees: 90 }, 1)
    expect(Math.hypot(pose.position[0], pose.position[2])).toBeCloseTo(5)
    expect(pose.position[0]).toBeLessThan(0)
  })
  it('grua ascendente eleva a câmera mantendo o alvo', () => {
    const pose = applyCommand(start, 'crane_up', { angleDegrees: 25 }, 1)
    expect(pose.position[1]).toBeGreaterThan(start.position[1])
    expect(pose.target).toEqual(start.target)
  })
  it('amostragem absoluta preserva as extremidades', () => {
    expect(applyCommand(start, 'truck_left', { distanceMeters: 2 }, 0)).toEqual(start)
    expect(applyCommand(start, 'truck_left', { distanceMeters: 2 }, 1).position[0]).toBeCloseTo(-2)
  })
})

describe('projeto e prompt', () => {
  it('executa comandos sequenciais e cria texto em pt-BR', () => {
    const project = createProject('Cena de teste', start)
    project.timeline.push({ id: 'a', commandId: 'dolly_in', startSeconds: 0, durationSeconds: 3, params: { distanceMeters: 2 }, enabled: true })
    project.timeline.push({ id: 'b', commandId: 'zoom_in', startSeconds: 3, durationSeconds: 3, params: { factor: 2 }, enabled: true })
    expect(validateProject(project).errors).toEqual([])
    expect(sampleCamera(project, 6).position[2]).toBeCloseTo(3)
    expect(sampleCamera(project, 6).focalLengthMm).toBe(70)
    expect(renderPrompt(project).text).toContain('Aproximar câmera')
  })
  it('identifica sobreposição da mesma propriedade', () => {
    const project = createProject('Conflito', start)
    project.timeline.push({ id: 'a', commandId: 'pan_left', startSeconds: 0, durationSeconds: 3, params: { angleDegrees: 30 }, enabled: true })
    project.timeline.push({ id: 'b', commandId: 'pan_right', startSeconds: 1, durationSeconds: 3, params: { angleDegrees: 20 }, enabled: true })
    expect(validateProject(project).errors.some(message => message.includes('sobrepostos'))).toBe(true)
  })
  it('preserva comando desconhecido ao importar sem executá-lo', () => {
    const project = createProject('Legado', start)
    project.timeline.push({ id: 'x', commandId: 'future_command', startSeconds: 0, durationSeconds: 2, params: {}, enabled: true })
    const imported = importProject(exportProject(project))
    expect(imported.project.timeline[0].commandId).toBe('future_command')
    expect(imported.warnings.length).toBeGreaterThan(0)
    expect(sampleCamera(imported.project, 2)).toEqual(start)
  })
  it('aplica aceleração suave quando não se escolhe interpolação linear', () => {
    const project = createProject('Movimento suave', start)
    project.timeline.push({ id: 'ease', commandId: 'dolly_in', startSeconds: 0, durationSeconds: 4, params: { distanceMeters: 2 }, enabled: true })
    expect(sampleCamera(project, 1).position[2]).toBeCloseTo(4.6875)
  })
  it('expande a intenção de câmera com contexto da cena', () => {
    const project = createProject('Retrato', start)
    project.scene.description = 'Uma bailarina em um palco vazio'
    project.timeline.push({ id: 'move', commandId: 'orbit_left', startSeconds: 0, durationSeconds: 3, params: { angleDegrees: 45 }, enabled: true })
    const text = renderPrompt(project).text
    expect(text).toContain('Uma bailarina em um palco vazio')
    expect(text).toContain('A câmera orbita 45° à esquerda')
  })
  it('rejeita uma linha do tempo malformada com erro legível', () => {
    const invalid = JSON.stringify({...createProject('Inválido',start),timeline:[null]})
    expect(() => importProject(invalid)).toThrow(/inválido|formato/i)
  })
  it('rejeita câmera inicial sem direção ou com lente fora do intervalo', () => {
    const project=createProject('Câmera inválida',start)
    project.camera={...start,target:[0,2,5],up:[0,0,0],focalLengthMm:500}
    expect(() => importProject(exportProject(project))).toThrow(/câmera|pose/i)
  })
  it('rejeita vetor para cima paralelo à direção de visão', () => {
    const project=createProject('Orientação inválida',start)
    project.camera={...start,up:[0,0,-1]}
    expect(() => importProject(exportProject(project))).toThrow(/câmera|orientação/i)
  })
})
