// Public-facing default content shown until the first tenant is configured.
// This is never used as an authentication page and contains no fake job photos.
export const fallbackTenant={
 slug:'handshake-trading',
 name:'Handshake Trading LLC',
 tagline:'Interior Fit-Out, Signage & Facility Solutions',
 address:'Muscat, Oman',
 phone:'+968 78074955',
 whatsapp:'+968 78074955',
 email:null,
 hero_url:null,
 logo_url:null,
};
export const fallbackServices=[
 {id:'interior',title:'Interior Fit-Out',description:'Professional interior fit-out and finishing for commercial spaces.',image_url:null},
 {id:'signage',title:'Signage & Branding',description:'Outdoor and indoor signage, 3D lettering, LED signs and branding.',image_url:null},
 {id:'mep',title:'MEP Works',description:'Electrical, plumbing, HVAC and associated installation services.',image_url:null},
 {id:'partition',title:'Partitions & Ceilings',description:'Gypsum, glass and steel partitions, decorative ceilings and finishes.',image_url:null},
 {id:'painting',title:'Painting & Finishing',description:'Wall preparation, painting and professional finishing.',image_url:null},
 {id:'maintenance',title:'Facility Maintenance',description:'General maintenance and building support services.',image_url:null},
];
