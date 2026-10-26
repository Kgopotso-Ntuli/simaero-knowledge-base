let shared=[],sharedMode=false;
const fleet=['CRJ 200','CRJ 700','DASH 8','Beech 1900D','EMB 190','EMB 145','ATR 72-500','ATR 72-200','ATR 42-300','ATR 42-500'];
// DASH 8 is one family; the fleet includes ten named variants across six families.
const simulatorCategories=['Visual','Motion','Miscellaneous'];
const categories=['All systems',...simulatorCategories];
const seeds=[
  {
    "id": "sample-0",
    "templateVersion": 3,
    "title": "No image on the visual display",
    "category": "Visual",
    "sims": [
      "CRJ 200",
      "CRJ 700"
    ],
    "sample": true,
    "summary": "At session start, the visual display was switched on, but no outside-view image was visible. The instructor station was working.",
    "notes": "1. Check the display\nConfirmed that the visual display was on and recorded which screen was blank.\n\n2. Check the selected input\nIn this fictional example, the display was set to the wrong input source.\n\n3. Apply the resolution\nSelected the expected visual input using the approved local procedure.\n\n4. Confirm the result\nChecked that the outside-view scene returned and remained stable during the test.",
    "reference": "Example only — add the manual title, revision and section that supports your tested resolution.",
    "manualUrl": "",
    "images": []
  }
];
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};let drafts=read('simaero-drafts',[]),saved=read('simaero-saved',[]),category='All systems',view='all';const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Upgrade only the example article; keep a recoverable copy of prior sample edits.
let previousSample=read('simaero-previous-sample',null);
const legacySample=drafts.find(article=>article.id==='sample-0'&&article.sample&&article.templateVersion!==3);
if(legacySample){
 try{localStorage.setItem('simaero-previous-sample',JSON.stringify(legacySample));
 const next=drafts.filter(article=>article.id!=='sample-0');localStorage.setItem('simaero-drafts',JSON.stringify(next));drafts=next;previousSample=legacySample;
 }catch{/* Preserve existing data if the browser cannot store a backup. */}
}
function allArticles(){
 const unique=new Map();
 for(const article of [...drafts,...shared,...seeds])if(!unique.has(article.id))unique.set(article.id,article);
 return [...unique.values()];
}
function persist(){localStorage.setItem('simaero-drafts',JSON.stringify(drafts));localStorage.setItem('simaero-saved',JSON.stringify(saved))}function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3000)}
$('#fleetNav').innerHTML=fleet.map(s=>`<button class="fleet-btn" data-sim="${s}">${s}</button>`).join('');for(const id of ['simFilter','formSim'])$('#'+id).insertAdjacentHTML('beforeend',fleet.map(s=>`<option>${s}</option>`).join(''));$('#formCategory').innerHTML=simulatorCategories.map(s=>'<option>'+esc(s)+'</option>').join('');
$('#categories').innerHTML=categories.map(s=>'<button class="chip '+(s===category?'selected':'')+'" data-category="'+esc(s)+'">'+esc(s)+'</button>').join('');
$('#systemCount').textContent=categories.length-1;
function render(){const all=allArticles();$('#articleCount').textContent=all.length;$('#savedCount').textContent=saved.length;const query=$('#search').value.toLowerCase().trim(),sim=$('#simFilter').value;const list=all.filter(a=>(view!=='saved'||saved.includes(a.id))&&(category==='All systems'||a.category===category)&&(!sim||a.sims.includes(sim))&&(!query||[a.title,a.summary,a.category,...a.sims].join(' ').toLowerCase().includes(query)));$('#resultCount').textContent=`${list.length} article${list.length===1?'':'s'}`;
$('#articles').classList.toggle('fleet-layout',view==='fleet');$('#articles').innerHTML=view==='fleet'?renderFleet(all):list.map(a=>`<article class="card" tabindex="0" role="button" data-id="${a.id}" aria-label="Read ${esc(a.title)}"><div class="card-top"><span class="badge ${a.category.toLowerCase()}">${esc(a.category)}</span><button class="bookmark ${saved.includes(a.id)?'on':''}" data-save="${a.id}" aria-label="${saved.includes(a.id)?'Unsave':'Save'} article" aria-pressed="${saved.includes(a.id)}">${saved.includes(a.id)?'★':'☆'}</button></div><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><div class="card-meta">${a.sims.map(s=>`<span class="sim-tag">${esc(s)}</span>`).join('')}</div><div class="card-bottom"><span class="draft">◌ ${a.sample?'Sample article · structure example':a.shared?'Shared · not reviewed':'Local draft · not reviewed'}</span><span class="arrow">↗</span></div></article>`).join('');$('#empty').hidden=list.length>0||view==='fleet';document.querySelectorAll('[data-sim]').forEach(b=>b.classList.toggle('selected',b.dataset.sim===sim));}
function setView(v){
 view=v;window.scrollTo(0,0);document.querySelectorAll('nav button').forEach(button=>button.classList.toggle('active',button.dataset.view===v));
 document.querySelectorAll('.search-panel,.stats,.filters,.sample-note').forEach(section=>section.hidden=v==='fleet');
 $('#breadcrumb').textContent=v==='saved'?'Saved articles':v==='fleet'?'Simulator fleet':'Knowledge base';
 $('#pageTitle').innerHTML=(v==='saved'?'Your saved knowledge':v==='fleet'?'Your simulator fleet':'Technical knowledge base')+'<span>.</span>';
 $('#pageIntro').textContent=v==='fleet'?'Choose a simulator to find its faults across all systems.':'Find the fault. Follow the knowledge. Get back to ready.';
 $('#listTitle').textContent=v==='fleet'?'All simulators':'Explore the knowledge base';render();
 if(v==='fleet')$('#resultCount').textContent=fleet.length+' simulator variants';
}
function renderFleet(all){
 const families={'CRJ 200':'CRJ series','CRJ 700':'CRJ series','EMB 190':'E-Jet series','EMB 145':'ERJ series','DASH 8':'Dash 8 series','Beech 1900D':'Beechcraft 1900 series'};
 return '<div class="fleet-overview"><div><div class="eyebrow">ONE SIMULATOR FLEET</div><h2>All your simulators, together.</h2><p>Select any model to view its faults across all systems.</p></div><div class="fleet-total"><strong>'+fleet.length+'</strong><span>simulator variants</span></div></div><div class="fleet-roster">'+fleet.map(sim=>{
 const articles=all.filter(article=>article.sims.includes(sim));
 const systemCounts=simulatorCategories.map(system=>'<span>'+esc(system)+' <b>'+articles.filter(article=>article.category===system).length+'</b></span>').join('');
 return '<button class="fleet-row" data-fleet-card="'+esc(sim)+'" aria-label="Open '+esc(sim)+' knowledge base"><span class="fleet-model-icon" aria-hidden="true">✈</span><span class="fleet-model"><strong>'+esc(sim)+'</strong><small>'+esc(families[sim]||'ATR series')+'</small></span><span class="fleet-system-counts">'+systemCounts+'</span><span class="fleet-article-count">'+(articles.length?articles.length+' article'+(articles.length===1?'':'s'):'No articles yet')+'</span><span class="fleet-open" aria-hidden="true">↗</span></button>';
 }).join('')+'</div>';
}

function resolutionMarkup(notes){
 const text=String(notes||'');
 const parts=text.split(/\n\s*\n(?=\d+[.)]\s)/);
 if(parts.length>1&&parts.every(part=>/^\d+[.)]\s/.test(part))){
  return '<ol class="resolution-steps">'+parts.map((part,index)=>{const lines=part.replace(/^\d+[.)]\s+/,'').split('\n');return '<li><span class="step-number">'+(index+1)+'</span><div><h4>'+esc(lines.shift())+'</h4><p>'+esc(lines.join('\n'))+'</p></div></li>'}).join('')+'</ol>';
 }
 return '<p class="resolution-text">'+esc(text)+'</p>';
}

function safeManualUrl(value){return typeof value==='string'&&/^https?:\/\/\S+$/i.test(value.trim())?value.trim():''}
function exportKnowledgeArticle(article,filename='simaero-'+article.id+'.json'){
 const url=URL.createObjectURL(new Blob([JSON.stringify(article,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);
}
function detail(id){const a=allArticles().find(article=>article.id===id);if(!a)return;
 const manual=safeManualUrl(a.manualUrl);
 $('#detailContent').innerHTML=`<div class="dialog-top"><span class="article-type">${a.sample?'SAMPLE FAULT ARTICLE':'FAULT KNOWLEDGE BASE'}</span><button class="close" data-close="detail" aria-label="Close">×</button></div><div class="article-detail-heading"><h2>${esc(a.title)}</h2><div class="article-simulators">${a.sims.map(sim=>'<span class="sim-tag">'+esc(sim)+'</span>').join('')}</div></div>
 ${a.sample?'<div class="template-banner"><div><strong>Sample structure — a fictional example</strong><p>Use this example to see what an article should contain. The steps below illustrate a resolution; they are not a tested procedure for your simulator.</p></div></div>':'<div class="notice">Local draft · awaiting review.</div>'}
 <section class="article-section"><div class="article-section-title"><h3>What was the fault?</h3></div><p>${esc(a.summary)}</p></section>
 <section class="article-section"><div class="article-section-title"><h3>System affected</h3></div><span class="badge ${esc(a.category.toLowerCase())}">${esc(a.category)}</span></section>
 <section class="article-section"><div class="article-section-title"><h3>Resolution</h3></div><div class="resolution-guidance"><strong>Record your tested resolution here.</strong><p>Explain what fixed the fault and how you confirmed normal operation.</p></div>${resolutionMarkup(a.resolutionSteps||a.notes)}</section>
 <section class="article-section"><div class="article-section-title"><h3>Documentation or manual</h3></div><div class="reference-panel"><p>${esc(a.reference||'Add the manual title, revision and section used.')}</p>${manual?'<a class="manual-link" href="'+esc(manual)+'" target="_blank" rel="noopener noreferrer">Open documentation ↗</a>':''}</div>${documentList(a.documents)}</section>
 <section class="article-section"><div class="article-section-title"><h3>Images</h3></div>${(a.images||[]).some(validImage)?imageGallery(a.images):'<div class="evidence-placeholder"><span aria-hidden="true">▧</span><div><strong>Add photos or screenshots</strong><p>Use Edit fault to attach images of the fault and the resolved result.</p></div></div>'}</section>
 <div class="article-actions"><button class="primary" id="editArticle">Edit fault</button><button class="secondary" id="exportArticle">Export article (JSON)</button>${a.sample&&previousSample?'<button class="previous-sample-link" id="exportPreviousSample">Download previous sample edits</button>':''}<span>${a.sample?'Example structure only. Replace with your own tested findings.':'Saved in this browser.'}</span></div>`
;$('#editArticle').onclick=()=>{ $('#detail').close();openEditor(a.id);};$('#exportArticle').onclick=()=>exportKnowledgeArticle(a);if(a.sample&&previousSample)$('#exportPreviousSample').onclick=()=>exportKnowledgeArticle(previousSample,'simaero-previous-sample.json');$('#detail').showModal()}
document.addEventListener('click',e=>{let b=e.target.closest('[data-save]');if(b){e.stopPropagation();const id=b.dataset.save;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persist();render();return}b=e.target.closest('[data-id]');if(b){detail(b.dataset.id);return}b=e.target.closest('[data-close]');if(b)$('#'+b.dataset.close).close();b=e.target.closest('[data-category]');if(b){category=b.dataset.category;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('selected',c===b));render()}b=e.target.closest('[data-sim],[data-fleet-card]');if(b){$('#simFilter').value=b.dataset.sim||b.dataset.fleetCard;$('#search').value='';category='All systems';document.querySelectorAll('.chip').forEach(button=>button.classList.toggle('selected',button.dataset.category===category));setView('all')}b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);b=e.target.closest('[data-query]');if(b){$('#search').value=b.dataset.query;setView('all')}});
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
 for(const key of ['title','summary','reference','manualUrl'])$('#articleForm [name='+key+']').value=editingOriginal?.[key]||'';
 $('#formSim').value=editingOriginal?.sims?.[0]||fleet[0];
 $('#formCategory').value=categories.includes(editingOriginal?.category)?editingOriginal.category:categories[1];
 showImagePreviews();$('#imageError').textContent='';$('#imageStatus').textContent=pendingImages.length?pendingImages.length+' of 3 images attached.':'';
 $('#editor').showModal();
}
const validImage=image=>image&&typeof image.data==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image.data);
function imageGallery(images){
 const safe=Array.isArray(images)?images.filter(validImage):[];
 return safe.length?'<section class="detail-block"><div class="image-gallery">'+safe.map(image=>'<figure><img src="'+esc(image.data)+'" alt="'+esc(image.name)+'"><figcaption>'+esc(image.name)+'</figcaption></figure>').join('')+'</div></section>':'';
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
 const manualUrl=String(form.get('manualUrl')||'').trim();if(manualUrl&&!safeManualUrl(manualUrl)){$('#imageError').textContent='Use a full https:// or http:// documentation link.';return}
 const sim=form.get('sim');
 const sims=editingOriginal&&sim===editingOriginal.sims[0]?[...editingOriginal.sims]:[sim];
 const article={...(editingOriginal||{}),id:editingId||crypto.randomUUID(),title:form.get('title'),category:form.get('category'),sims,summary:form.get('summary'),notes:form.get('notes'),reference:form.get('reference'),manualUrl,sample:editingOriginal?.sample||false,images:[...pendingImages]};
 const previousDrafts=drafts;
 drafts=[article,...drafts.filter(draft=>draft.id!==article.id)];
 try{persist()}catch{drafts=previousDrafts;$('#imageError').textContent='Browser storage is full. Remove an image or export older drafts before saving.';return}
 const wasEditing=Boolean(editingId);
 event.target.reset();pendingImages=[];editingId=null;editingOriginal=null;showImagePreviews();$('#imageError').textContent='';$('#imageStatus').textContent='';$('#editor').close();
 $('#search').value='';$('#simFilter').value='';category='All systems';document.querySelectorAll('.chip').forEach(button=>button.classList.toggle('selected',button.dataset.category===category));
 setView('all');toast(wasEditing?'Changes saved in this browser.':'Draft and images saved in this browser.');
};



