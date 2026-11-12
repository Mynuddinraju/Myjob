'use client';
import {useEffect,useRef,useState} from 'react';

/** Mount photographs shortly before they enter the viewport to conserve bandwidth. */
export default function Reveal({children,index=0,className=''}:{children:React.ReactNode;index?:number;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const node=ref.current;if(!node)return;
  if(!('IntersectionObserver' in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'320px 0px',threshold:0.01});
  observer.observe(node);return()=>observer.disconnect();
 },[]);
 return <div ref={ref} className={`reveal-tile ${visible?'reveal-visible':''} ${className}`} style={{transitionDelay:visible?`${Math.min(index%4,3)*60}ms`:'0ms'}}>{visible?children:<div className="photo-skeleton" aria-hidden="true"/>}</div>;
}
