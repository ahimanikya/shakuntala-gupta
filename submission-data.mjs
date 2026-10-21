export function submissionPoem(r,art='') {
 const versions=Object.fromEntries(['or','en','hi'].map(l=>[l,{title:r.versions?.[l]?.title||'',body:r.versions?.[l]?.body||''}]));
 const p={title:r.title,category:r.category||'',written:r.written||'',originalLanguage:r.originalLanguage,versions,art,artAlt:r.artAlt||'',publicationCredits:(r.publications||[]).map(x=>[x.name,x.type,x.date].filter(Boolean).join(' · ')).filter(Boolean).join('\n')};
 const bytes=x=>new TextEncoder().encode(x).length;
 if(!p.title.trim()||!versions[p.originalLanguage]?.body.trim())throw Error('Add a title and the original poem before submitting.');
 if(bytes(p.title)>1200||bytes(p.category)>320||bytes(p.artAlt)>2000||bytes(p.publicationCredits)>20000||Object.values(versions).some(v=>bytes(v.title)>1200||bytes(v.body)>90000))throw Error('This poem or its publication details exceed the submission size limit.');
 return p;
}
