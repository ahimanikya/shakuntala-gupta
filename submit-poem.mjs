import {submissionPoem} from './submission-data.mjs';
const make=(tag,text)=>{const e=document.createElement(tag);e.textContent=text||'';return e};
async function artwork(source){
 if(!source)return '';const response=await fetch(source.startsWith('assets/')?source+'?v=poetic-natural1':source);if(!response.ok)throw Error('Could not load the image.');const blob=await response.blob();
 if(!['image/webp','image/png','image/jpeg'].includes(blob.type)||blob.size>2097152)throw Error('Use a PNG, JPEG or WebP image up to 2 MB.');
 const bitmap=await createImageBitmap(blob);try{const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);for(const quality of [.9,.8,.7,.6,.45]){const result=canvas.toDataURL('image/jpeg',quality);if(result.length<=650000)return result;}throw Error('Choose a smaller image for this submission.')}finally{bitmap.close()}
}
export async function reviewSubmission(record){
 const poem=submissionPoem(record,await artwork(record.art));const id=crypto.randomUUID();const dialog=make('dialog');dialog.className='submission-dialog';dialog.setAttribute('aria-label','Review your submission');
 const close=make('button','Close'),title=make('h2','Submit for publication'),intro=make('p','Send this poem to the Editor’s Inbox. Nothing is published automatically. Private notes, publication notes and social links are excluded.'),preview=make('section'),account=make('section'),send=make('button','Send to Editor’s Inbox'),status=make('p');status.role='status';send.disabled=true;close.type=send.type='button';close.onclick=()=>dialog.close();
 preview.append(make('h3',poem.title),make('p',[poem.category,poem.written].filter(Boolean).join(' · ')));
 if(poem.art){const i=make('img');i.src=poem.art;i.alt=poem.artAlt;preview.append(i)}
 for(const l of ['or','en','hi']){const v=poem.versions[l];if(!v.body)continue;const d=make('details'),s=make('summary',({or:'ଓଡ଼ିଆ',en:'English',hi:'हिन्दी'})[l]);d.open=l===poem.originalLanguage;d.append(s,make('h3',v.title),make('pre',v.body));preview.append(d)}
 if(poem.publicationCredits)preview.append(make('h3','Publication credits'),make('pre',poem.publicationCredits));
 preview.append(make('p','A smaller image copy is included for review. Your original image remains in your notebook.'));
 dialog.append(close,title,intro,preview,account,send,status);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
 try{const client=await import('./firebase-client.mjs');client.mountAuth(account,async user=>{send.disabled=!user;if(user)status.textContent='Only accounts approved by the editor can submit.'});send.onclick=async()=>{send.disabled=true;close.disabled=true;try{status.textContent='Sending…';await client.submitPoem(id,poem);status.textContent='Received in the Editor’s Inbox. Reference: '+id;send.hidden=true;}catch(e){status.textContent=client.friendly(e)+' Retry uses the same reference, so a received poem will not be duplicated.';send.disabled=false;}finally{close.disabled=false}}}catch{status.textContent='Sign-in could not load. Check your connection and reopen this preview.'}
}
