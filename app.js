let shared=[],sharedMode=false;
const fleet=['CRJ 200','CRJ 700','DASH 8','Beech 1900D','EMB 190','EMB 145','ATR 72-500','ATR 72-200','ATR 42-300','ATR 42-500'];
// DASH 8 is one family; the fleet includes ten named variants across six families.
const simulatorCategories=['Visual','Motion'];
const categories=['All systems',...simulatorCategories];
const seeds=[
  {
    "id": "sample-0",
    "title": "Visual scene does not load at session start",
    "category": "Visual",
    "sims": [
      "CRJ 200",
      "CRJ 700"
    ],
    "sample": true,
    "summary": "Example symptom: the outside-view display is blank, but the instructor station is working. Note when the fault appeared and which displays were affected.",
    "notes": "1. Confirm the symptom\nExample: checked the outside-view display and recorded that the visual scene was missing at session start.\n\n2. Identify the cause\nExample: the display was set to a different input source. Record the checks that led to your confirmed finding.\n\n3. Apply the tested resolution\nExample: selected the expected visual input using the approved local procedure. In a real article, state exactly what you changed and include the procedure reference.\n\n4. Verify normal operation\nExample: confirmed that the expected airfield scene was visible and remained stable during the test. Record the actual checks and results before closing the fault.",
    "reference": "Example: approved visual-system procedure — add the document title, revision and section used."
  }
];
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};let drafts=read('simaero-drafts',[]),saved=read('simaero-saved',[]),category='All systems',view='all';const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
 $('#pageIntro').textContent=v==='fleet'?'Choose a simulator to find its Visual and Motion faults.':'Find the fault. Follow the knowledge. Get back to ready.';
 $('#listTitle').textContent=v==='fleet'?'Browse your fleet':'Explore the knowledge base';render();
 if(v==='fleet')$('#resultCount').textContent=fleet.length+' simulator variants';
}
function renderFleet(all){
 const families={'CRJ 200':'CRJ series','CRJ 700':'CRJ series','EMB 190':'E-Jet series','EMB 145':'ERJ series','DASH 8':'Dash 8 series','Beech 1900D':'Beechcraft 1900 series'};
 const groups=[{name:'Regional jets',caption:'CRJ & Embraer',models:fleet.filter(s=>s.startsWith('CRJ')||s.startsWith('EMB'))},{name:'Turboprops',caption:'Dash 8, Beechcraft & ATR',models:fleet.filter(s=>!s.startsWith('CRJ')&&!s.startsWith('EMB'))}];
 return '<div class="fleet-overview"><div><div class="eyebrow">SIMULATOR DIRECTORY</div><h2>Every simulator. One place to start.</h2><p>Select a model to explore the knowledge behind it.</p></div><div class="fleet-total"><strong>'+fleet.length+'</strong><span>variants in your fleet</span></div></div>'+groups.map(group=>'<section class="fleet-group"><div class="fleet-group-heading"><div><h3>'+group.name+'</h3><p>'+group.caption+'</p></div><span>'+group.models.length+' variants</span></div><div class="fleet-roster">'+group.models.map((sim,index)=>{
 const articles=all.filter(article=>article.sims.includes(sim));
 const visual=articles.filter(article=>article.category==='Visual').length,motion=articles.filter(article=>article.category==='Motion').length;
 return '<button class="fleet-row" data-fleet-card="'+esc(sim)+'" aria-label="Open '+esc(sim)+' knowledge base"><span class="fleet-model-icon" aria-hidden="true">✈</span><span class="fleet-model"><strong>'+esc(sim)+'</strong><small>'+esc(families[sim]||'ATR series')+'</small></span><span class="fleet-system-counts"><span>Visual <b>'+visual+'</b></span><span>Motion <b>'+motion+'</b></span></span><span class="fleet-article-count">'+(articles.length?articles.length+' article'+(articles.length===1?'':'s'):'No articles yet')+'</span><span class="fleet-open" aria-hidden="true">↗</span></button>';
 }).join('')+'</div></section>').join('');
}
function resolutionMarkup(notes){
 const text=String(notes||'');
 const parts=text.split(/\n\s*\n(?=\d+[.)]\s)/);
 if(parts.length>1&&parts.every(part=>/^\d+[.)]\s/.test(part))){
  return '<ol class="resolution-steps">'+parts.map((part,index)=>{const lines=part.replace(/^\d+[.)]\s+/,'').split('\n');return '<li><span class="step-number">'+(index+1)+'</span><div><h4>'+esc(lines.shift())+'</h4><p>'+esc(lines.join('\n'))+'</p></div></li>'}).join('')+'</ol>';
 }
 return '<p class="resolution-text">'+esc(text)+'</p>';
}

function detail(id){const a=allArticles().find(article=>article.id===id);if(!a)return;
 $('#detailContent').innerHTML=`<div class="dialog-top"><span class="article-type">${a.sample?'SAMPLE ARTICLE · STRUCTURE EXAMPLE':'FAULT KNOWLEDGE ARTICLE'}</span><button class="close" data-close="detail" aria-label="Close">×</button></div><div class="article-detail-heading"><span class="badge ${esc(a.category.toLowerCase())}">${esc(a.category)}</span><h2>${esc(a.title)}</h2><div class="article-simulators">${a.sims.map(sim=>'<span class="sim-tag">'+esc(sim)+'</span>').join('')}</div></div>
 ${a.sample?'<div class="template-banner"><span class="template-icon" aria-hidden="true">ⓘ</span><div><strong>Sample article — an example of the structure</strong><p>This is a fictional example showing how to write an article. It is not a technical procedure or a tested fix for your simulator. Replace the example details with your own observations, tested resolution and evidence.</p></div></div>':'<div class="notice">Local draft · awaiting review. Use approved documentation when resolving a fault.</div>'}
 <section class="article-section"><div class="article-section-title"><span>01</span><h3>Observed symptoms</h3></div><p>${esc(a.summary)}</p></section>
 <section class="article-section"><div class="article-section-title"><span>02</span><h3>Investigation notes</h3></div><div class="resolution-guidance"><strong>Your tested resolution belongs here.</strong><p>Document the checks you performed, the action that resolved the fault, and how you verified normal operation.</p></div>${a.sample?'<div class="example-label">EXAMPLE ONLY · HOW TO DOCUMENT THE STEPS</div>':''}${resolutionMarkup(a.notes)}${a.sample && a.notes!==seeds[0].notes ? '<details class="writing-example"><summary>View example resolution steps</summary><p class="writing-example-intro">A fictional writing example to help structure your own tested resolution. Your saved notes above are preserved.</p>'+resolutionMarkup(seeds[0].notes)+'</details>' : ''}</section>
 <section class="article-section"><div class="article-section-title"><span>03</span><h3>Evidence & references</h3></div><div class="reference-panel"><span>DOCUMENTATION REFERENCE</span><p>${esc(a.reference||'Add the document title, revision and section used.')}</p></div>${imageGallery(a.images)}${a.sample&&!(a.images||[]).length?'<div class="evidence-placeholder"><span aria-hidden="true">▧</span><div><strong>Add screenshots that support the resolution</strong><p>Use Edit fault to attach an image of the symptom or the verified result.</p></div></div>':''}</section>
 <div class="article-actions"><button class="primary" id="editArticle">Edit fault</button><button class="secondary" id="exportArticle">Export article (JSON)</button><span>${a.sample?'Use this example as your writing guide.':'Saved in this browser.'}</span></div>`;$('#editArticle').onclick=()=>{ $('#detail').close();openEditor(a.id);};$('#exportArticle').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(a,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='simaero-'+a.id+'.json';link.click();URL.revokeObjectURL(url)};$('#detail').showModal()}
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


