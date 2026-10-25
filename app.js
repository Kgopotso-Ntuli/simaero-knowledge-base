let shared=[],sharedMode=false;
const fleet=['CRJ 200','CRJ 700','DASH 8','Beech 1900D','EMB 190','EMB 145','ATR 72-500','ATR 72-200','ATR 42-300','ATR 42-500'];
// DASH 8 is one family; the fleet includes ten named variants across six families.
const categories=['All systems','Visual','Motion','Avionics','IOS','Misc'];
const seeds=[['Visual scene does not load at session start','Visual',['CRJ 200','CRJ 700'],'The outside view remains blank while the instructor station is available.']].map((x,i)=>({id:'sample-'+i,title:x[0],category:x[1],sims:x[2],summary:x[3],sample:true,notes:'Example investigation structure only:\n1. Record the exact indication, timestamp and affected station.\n2. Capture available logs and note when the issue began.\n3. Consult the current approved manufacturer documentation for this simulator.\n4. Record the confirmed cause, approved action and verification evidence.',reference:'Add the approved manual, revision and section before technical review.'}));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};let drafts=read('simaero-drafts',[]),saved=read('simaero-saved',[]),category='All systems',view='all';const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function allArticles(){
 const unique=new Map();
 for(const article of [...drafts,...shared,...seeds])if(!unique.has(article.id))unique.set(article.id,article);
 return [...unique.values()];
}
function persist(){localStorage.setItem('simaero-drafts',JSON.stringify(drafts));localStorage.setItem('simaero-saved',JSON.stringify(saved))}function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3000)}
$('#fleetNav').innerHTML=fleet.map(s=>`<button class="fleet-btn" data-sim="${s}">${s}</button>`).join('');for(const id of ['simFilter','formSim'])$('#'+id).insertAdjacentHTML('beforeend',fleet.map(s=>`<option>${s}</option>`).join(''));$('#formCategory').innerHTML=categories.slice(1).map(s=>`<option>${s}</option>`).join('');$('#categories').innerHTML=categories.map(s=>`<button class="chip ${s===category?'selected':''}" data-category="${s}">${s}</button>`).join('');
function render(){const all=allArticles();$('#articleCount').textContent=all.length;$('#savedCount').textContent=saved.length;const query=$('#search').value.toLowerCase().trim(),sim=$('#simFilter').value;const list=all.filter(a=>(view!=='saved'||saved.includes(a.id))&&(category==='All systems'||a.category===category)&&(!sim||a.sims.includes(sim))&&(!query||[a.title,a.summary,a.category,...a.sims].join(' ').toLowerCase().includes(query)));$('#resultCount').textContent=`${list.length} article${list.length===1?'':'s'}`;
$('#articles').innerHTML=view==='fleet'?fleet.map(s=>`<button class="card fleet-card" data-fleet-card="${s}"><span class="badge">SIMULATOR</span><h3>${s}</h3><p>${all.filter(a=>a.sims.includes(s)).length} knowledge articles <span class="arrow">↗</span></p></button>`).join(''):list.map(a=>`<article class="card" tabindex="0" role="button" data-id="${a.id}" aria-label="Read ${esc(a.title)}"><div class="card-top"><span class="badge ${a.category.toLowerCase()}">${esc(a.category)}</span><button class="bookmark ${saved.includes(a.id)?'on':''}" data-save="${a.id}" aria-label="${saved.includes(a.id)?'Unsave':'Save'} article" aria-pressed="${saved.includes(a.id)}">${saved.includes(a.id)?'★':'☆'}</button></div><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><div class="card-meta">${a.sims.map(s=>`<span class="sim-tag">${esc(s)}</span>`).join('')}</div><div class="card-bottom"><span class="draft">◌ ${a.sample?'Sample · not reviewed':a.shared?'Shared · not reviewed':'Local draft · not reviewed'}</span><span class="arrow">↗</span></div></article>`).join('');$('#empty').hidden=list.length>0||view==='fleet';document.querySelectorAll('[data-sim]').forEach(b=>b.classList.toggle('selected',b.dataset.sim===sim));}
function setView(v){view=v;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$('#breadcrumb').textContent=v==='saved'?'Saved articles':v==='fleet'?'Simulator fleet':'Knowledge base';$('#pageTitle').innerHTML=(v==='saved'?'Your saved knowledge':v==='fleet'?'Meet your simulator fleet':'Technical knowledge base')+'<span>.</span>';$('#listTitle').textContent=v==='fleet'?'Choose a simulator':'Explore the knowledge base';render()}
function detail(id){const a=allArticles().find(a=>a.id===id);if(!a)return;$('#detailContent').innerHTML=`<div class="dialog-top"><span class="badge">${esc(a.category)}</span><button class="close" data-close="detail" aria-label="Close">×</button></div><h2>${esc(a.title)}</h2><p class="muted">${a.sims.map(esc).join(' · ')}</p><div class="notice">${a.sample?'Sample article':a.shared?'Shared article':'Local draft'} — not technically reviewed. Use current approved simulator documentation for all maintenance actions.</div><div class="detail-block"><h3>Observed symptoms</h3><p>${esc(a.summary)}</p></div><div class="detail-block"><h3>Investigation notes</h3><p>${esc(a.notes)}</p></div><div class="detail-block"><h3>Documentation reference</h3><p>${esc(a.reference||'Not supplied')}</p></div>${imageGallery(a.images)}<button class="primary" id="editArticle">Edit fault</button> <button class="secondary" id="exportArticle">Export article (JSON)</button>`;$('#editArticle').onclick=()=>{ $('#detail').close();openEditor(a.id);};$('#exportArticle').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(a,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='simaero-'+a.id+'.json';link.click();URL.revokeObjectURL(url)};$('#detail').showModal()}
document.addEventListener('click',e=>{let b=e.target.closest('[data-save]');if(b){e.stopPropagation();const id=b.dataset.save;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persist();render();return}b=e.target.closest('[data-id]');if(b){detail(b.dataset.id);return}b=e.target.closest('[data-close]');if(b)$('#'+b.dataset.close).close();b=e.target.closest('[data-category]');if(b){category=b.dataset.category;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('selected',c===b));render()}b=e.target.closest('[data-sim],[data-fleet-card]');if(b){$('#simFilter').value=b.dataset.sim||b.dataset.fleetCard;setView('all')}b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);b=e.target.closest('[data-query]');if(b){$('#search').value=b.dataset.query;setView('all')}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus()}const card=e.target.closest('[data-id]');if(card&&(e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();detail(card.dataset.id)}});$('#search').oninput=render;$('#simFilter').onchange=render;$('#newArticle').onclick=()=>$('#editor').showModal();$('#reset').onclick=()=>{category='All systems';$('#search').value='';$('#simFilter').value='';document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('selected',b.dataset.category===category));render()};render();

// Image attachments stay with the browser-local draft and its JSON export.
let pendingImages=[],editingId=null,editingOriginal=null;
function openEditor(id=null){
 editingOriginal=id?allArticles().find(article=>article.id===id):null;
 if(id&&!editingOriginal)return;
 editingId=editingOriginal?.id||null;
 $('#articleForm').reset();
 pendingImages=(editingOriginal?.images||[]).filter(validImage).map(image=>({...image}));
 $('#editorTitle').textContent=editingOriginal?'Edit fault':'Add a knowledge article';
 $('#articleForm [type=submit]').textContent=editingOriginal?'Save changes':'Save local draft';
 $('#editorHelp').textContent=editingOriginal?'Changes are saved in this browser. Export the article to share your changes.':'Drafts are saved in this browser. Export to share with your team.';
 for(const key of ['title','summary','notes','reference'])$('#articleForm [name='+key+']').value=editingOriginal?.[key]||'';
 $('#formSim').value=editingOriginal?.sims?.[0]||fleet[0];
 $('#formCategory').value=categories.includes(editingOriginal?.category)?editingOriginal.category:categories[1];
 showImagePreviews();$('#imageError').textContent='';$('#imageStatus').textContent=pendingImages.length?pendingImages.length+' of 3 images attached.':'';
 $('#editor').showModal();
}
const validImage=image=>image&&typeof image.data==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image.data);
function imageGallery(images){
 const safe=Array.isArray(images)?images.filter(validImage):[];
 return safe.length?'<section class="detail-block"><h3>Attached images</h3><div class="image-gallery">'+safe.map(image=>'<figure><img src="'+esc(image.data)+'" alt="'+esc(image.name)+'"><figcaption>'+esc(image.name)+'</figcaption></figure>').join('')+'</div></section>':'';
}
function showImagePreviews(){
 $('#imagePreviews').innerHTML=pendingImages.map((image,i)=>'<figure><img src="'+esc(image.data)+'" alt="'+esc(image.name)+'"><figcaption>'+esc(image.name)+'</figcaption><button type="button" data-remove-image="'+i+'" aria-label="Remove '+esc(image.name)+'">Remove</button></figure>').join('');
}
async function prepareImage(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose PNG, JPG or WebP images.');
 if(file.size>10*1024*1024)throw Error('Each image must be smaller than 10 MB.');
 const url=URL.createObjectURL(file),image=new Image();
 try{
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('This image could not be opened. Choose another file.'));image.src=url});
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const data=canvas.toDataURL('image/jpeg',0.85);
  if(data.length>1100000)throw Error('This image is too detailed for browser storage. Choose a smaller image.');
  return {name:file.name,data};
 }finally{URL.revokeObjectURL(url)}
}
$('#articleImages').onchange=async event=>{
 const files=Array.from(event.target.files),button=$('#articleForm [type=submit]');$('#imageError').textContent='';
 if(pendingImages.length+files.length>3){$('#imageError').textContent='Attach up to 3 images per article.';event.target.value='';return}
 button.disabled=true;$('#imageStatus').textContent='Preparing images…';
 try{const additions=[];for(const file of files)additions.push(await prepareImage(file));
 if([...pendingImages,...additions].reduce((total,image)=>total+image.data.length,0)>2200000)throw Error('The combined images are too large. Choose smaller images.');
 pendingImages.push(...additions);showImagePreviews();
 }catch(error){$('#imageError').textContent=error.message}finally{event.target.value='';button.disabled=false;$('#imageStatus').textContent=pendingImages.length+' of 3 images attached.'}
};
document.addEventListener('click',event=>{const button=event.target.closest('[data-remove-image]');if(!button)return;pendingImages.splice(Number(button.dataset.removeImage),1);showImagePreviews();$('#imageStatus').textContent=pendingImages.length+' of 3 images attached.'});
$('#newArticle').onclick=()=>openEditor();
$('#articleForm').onsubmit=event=>{
 event.preventDefault();const form=new FormData(event.target);
 const sim=form.get('sim');
 const sims=editingOriginal&&sim===editingOriginal.sims[0]?[...editingOriginal.sims]:[sim];
 const article={...(editingOriginal||{}),id:editingId||crypto.randomUUID(),title:form.get('title'),category:form.get('category'),sims,summary:form.get('summary'),notes:form.get('notes'),reference:form.get('reference'),sample:editingOriginal?.sample||false,images:[...pendingImages]};
 const previousDrafts=drafts;
 drafts=[article,...drafts.filter(draft=>draft.id!==article.id)];
 try{persist()}catch{drafts=previousDrafts;$('#imageError').textContent='Browser storage is full. Remove an image or export older drafts before saving.';return}
 const wasEditing=Boolean(editingId);
 event.target.reset();pendingImages=[];editingId=null;editingOriginal=null;showImagePreviews();$('#imageError').textContent='';$('#imageStatus').textContent='';$('#editor').close();
 $('#search').value='';$('#simFilter').value='';category='All systems';document.querySelectorAll('.chip').forEach(button=>button.classList.toggle('selected',button.dataset.category===category));
 setView('all');toast(wasEditing?'Changes saved in this browser.':'Draft and images saved in this browser.');
};
