export type Params = Record<string, number>
export type CommandDefinition = { id: string; label: string; defaults: Params; key: 'angleDegrees' | 'distanceMeters' | 'factor'; min: number; max: number; group: 'position' | 'orientation' | 'lens' | 'focus' }
type Row = [string, string, CommandDefinition['key'], number, number, number, CommandDefinition['group']]
const rows: Row[] = [
  ['pan_left','Panorâmica à esquerda','angleDegrees',30,1,180,'orientation'],
  ['pan_right','Panorâmica à direita','angleDegrees',30,1,180,'orientation'],
  ['tilt_up','Inclinar para cima','angleDegrees',20,1,85,'orientation'],
  ['tilt_down','Inclinar para baixo','angleDegrees',20,1,85,'orientation'],
  ['truck_left','Deslocar à esquerda','distanceMeters',2,.05,100,'position'],
  ['truck_right','Deslocar à direita','distanceMeters',2,.05,100,'position'],
  ['pedestal_up','Elevar câmera','distanceMeters',1,.05,100,'position'],
  ['pedestal_down','Abaixar câmera','distanceMeters',1,.05,100,'position'],
  ['dolly_in','Aproximar câmera','distanceMeters',2,.05,100,'position'],
  ['dolly_out','Afastar câmera','distanceMeters',2,.05,100,'position'],
  ['orbit_left','Orbitar à esquerda','angleDegrees',45,1,360,'position'],
  ['orbit_right','Orbitar à direita','angleDegrees',45,1,360,'position'],
  ['crane_up','Grua ascendente','angleDegrees',25,1,85,'position'],
  ['crane_down','Grua descendente','angleDegrees',25,1,85,'position'],
  ['zoom_in','Aproximar pelo zoom','factor',1.5,1.01,10,'lens'],
  ['zoom_out','Afastar pelo zoom','factor',1.5,1.01,10,'lens'],
  ['roll_left','Girar quadro à esquerda','angleDegrees',15,1,180,'orientation'],
  ['roll_right','Girar quadro à direita','angleDegrees',15,1,180,'orientation'],
  ['focus_near','Puxar foco para perto','distanceMeters',2,.1,1000,'focus'],
  ['focus_far','Puxar foco para longe','distanceMeters',10,.1,1000,'focus']
]
export const commands: CommandDefinition[] = rows.map(([id,label,key,value,min,max,group]) => ({id,label,key,defaults:{[key]:value},min,max,group}))
export const getCommand = (id: string): CommandDefinition | undefined => commands.find(command => command.id === id)
export function validateParams(id: string, params: Params): { ok: boolean; errors: string[] } {
  const command = getCommand(id)
  if (!command) return {ok:false,errors:[`Comando desconhecido: ${id}`]}
  const value = params[command.key]
  const errors: string[] = []
  if (!Number.isFinite(value) || value < command.min || value > command.max) errors.push(`${command.label}: valor fora do intervalo ${command.min}–${command.max}.`)
  for (const key of Object.keys(params)) if (key !== command.key) errors.push(`Parâmetro não reconhecido: ${key}.`)
  return {ok:errors.length===0,errors}
}
