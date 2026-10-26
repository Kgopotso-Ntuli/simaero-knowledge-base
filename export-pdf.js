// Generate a readable, paginated PDF locally; no guide data leaves the browser.
async function exportKnowledgeArticle(guide) {
 const button=document.getElementById('exportArticle');
 if(button){button.disabled=true;button.textContent='Preparing PDF…';}
 try {
  if(!window.jspdf)throw Error('PDF export could not load. Refresh the page and try again.');
  const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
  const left=18,width=174,bottom=275;let y=34;
  const clean=value=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\u202f/g,' ');
  const header=()=>{
   const logo=document.querySelector('.brand img');
   if(logo?.complete&&logo.naturalWidth)pdf.addImage(logo,'PNG',left,10,40,40*logo.naturalHeight/logo.naturalWidth);
   else {pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.setTextColor(12,103,137);pdf.text('SIMAERO',left,18);}
   pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.text('HOW-TO GUIDE',192,18,{align:'right'});
   pdf.setDrawColor(45,177,162);pdf.setLineWidth(.6);pdf.line(left,24,192,24);
  };
  const space=height=>{if(y+height>bottom){pdf.addPage();header();y=34;}};
  const text=(value,{size=11,bold=false,color=[35,52,65],gap=3}={})=>{
   pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(...color);
   const lines=pdf.splitTextToSize(clean(value),width),lineHeight=size*.48;
   for(const line of lines){space(lineHeight);pdf.text(line,left,y);y+=lineHeight;}y+=gap;
  };
  const heading=label=>{space(20);y+=3;text(label,{size:13,bold:true,color:[12,103,137],gap:3});};
  header();
  text(guide.title,{size:22,bold:true,gap:4});
  text((guide.sims||[]).join('  /  ')+'  |  '+guide.category,{size:10,color:[70,90,105]});
  text(guide.sample?'Sample structure — fictional example. Not a tested simulator procedure.':'Local guide — awaiting review.',{size:10});
  heading('What was the fault?');text(guide.summary);
  heading('System affected');text(guide.category);
  heading('Resolution');
  for(const [index,step] of stepsFromArticle(guide).entries()){
   space(18);text((index+1)+'. '+step.title,{bold:true,gap:1});if(step.detail)text(step.detail);y+=2;
  }
  heading('Documentation or manual');text(guide.reference||'No reference provided.');
  const manual=safeManualUrl(guide.manualUrl);if(manual)text(manual,{size:10});
  if(guide.documents?.length){text('Attached documents (download separately):',{bold:true});for(const file of guide.documents)text(file.name+' ('+fileSize(file.size)+')',{size:10});}
  const images=(guide.images||[]).filter(validImage);
  if(images.length){heading('Images');for(const image of images){
   const props=pdf.getImageProperties(image.data),w=Math.min(width,props.width*.2646),h=Math.min(160,w*props.height/props.width),scaledWidth=h*props.width/props.height;
   space(h+15);pdf.addImage(image.data,props.fileType,left,y,scaledWidth,h);y+=h+5;text(image.name||'Guide image',{size:9});
  }}
  const pages=pdf.getNumberOfPages();
  for(let page=1;page<=pages;page++){pdf.setPage(page);pdf.setDrawColor(210,222,228);pdf.setLineWidth(.2);pdf.line(left,282,192,282);pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(90,105,115);pdf.text('SIMAERO | Technical knowledge base',left,288);pdf.text(page+' / '+pages,192,288,{align:'right'});}
  pdf.setProperties({title:clean(guide.title),author:'SIMAERO',subject:'Simulator how-to guide'});
  const filename=(guide.title||'how-to-guide').replace(/[^a-z0-9 _-]/gi,'').trim().replace(/\s+/g,'-').slice(0,90)||'how-to-guide';
  downloadBlob(pdf.output('blob'),'SIMAERO-'+filename+'.pdf');
  toast('PDF ready. Open the downloaded file to print.');
 }catch(error){toast(error.message||'Unable to create the PDF. Please try again.');}
 finally{if(button){button.disabled=false;button.textContent='Download PDF';}}
}
