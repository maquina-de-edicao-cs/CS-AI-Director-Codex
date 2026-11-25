import { Component, type ReactNode } from 'react'
export class PreviewBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<div className="fallback"><strong>Prévia 3D indisponível neste navegador</strong><span>Os comandos, controles e prompts continuam disponíveis.</span></div>:this.props.children}
}
