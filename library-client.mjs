import * as f from './firebase-client.mjs?v=owner2';
export {f};
export async function saveLibraryPoem(id,poem,visible,expected){
 const bytes=x=>new TextEncoder().encode(x).length;if(!poem.title.trim())throw Error('Add a title.');if(bytes(poem.title)>1200||bytes(poem.category)>320||bytes(poem.publicationCredits)>20000||bytes(poem.artAlt)>2000||poem.art.length>650000||Object.values(poem.versions).some(v=>bytes(v.title)>1200||bytes(v.body)>90000))throw Error('A poem field is too long. Shorten it before saving.');
 const privateRef=f.doc(f.db,'shakuntalaPoems',id),publicRef=f.doc(f.db,'shakuntalaPublic',id);
 await f.runTransaction(f.db,async tx=>{const current=await tx.get(privateRef);const stamp=current.exists()?current.data().updatedAt.toMillis():null;if(stamp!==expected)throw Error('This poem changed in another session. Reopen it before saving so those changes are not overwritten.');tx.set(privateRef,{poem,visible,updatedAt:f.serverTimestamp()});if(visible)tx.set(publicRef,{poem,updatedAt:f.serverTimestamp()});else tx.delete(publicRef)});
}
