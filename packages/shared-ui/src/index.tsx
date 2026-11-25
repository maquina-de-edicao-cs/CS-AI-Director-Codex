import type { ReactNode } from 'react'
export function PanelHeading({eyebrow,title,aside}:{eyebrow:string;title:string;aside?:ReactNode}){
  return <div className="panel-heading"><div><small>{eyebrow}</small><h2>{title}</h2></div>{aside}</div>
}
