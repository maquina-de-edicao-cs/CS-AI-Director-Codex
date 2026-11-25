import { createProject } from '../../../packages/director-core/src/index'
import { exportGeneric } from '../../../packages/platform-adapters/src/index'

const project=createProject('Exemplo de integração',{position:[0,2,5],target:[0,2,0],up:[0,1,0],focalLengthMm:35,focusDistanceMeters:5})
project.scene.description='Uma figura diante de um objeto de referência'
project.timeline.push({id:'example',commandId:'orbit_left',startSeconds:0,durationSeconds:3,params:{angleDegrees:45},enabled:true})
const exported=exportGeneric(project)
const root=document.getElementById('root')!
root.innerHTML='<h1>CS AI Director · Playground</h1><p>Exemplo de consumo do núcleo público.</p>'
const output=document.createElement('pre');output.textContent=exported.prompt;root.append(output)
