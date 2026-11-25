import { getCommand, validateParams, type Params } from '../../visual-commands/src/index'
export type Vec3 = [number, number, number]
export type CameraPose = { position: Vec3; target: Vec3; up: Vec3; focalLengthMm: number; focusDistanceMeters: number }
export function cameraFieldOfViewDegrees(pose: CameraPose): number {
  if(!Number.isFinite(pose.focalLengthMm)||pose.focalLengthMm<12||pose.focalLengthMm>200) throw new Error('Distância focal fora de 12–200 mm.')
  return 2*Math.atan(18/pose.focalLengthMm)*180/Math.PI
}
const add = (a: Vec3,b: Vec3): Vec3 => [a[0]+b[0],a[1]+b[1],a[2]+b[2]]
const sub = (a: Vec3,b: Vec3): Vec3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const mul = (a: Vec3,n: number): Vec3 => [a[0]*n,a[1]*n,a[2]*n]
const len = (a: Vec3) => Math.hypot(...a)
const norm = (a: Vec3): Vec3 => { const l=len(a); if(l<1e-9) throw new Error('Câmera e alvo coincidem.'); return mul(a,1/l) }
const cross = (a: Vec3,b: Vec3): Vec3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const rotate = (v: Vec3,axis: Vec3,r: number): Vec3 => { const u=norm(axis),c=Math.cos(r),s=Math.sin(r),dot=u[0]*v[0]+u[1]*v[1]+u[2]*v[2]; return add(add(mul(v,c),mul(cross(u,v),s)),mul(u,dot*(1-c))) }

export function applyCommand(start: CameraPose,id: string,params: Params,progress: number): CameraPose {
  const command=getCommand(id), check=validateParams(id,params)
  if(!command || !check.ok) throw new Error(check.errors.join(' '))
  if(!Number.isFinite(progress)||progress<0||progress>1) throw new Error('Progresso inválido.')
  const distance=len(sub(start.target,start.position))
  if(distance<.1) throw new Error('Câmera muito próxima do alvo.')
  if(id==='dolly_in' && params.distanceMeters>=distance-.1) throw new Error('Dolly atravessaria o alvo.')
  const focal=id==='zoom_in'?start.focalLengthMm*params.factor:id==='zoom_out'?start.focalLengthMm/params.factor:start.focalLengthMm
  if(focal<12||focal>200) throw new Error('Distância focal final fora de 12–200 mm.')
  if(id==='focus_near'&&params.distanceMeters>=start.focusDistanceMeters) throw new Error('Foco próximo deve ficar mais perto.')
  if(id==='focus_far'&&params.distanceMeters<=start.focusDistanceMeters) throw new Error('Foco distante deve ficar mais longe.')
  if(progress===0) return start
  const v=params[command.key], angle=v*progress*Math.PI/180, forward=norm(sub(start.target,start.position)),right=norm(cross(forward,start.up))
  let position=start.position,target=start.target,up=start.up
  if(id.startsWith('truck_')) {const delta=mul(right,(id.endsWith('left')?-1:1)*v*progress);position=add(position,delta);target=add(target,delta)}
  if(id.startsWith('pedestal_')) {const delta: Vec3=[0,(id.endsWith('up')?1:-1)*v*progress,0];position=add(position,delta);target=add(target,delta)}
  if(id.startsWith('dolly_')) position=add(position,mul(forward,(id.endsWith('in')?1:-1)*v*progress))
  if(id.startsWith('orbit_')) position=add(target,rotate(sub(position,target),[0,1,0],(id.endsWith('left')?-1:1)*angle))
  if(id.startsWith('crane_')) position=add(target,rotate(sub(position,target),right,(id.endsWith('up')?-1:1)*angle))
  if(id.startsWith('pan_')) target=add(position,mul(rotate(forward,[0,1,0],(id.endsWith('left')?1:-1)*angle),distance))
  if(id.startsWith('tilt_')) target=add(position,mul(rotate(forward,right,(id.endsWith('up')?1:-1)*angle),distance))
  if(id.startsWith('roll_')) up=rotate(up,forward,(id.endsWith('left')?1:-1)*angle)
  return {position,target,up,focalLengthMm:id.startsWith('zoom_')?start.focalLengthMm+(focal-start.focalLengthMm)*progress:start.focalLengthMm,focusDistanceMeters:id.startsWith('focus_')?start.focusDistanceMeters+(v-start.focusDistanceMeters)*progress:start.focusDistanceMeters}
}
