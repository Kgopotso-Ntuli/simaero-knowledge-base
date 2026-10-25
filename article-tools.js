// Structured resolution steps and browser-local document attachments.
let pendingSteps=[],pendingDocuments=[],savingArticle=false;
let attachmentDatabase;
const documentTypes={pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',csv:'text/csv',rtf:'application/rtf'};
function fileSize(bytes){return bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.max(1,Math.round(bytes/1024))+' KB'}
function stepsFromArticle(article){
 if(Array.isArray(article?.resolutionSteps)&&article.resolutionSteps.length)return article.resolutionSteps.map(step=>({title:String(step.title||''),detail:String(step.detail||'')}));
 const notes=String(article?.notes||'').trim();if(!notes)return [{title:'',detail:''}];
 const chunks=notes.split(/\n\s*\n(?=\d+[.)]\s)/);
 if(chunks.every(chunk=>/^\d+[.)]\s/.test(chunk)))return chunks.map(chunk=>{const lines=chunk.replace(/^\d+[.)]\s+/,'').split('\n');return {title:lines.shift(),detail:lines.join('\n').trim()}});
 return [{title:'Resolution',detail:notes}];
}
function renderStepEditor(focusIndex=null){
 $('#resolutionSteps').innerHTML=pendingSteps.map((step,index)=>`<section class="step-editor"><div class="step-editor-top"><strong>Step ${index+1}</strong><div class="step-controls"><button type="button" data-step-move="${index}" data-direction="-1" ${index===0?'disabled':''} aria-label="Move step ${index+1} up">↑</button><button type="button" data-step-move="${index}" data-direction="1" ${index===pendingSteps.length-1?'disabled':''} aria-label="Move step ${index+1} down">↓</button><button type="button" data-step-remove="${index}" ${pendingSteps.length===1?'disabled':''} aria-label="Remove step ${index+1}">Remove</button></div></div><label>Action<input data-step-index="${index}" data-step-field="title" value="${esc(step.title)}" required maxlength="120" placeholder="For example: Check the visual input"></label><label>Details or result<textarea data-step-index="${index}" data-step-field="detail" maxlength="4000" placeholder="Describe what you did and the result.">${esc(step.detail)}</textarea></label></section>`).join('');
 $('#stepCount').textContent=pendingSteps.length+' step'+(pendingSteps.length===1?'':'s')+' · numbered automatically';
 $('#addResolutionStep').disabled=pendingSteps.length>=20||savingArticle;
 if(focusIndex!==null)$('#resolutionSteps').querySelector(`[data-step-index="${focusIndex}"][data-step-field="title"]`)?.focus();
}
resolutionMarkup=function(value){
 const steps=Array.isArray(value)?value:stepsFromArticle({notes:value});
 return '<ol class="resolution-steps">'+steps.map((step,index)=>'<li><span class="step-number">'+(index+1)+'</span><div><h4>'+esc(step.title)+'</h4>'+(step.detail?'<p>'+esc(step.detail)+'</p>':'')+'</div></li>').join('')+'</ol>';
};
function documentDatabase(){
 if(!attachmentDatabase)attachmentDatabase=new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(Error('Document storage is unavailable in this browser.'));return}
  const request=indexedDB.open('simaero-attachments',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('documents',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(Error('Unable to open document storage.'));
  request.onblocked=()=>reject(Error('Close older knowledge-base tabs and try again.'));
 }).catch(error=>{attachmentDatabase=null;throw error});
 return attachmentDatabase;
}
async function documentTransaction(mode,operation){
 const database=await documentDatabase();
 return new Promise((resolve,reject)=>{const transaction=database.transaction('documents',mode),store=transaction.objectStore('documents');let result;
 transaction.oncomplete=()=>resolve(result);transaction.onerror=()=>reject(Error('Document storage failed. Your browser may be out of space.'));transaction.onabort=()=>reject(Error('Document storage was interrupted.'));
 try{operation(store,value=>{result=value})}catch(error){transaction.abort();reject(error)}
 });
}
async function storeNewDocuments(documents){const fresh=documents.filter(document=>document.blob);if(fresh.length)await documentTransaction('readwrite',store=>fresh.forEach(document=>store.put(document)));return fresh.map(document=>document.id)}
async function removeStoredDocuments(ids){if(ids.length)await documentTransaction('readwrite',store=>ids.forEach(id=>store.delete(id)))}
async function readDocument(id){return documentTransaction('readonly',(store,result)=>{const request=store.get(id);request.onsuccess=()=>result(request.result)})}
function renderDocumentEditor(){
 $('#documentFiles').innerHTML=pendingDocuments.map((document,index)=>`<div class="document-file"><span class="document-icon" aria-hidden="true">▤</span><span><strong>${esc(document.name)}</strong><small>${fileSize(document.size)}</small></span><button type="button" data-document-remove="${index}" aria-label="Remove ${esc(document.name)}">Remove</button></div>`).join('');
 $('#documentStatus').textContent=pendingDocuments.length+' of 5 documents attached.';
}
function documentList(documents){
 const files=Array.isArray(documents)?documents:[];
 return files.length?'<div class="document-list">'+files.map(document=>'<button type="button" class="document-file document-download" data-document-download="'+esc(document.id)+'"><span class="document-icon" aria-hidden="true">▤</span><span><strong>'+esc(document.name)+'</strong><small>'+fileSize(document.size)+' · Download document</small></span><span aria-hidden="true">↓</span></button>').join('')+'</div>':'<p class="document-empty">No documents attached. Use Edit fault to upload a manual, worksheet or reference file.</p>';
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function blobDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Unable to export a document.'));reader.readAsDataURL(blob)})}
exportKnowledgeArticle=async function(article,filename='simaero-'+article.id+'.json'){
 try{
  const documents=[];for(const metadata of article.documents||[]){const document=await readDocument(metadata.id);if(!document?.blob)throw Error('A document is unavailable in this browser. Reattach it before exporting.');documents.push({...metadata,data:await blobDataUrl(document.blob)})}
  downloadBlob(new Blob([JSON.stringify({...article,documents},null,2)],{type:'application/json'}),filename);
 }catch(error){toast(error.message)}
};
const openBasicEditor=openEditor;
openEditor=function(id=null){
 openBasicEditor(id);if(id&&!editingOriginal)return;
 pendingSteps=stepsFromArticle(editingOriginal);pendingDocuments=(editingOriginal?.documents||[]).map(document=>({...document}));renderStepEditor();renderDocumentEditor();$('#documentError').textContent='';$('#formError').textContent='';
};
document.addEventListener('input',event=>{const field=event.target;if(field.dataset?.stepField){const step=pendingSteps[Number(field.dataset.stepIndex)];if(step)step[field.dataset.stepField]=field.value}});
$('#addResolutionStep').onclick=()=>{if(pendingSteps.length>=20||savingArticle)return;pendingSteps.push({title:'',detail:''});renderStepEditor(pendingSteps.length-1)};
$('#articleDocuments').onchange=event=>{
 $('#documentError').textContent='';const files=Array.from(event.target.files);
 try{
  if(files.length+pendingDocuments.length>5)throw Error('Attach up to 5 documents per article.');
  const additions=files.map(file=>{const extension=file.name.split('.').pop().toLowerCase();if(!documentTypes[extension])throw Error('Choose PDF, Word, Excel, PowerPoint, TXT, CSV or RTF documents.');if(file.size>25*1024*1024)throw Error(file.name+' is larger than 25 MB.');return {id:crypto.randomUUID(),name:file.name,size:file.size,type:documentTypes[extension],blob:file}});
  pendingDocuments.push(...additions);renderDocumentEditor();
 }catch(error){$('#documentError').textContent=error.message}finally{event.target.value=''}
};
document.addEventListener('click',async event=>{
 const removeStep=event.target.closest('[data-step-remove]');if(removeStep&&!savingArticle&&pendingSteps.length>1){pendingSteps.splice(Number(removeStep.dataset.stepRemove),1);renderStepEditor();return}
 const moveStep=event.target.closest('[data-step-move]');if(moveStep&&!savingArticle){const index=Number(moveStep.dataset.stepMove),destination=index+Number(moveStep.dataset.direction);if(destination>=0&&destination<pendingSteps.length){[pendingSteps[index],pendingSteps[destination]]=[pendingSteps[destination],pendingSteps[index]];renderStepEditor()}return}
 const removeDocument=event.target.closest('[data-document-remove]');if(removeDocument&&!savingArticle){pendingDocuments.splice(Number(removeDocument.dataset.documentRemove),1);renderDocumentEditor();return}
 const download=event.target.closest('[data-document-download]');if(download){try{const file=await readDocument(download.dataset.documentDownload);if(!file?.blob)throw Error('This file is unavailable in this browser. Reattach the document.');downloadBlob(file.blob,file.name)}catch(error){toast(error.message)}}
});
$('#articleForm').onsubmit=async event=>{
 event.preventDefault();if(savingArticle)return;$('#formError').textContent='';
 const form=new FormData(event.target),manualUrl=String(form.get('manualUrl')||'').trim();
 if(manualUrl&&!safeManualUrl(manualUrl)){$('#formError').textContent='Use a full https:// or http:// documentation link.';return}
 if(!pendingSteps.length||pendingSteps.some(step=>!step.title.trim())){$('#formError').textContent='Add an action for each resolution step.';return}
 const resolutionSteps=pendingSteps.map(step=>({title:step.title.trim(),detail:step.detail.trim()}));
 const sim=form.get('sim'),sims=editingOriginal&&sim===editingOriginal.sims[0]?[...editingOriginal.sims]:[sim];
 const article={...(editingOriginal||{}),id:editingId||crypto.randomUUID(),title:form.get('title'),category:form.get('category'),sims,summary:form.get('summary'),resolutionSteps,notes:resolutionSteps.map((step,index)=>(index+1)+'. '+step.title+(step.detail?'\n'+step.detail:'')).join('\n\n'),reference:form.get('reference'),manualUrl,sample:editingOriginal?.sample||false,images:[...pendingImages],documents:pendingDocuments.map(({id,name,type,size})=>({id,name,type,size}))};
 savingArticle=true;$('#articleFields').disabled=true;const button=$('#articleForm [type=submit]');button.disabled=true;button.textContent='Saving…';
 const previousDrafts=drafts;let newDocumentIds=[];
 try{
  newDocumentIds=await storeNewDocuments(pendingDocuments);
  drafts=[article,...drafts.filter(draft=>draft.id!==article.id)];localStorage.setItem('simaero-drafts',JSON.stringify(drafts));
 }catch(error){drafts=previousDrafts;try{await removeStoredDocuments(newDocumentIds)}catch{}$('#formError').textContent=error.message.includes('Document')?error.message:'Unable to save. Browser storage may be full. Remove an attachment or export older drafts and try again.';savingArticle=false;$('#articleFields').disabled=false;button.disabled=false;button.textContent=editingId?'Save changes':'Save local draft';return}
 const oldIds=(editingOriginal?.documents||[]).filter(document=>!article.documents.some(item=>item.id===document.id)).map(document=>document.id);
 try{await removeStoredDocuments(oldIds)}catch{/* A retained file can be cleared with site storage later. */}
 const wasEditing=Boolean(editingId);event.target.reset();pendingImages=[];pendingSteps=[];pendingDocuments=[];editingId=null;editingOriginal=null;savingArticle=false;$('#articleFields').disabled=false;button.disabled=false;button.textContent='Save local draft';showImagePreviews();renderDocumentEditor();$('#editor').close();
 $('#search').value='';$('#simFilter').value='';category='All systems';document.querySelectorAll('.chip').forEach(chip=>chip.classList.toggle('selected',chip.dataset.category===category));setView('all');toast(wasEditing?'Changes and attachments saved in this browser.':'Fault and attachments saved in this browser.');
};
$('#editor').addEventListener('cancel',event=>{if(savingArticle)event.preventDefault()});

