import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { BufferGeometry, Float32BufferAttribute, Group, PerspectiveCamera } from 'three'
import { sampleCamera, type DirectorProjectV1 } from '../../../packages/director-core/src/index'
import { cameraFieldOfViewDegrees, type CameraPose } from '../../../packages/camera-engine/src/index'

function Controls(){
  const {camera,gl}=useThree()
  useEffect(()=>{camera.position.set(9,7,10);camera.up.set(0,1,0);camera.lookAt(0,1,0);if(camera instanceof PerspectiveCamera){camera.fov=45;camera.updateProjectionMatrix()}const controls=new OrbitControls(camera,gl.domElement);controls.target.set(0,1,0);controls.enableDamping=true;let frame=0;const tick=()=>{controls.update();frame=requestAnimationFrame(tick)};tick();return()=>{cancelAnimationFrame(frame);controls.dispose()}},[camera,gl])
  return null
}
function DirectedView({pose}:{pose:CameraPose}){
  const {camera}=useThree()
  useEffect(()=>{camera.position.set(...pose.position);camera.up.set(...pose.up);camera.lookAt(...pose.target);if(camera instanceof PerspectiveCamera){camera.fov=cameraFieldOfViewDegrees(pose);camera.updateProjectionMatrix()}},[camera,pose])
  return null
}
function CameraMarker({pose}:{pose:CameraPose}){
  const marker=useRef<Group>(null)
  useEffect(()=>{if(!marker.current)return;marker.current.up.set(...pose.up);marker.current.lookAt(...pose.target)},[pose])
  return <group ref={marker} position={pose.position}><mesh rotation={[Math.PI/2,0,0]}><coneGeometry args={[.23,.55,4]}/><meshStandardMaterial color="#80f6d3" emissive="#1d6f62"/></mesh></group>
}
function Path({project}:{project:DirectorProjectV1}){
  const total=Math.max(3,...project.timeline.map(item=>item.startSeconds+item.durationSeconds))
  const geometry=useMemo(()=>{
    const points:number[]=[]
    for(let i=0;i<=80;i++){
      try {points.push(...sampleCamera(project,total*i/80,true).position)} catch {break}
    }
    const result=new BufferGeometry(); result.setAttribute('position',new Float32BufferAttribute(points,3));return result
  },[project,total])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  return <line><primitive object={geometry} attach="geometry" /><lineBasicMaterial color="#78f7ca" linewidth={2} /></line>
}
function Content({project,time,mode}:{project:DirectorProjectV1;time:number;mode:'camera'|'external'}){
  let pose=project.camera
  try {pose=sampleCamera(project,time,true)} catch { /* mantém última pose válida */ }
  return <>
    <color attach="background" args={['#101a27']}/>
    <ambientLight intensity={1.2}/><directionalLight position={[4,8,6]} intensity={2}/>
    <gridHelper args={[20,20,'#50657b','#293949']} position={[0,-.01,0]}/>
    <mesh position={[0,1,0]}><boxGeometry args={[1.2,2,1.2]}/><meshStandardMaterial color="#d6c7a3" roughness={.8}/></mesh>
    <mesh position={pose.target}><sphereGeometry args={[.12,12,12]}/><meshBasicMaterial color="#faab6e"/></mesh>
    {mode==='external'&&<><Path project={project}/><CameraMarker pose={pose}/><Controls/></>}
    {mode==='camera'&&<DirectedView pose={pose}/>}
  </>
}
export default function Scene({project,time,mode}:{project:DirectorProjectV1;time:number;mode:'camera'|'external'}){
  const [lost,setLost]=useState(false)
  if(lost)return <div className="fallback"><strong>Prévia 3D indisponível neste navegador</strong><span>Os comandos, controles e prompts continuam disponíveis.</span></div>
  return <Canvas camera={{position:[9,7,10],fov:45}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setLost(true)},{once:true})}}><Content project={project} time={time} mode={mode}/></Canvas>
}
