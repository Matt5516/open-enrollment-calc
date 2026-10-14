/* Compare 2-4 health plans at low / medium / high use. Uses OECalc.annualCost (no tax effects; employer HSA/HRA money counts). */
addEventListener('DOMContentLoaded',function(){ var $=UI.$, m=UI.money, box=$('cpPlans'), COL=['#0d9488','#2563eb','#d97706','#7c3aed'];
  var DEF=[['HSA plan',80,3000,20,6000,500],['PPO',200,1000,20,4000,0],['HMO',150,1500,20,5000,0]], F=['name','prem','ded','co','oop','er'];
  var LAB={prem:'You pay / month',ded:'Deductible',co:'Coinsurance %',oop:'Out-of-pocket max',er:'Employer HSA/HRA $ / yr'};
  function card(v,i){ var d=document.createElement('fieldset'); d.className='col'; d.style.marginBottom='10px';
    d.innerHTML='<legend style="display:flex;gap:8px;align-items:center"><span class="dot" style="width:12px;height:12px;border-radius:50%;display:inline-block;background:'+COL[i%4]+'"></span>Plan '+(i+1)+'</legend><div class="fields">'+
      '<div class="full"><label>Name<input data-f="name" type="text" value="'+UI.esc(v[0])+'"></label></div>'+F.slice(1).map(function(f,j){ return '<div><label>'+LAB[f]+'<div class="'+(f==='co'?'pct':'money')+'"><input data-f="'+f+'" type="number" inputmode="decimal" min="0" value="'+v[j+1]+'"></div></label></div>'; }).join('')+
      '</div>'+(i>1?'<button type="button" class="btn ghost sm" data-rm>Remove plan</button>':''); box.appendChild(d); }
  function read(){ return [].map.call(box.querySelectorAll('fieldset'),function(fs){ var o={}; fs.querySelectorAll('[data-f]').forEach(function(x){ o[x.dataset.f]=x.dataset.f==='name'?x.value:(+x.value||0); }); return o; }); }
  function cost(p,s){ return OECalc.annualCost(s,{premiumAnnual:p.prem*12,deductible:p.ded,coins:p.co/100,oopMax:p.oop,employerHsa:p.er,yourHsa:0},{marginal:0,fica:0}); }
  function run(){ var P=read(), U={low:UI.num('uLow'),med:UI.num('uMed'),high:UI.num('uHigh')}, u=$('use').value, s=U[u];
    $('useNote').textContent='Medical spending assumed: '+m(s,true)+' (change in Advanced options).';
    if(P.length<2){ $('cpOut').innerHTML='<div class="empty"><p>Add at least two plans.</p></div>'; return; }
    var c=P.map(function(p,i){ return {p:p,i:i,low:cost(p,U.low),med:cost(p,U.med),high:cost(p,U.high),worst:p.prem*12+p.oop-p.er}; }), best=c.slice().sort(function(a,b){return a[u]-b[u];});
    var h='<h2>'+UI.icon('chart')+'Cheapest at '+({low:'low',med:'medium',high:'high'})[u]+' use</h2><div class="verdict good"><span class="vicon">'+UI.icon('check')+'</span><div><strong class="big">'+UI.esc(best[0].p.name||'Plan '+(best[0].i+1))+'</strong><span>About '+m(best[1][u]-best[0][u],true)+' a year less than '+UI.esc(best[1].p.name||'the next plan')+'.</span></div></div>';
    h+=UI.bars(c.map(function(x){return {label:(x.p.name||'Plan '+(x.i+1)).slice(0,12),value:x[u],color:COL[x.i%4]};}),{label:'Yearly cost of each plan',h:190});
    h+='<div class="table-scroll"><table><thead><tr><th scope="col">Plan</th><th scope="col">Low</th><th scope="col">Medium</th><th scope="col">High</th><th scope="col">Worst case</th></tr></thead><tbody>'+c.map(function(x){ var mn=function(k){ return Math.min.apply(null,c.map(function(y){return y[k];}))===x[k]?' class="pos"':''; };
      return '<tr><td>'+UI.esc(x.p.name||'Plan '+(x.i+1))+'</td><td'+mn('low')+'>'+m(x.low,true)+'</td><td'+mn('med')+'>'+m(x.med,true)+'</td><td'+mn('high')+'>'+m(x.high,true)+'</td><td'+mn('worst')+'>'+m(x.worst,true)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    h+='<p class="hint">Yearly cost = premiums + your share of care − employer HSA/HRA money. Tax savings on your own HSA deposits aren\'t included; the <a href="../hsa-vs-ppo/">HSA vs PPO calculator</a> adds them.</p>';
    h+='<div class="actions"><button type="button" class="btn ghost sm" data-print>'+UI.icon('copy')+'Print / PDF</button><button type="button" class="btn ghost sm" id="cpLink">'+UI.icon('link')+'Copy link</button></div>';
    $('cpOut').innerHTML=h;
    history.replaceState(null,'',UI.stateURL({p:JSON.stringify(P.map(function(p){return F.map(function(f){return p[f];});}))})); }
  var st=UI.readState(), init=DEF; try{ if(st.params.get('p')) init=JSON.parse(st.params.get('p')); }catch(e){}
  init.slice(0,4).forEach(card); UI.segs(run); UI.syncSegs();
  $('cpAdd').addEventListener('click',function(){ var n=box.querySelectorAll('fieldset').length; if(n>=4){ UI.toast('Up to 4 plans'); return; } card(['Plan '+(n+1),150,2000,20,5000,0],n); run(); });
  box.addEventListener('click',function(e){ if(e.target.closest('[data-rm]')){ e.target.closest('fieldset').remove(); run(); } });
  document.addEventListener('click',function(e){ if(e.target.closest('#cpLink')) UI.copy(location.href,'Link copied'); });
  $('cpForm').addEventListener('input',UI.debounce(run,40)); run(); });
