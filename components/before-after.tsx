"use client";
import {useState} from 'react';
export default function BeforeAfter({after,before,alt}:{after:string;before?:string|null;alt:string}){
 const [value,setValue]=useState(50);
 if(!before)return <img src={after} alt={alt} loading="lazy" decoding="async"/>;
 return <div className="compare" aria-label={`Before and after: ${alt}`}>
   <img src={after} alt={`After: ${alt}`} loading="lazy" decoding="async"/>
   <div className="before-layer" style={{clipPath:`inset(0 ${100-value}% 0 0)`}}><img src={before} alt={`Before: ${alt}`} loading="lazy" decoding="async"/></div>
   <span className="compare-label before-tag">Before</span><span className="compare-label after-tag">After</span>
   <div className="compare-line" style={{left:`${value}%`}} aria-hidden="true"><span>↔</span></div>
   <input className="compare-range" type="range" min="0" max="100" value={value} onChange={e=>setValue(Number(e.target.value))} aria-label={`Move before and after slider for ${alt}`}/>
 </div>
}
