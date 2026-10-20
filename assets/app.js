(function(){
  'use strict';
  var L=window.LIMITS,$=UI.$,n=UI.num,m=UI.money;
  var C1='#0d9488', C2='#7c3aed';
  function stat(k,v,cls){ return '<div class="stat"><div class="k">'+k+'</div><div class="v '+(cls||'')+'">'+v+'</div></div>'; }
  function bad(formId){ var errs=0; document.querySelectorAll('#'+formId+' input[type=number]').forEach(function(el){ var b=el.value!==''&&(+el.value<0||!isFinite(+el.value)); el.setAttribute('aria-invalid',b?'true':'false'); if(b) errs++; }); return errs; }
  var summary={hsa:'',cobra:'',market:''};
  function actions(key){ return '<div class="actions"><button type="button" class="btn ghost sm" data-print>'+UI.icon('copy')+'Print / PDF</button><button type="button" class="btn sm" data-share="'+key+'">'+UI.icon('share')+'Share</button><button type="button" class="btn ghost sm" data-copy="'+key+'">'+UI.icon('copy')+'Copy summary</button></div>'; }
  function errBox(){ return '<div class="alert err">'+UI.icon('alert')+'<div>Check the highlighted fields. Numbers can\'t be negative.</div></div>'; }
  function hsa(){
    var out=$('hsaOut'); if (bad('hsaForm')){ out.innerHTML=errBox(); return; }
    var y=$('year').value, cov=$('coverage').value, Y=L.years[y], lim=OECalc.hsaLimit(L,y,cov,$('age55').value==='1');
    var room=OECalc.hsaRoom(lim,n('hEr')), you=Math.min(n('hYou'),room);
    $('hsaRoom').textContent='You can add up to '+m(room,true)+' in '+y+' ('+m(lim,true)+' limit minus employer money).';
    var tax={marginal:n('marg')/100, fica:$('payroll').value==='1'?L.fica:0};
    var hd={premiumAnnual:n('hPrem')*12,deductible:n('hDed'),coins:n('hCo')/100,oopMax:n('hOop'),employerHsa:n('hEr'),yourHsa:you};
    var pp={premiumAnnual:n('pPrem')*12,deductible:n('pDed'),coins:n('pCo')/100,oopMax:n('pOop'),copays:n('pCopay')};
    if (!hd.oopMax||!pp.oopMax){ out.innerHTML='<div class="empty">'+UI.icon('heart')+'<p><strong>Add both plans</strong><br>Enter each plan\'s out-of-pocket max to see which costs less.</p></div>'; return; }
    var s=n('spend'), ch=OECalc.annualCost(s,hd,tax), cp=OECalc.annualCost(s,pp,tax), c=OECalc.compare(hd,pp,tax);
    var maxX=Math.max(hd.oopMax,pp.oopMax)*2.2, pts=function(plan){ var a=[]; for(var i=0;i<=60;i++){ var x=maxX*i/60; a.push([x,OECalc.annualCost(x,plan,tax)]); } return a; };
    var winner=ch<=cp?'HSA plan':'PPO', diff=Math.abs(cp-ch);
    var h='<h2>'+UI.icon('chart')+'Which plan costs less?</h2>';
    h+='<div class="verdict '+(ch<=cp?'good':'warn')+'"><span class="vicon">'+UI.icon(ch<=cp?'check':'info')+'</span><div><strong class="big">'+winner+' saves about '+m(diff,true)+'</strong><span>at '+m(s,true)+' of medical spending in '+y+'.</span></div></div>';
    var be=c.crossings.length?c.crossings.map(function(x){return m(x.spend,true);}).join(' and '):null;
    h+='<div class="stats s3">'+stat('HSA plan, net / yr',m(ch,true))+stat('PPO, net / yr',m(cp,true))+stat('Break-even spending', be||(c.atZero.hdhp<=c.atZero.ppo?'HSA plan always':'PPO always'))+'</div>';
    h+=UI.lines([{name:'HSA plan',color:C1,points:pts(hd)},{name:'PPO',color:C2,points:pts(pp)}],{label:'Net yearly cost of each plan by medical spending',marks:c.crossings.map(function(x){return {x:x.spend,label:'break-even'};}).concat([{x:Math.min(s,maxX),label:'you'}])});
    h+='<div class="legend"><span><i style="background:'+C1+'"></i>HSA plan</span><span><i style="background:'+C2+'"></i>PPO</span><span>x-axis: yearly medical spending · y-axis: net cost</span></div>';
    var sc=[['Healthy year',300],['Typical year',s],['Big year',Math.max(hd.oopMax,pp.oopMax)*1.2],['Worst case',1e9]];
    h+='<div class="table-scroll" style="margin-top:10px"><table><thead><tr><th scope="col">Scenario</th><th scope="col">HSA plan</th><th scope="col">PPO</th></tr></thead><tbody>'+
      sc.map(function(r){ var a=OECalc.annualCost(r[1],hd,tax), b=OECalc.annualCost(r[1],pp,tax); return '<tr><td>'+r[0]+(r[1]<1e8?' <span class="hint" style="display:inline">('+m(r[1],true)+')</span>':'')+'</td><td class="'+(a<=b?'pos':'')+'">'+m(a,true)+'</td><td class="'+(b<a?'pos':'')+'">'+m(b,true)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    var g=OECalc.hsaGrowth(you+n('hEr'),Math.max(1,Math.min(40,Math.round(n('yrs')))),n('ret')/100);
    h+='<h3 style="margin-top:16px">HSA growth</h3><p style="margin:0">Depositing '+m(you+n('hEr'),true)+' a year at '+n('ret')+'% could grow to <strong>'+m(g[g.length-1],true)+'</strong> in '+g.length+' years if you don\'t spend it. Illustration only; returns aren\'t guaranteed.</p>';
    var warn=[], minD=cov==='family'?Y.hdhpMinDedFamily:Y.hdhpMinDedSelf, maxO=cov==='family'?Y.hdhpOopFamily:Y.hdhpOopSelf;
    if (n('hYou')>room) warn.push('Your HSA amount is above the '+y+' limit. Only '+m(room,true)+' counts here.');
    if (hd.deductible<minD) warn.push('An employer HDHP needs a deductible of at least '+m(minD,true)+' in '+y+'. This plan may not qualify for an HSA.');
    if (hd.oopMax>maxO) warn.push('HSA-eligible plans can\'t have an out-of-pocket max above '+m(maxO,true)+' in '+y+'.');
    warn.forEach(function(w){ h+='<div class="alert">'+UI.icon('alert')+'<div>'+UI.esc(w)+'</div></div>'; });
    h+=actions('hsa'); out.innerHTML=h;
    summary.hsa='HSA plan vs PPO ('+y+'): at '+m(s,true)+' of care the HSA plan nets '+m(ch,true)+'/yr and the PPO '+m(cp,true)+'/yr. '+(be?'Break-even at '+be+' of spending.':'No break-even; one plan is cheaper at every spending level.');
  }
  function cobra(){
    var out=$('cobraOut'); if (bad('cobraForm')){ out.innerHTML=errBox(); return; }
    var tot=n('cEe')+n('cEr'); if (!tot){ out.innerHTML='<div class="empty">'+UI.icon('dollar')+'<p><strong>Enter your monthly plan cost</strong><br>Add your monthly share plus your employer\'s share.</p></div>'; return; }
    var r=OECalc.cobra(tot,Math.max(1,Math.round(n('cMonths'))),L,$('cDis').value==='1');
    var care=n('cCare'), met=n('cMet');
    // Simplified: you pay care up to the remaining deductible (coinsurance after that is ignored on both sides).
    var cobraOop=Math.min(care,Math.max(0,n('cDed')-met)), mktOop=Math.min(care,n('cMktDed'));
    var cv=OECalc.cobraVsMarket({months:r.months,cobraMonthly:r.monthly,marketMonthly:n('cMkt'),cobraOop:cobraOop,marketOop:mktOop});
    var h='<h2>'+UI.icon('dollar')+'COBRA cost</h2><div class="stats s3">'+stat('COBRA / month',m(r.monthly))+stat('vs. you pay now',UI.signed(r.monthly-n('cEe')),'neg')+stat('Total, '+r.months+' months',m(r.total,true))+'</div>';
    if ($('cDis').value==='1') h+='<p class="hint">Months 19-29 estimated at up to 150%: '+m(r.monthlyExt)+'/month.</p>';
    if (n('cMonths')>18 && $('cDis').value!=='1') h+='<div class="alert">'+UI.icon('info')+'<div>COBRA usually lasts up to 18 months after a job loss, so the estimate stops at 18.</div></div>';
    h+='<h3 style="margin-top:14px">COBRA vs marketplace for '+r.months+' months</h3><div class="verdict '+(cv.diff>=0?'good':'warn')+'"><span class="vicon">'+UI.icon('info')+'</span><div><strong class="big">'+(cv.diff>=0?'COBRA':'Marketplace')+' costs about '+m(Math.abs(cv.diff),true)+' less</strong><span>COBRA '+m(cv.cobra,true)+' vs marketplace '+m(cv.market,true)+' (premiums plus estimated out-of-pocket). A new plan resets your deductible; COBRA keeps the '+m(met,true)+' you\'ve met.</span></div></div>';
    h+=UI.bars([{label:'COBRA',value:cv.cobra,color:'#0d9488'},{label:'Marketplace',value:cv.market,color:'#2563eb'}],{label:'COBRA vs marketplace total cost',h:170});
    h+='<p class="hint">You generally have 60 days to elect COBRA, and losing job-based coverage opens a 60-day special enrollment period for the marketplace.</p>'+actions('cobra');
    out.innerHTML=h;
    summary.cobra='COBRA estimate: '+m(r.monthly)+'/month ('+m(r.total,true)+' for '+r.months+' months). Versus marketplace: COBRA '+m(cv.cobra,true)+', marketplace '+m(cv.market,true)+'.';
  }
  function market(){
    var out=$('marketOut'); if (bad('mktForm')){ out.innerHTML=errBox(); return; }
    var y=$('year').value, cov=$('coverage').value, inc=n('mIncome');
    if (!inc){ out.innerHTML='<div class="empty">'+UI.icon('users')+'<p><strong>Enter household income</strong><br>It drives the affordability test and the tax credit estimate.</p></div>'; return; }
    var r=OECalc.employerVsMarket({year:y,coverage:cov,householdIncome:inc,employerSelfMonthly:n('mSelf'),employerFamilyMonthly:n('mFam'),expectedSpendEmp:n('mEmpOop'),expectedSpendMkt:n('mMktOop'),marketMonthly:0},L);
    var p=OECalc.ptc({year:y,income:inc,size:n('mSize'),benchmarkMonthly:n('mBench')},L);
    var eligible=!r.selfAffordable || cov==='family'&&!r.familyAffordable, credit=eligible?p.credit:0, net=Math.max(0,n('mPlan')-credit);
    var empAnnual=r.employerAnnual, mktAnnual=Math.round((net*12+n('mMktOop'))*100)/100, diff=mktAnnual-empAnnual;
    var h='<h2>'+UI.icon('users')+'Employer plan or marketplace?</h2>';
    h+='<div class="verdict '+(diff>=0?'good':'warn')+'"><span class="vicon">'+UI.icon('info')+'</span><div><strong class="big">'+(diff>=0?'Employer plan':'Marketplace')+' costs about '+m(Math.abs(diff),true)+' less per year</strong><span>Employer '+m(empAnnual,true)+' vs marketplace '+m(mktAnnual,true)+' (premiums plus expected out-of-pocket).</span></div></div>';
    h+='<div class="stats s3">'+stat('Affordability line ('+y+')',m(r.monthlyCap)+'/mo')+stat('Employee-only coverage',r.selfAffordable?'Affordable':'Not affordable',r.selfAffordable?'':'neg')+stat('Income vs poverty level',p.pctFpl+'%')+stat('Est. tax credit / month',eligible?m(p.credit,true):'$0')+stat('Marketplace after credit',m(net,true)+'/mo')+stat('Applicable %',p.applicablePct!==null?p.applicablePct+'%':'—')+'</div>';
    if (r.selfAffordable && cov==='self') h+='<div class="alert">'+UI.icon('info')+'<div>Your employer plan passes the '+(r.pct*100).toFixed(2)+'% affordability test. If it also meets minimum value, you generally <strong>can\'t get a premium tax credit</strong>, so the marketplace plan would be full price.</div></div>';
    if (cov==='family' && r.familyAffordable===false) h+='<div class="alert">'+UI.icon('info')+'<div>Family coverage costs more than '+(r.pct*100).toFixed(2)+'% of income, so family members may qualify for a tax credit even though you have an offer (the "family glitch" fix).</div></div>';
    if (p.note==='above400') h+='<div class="alert">'+UI.icon('alert')+'<div>Income is above 400% of the poverty level ('+m(p.fpl*4,true)+' for this household), so there is generally <strong>no premium tax credit</strong> for '+y+' coverage. The enhanced credits expired at the end of 2025.</div></div>';
    if (p.note==='below100') h+='<div class="alert">'+UI.icon('info')+'<div>Income below 100% of the poverty level usually means no marketplace credit, but you may qualify for Medicaid. Check HealthCare.gov or your state Medicaid office.</div></div>';
    h+='<p class="hint">Tax credit = benchmark silver premium minus '+(p.applicablePct!==null?p.applicablePct+'%':'your expected share')+' of income ÷ 12. Illustrative only: HealthCare.gov decides the real amount. Employer premiums are usually pre-tax, which this doesn\'t count. Poverty level used: '+UI.esc(L.years[y].fpl.src)+'.</p>'+actions('market');
    out.innerHTML=h;
    summary.market='Employer vs marketplace ('+y+'): employer '+m(empAnnual,true)+'/yr vs marketplace '+m(mktAnnual,true)+'/yr; est. tax credit '+(eligible?m(p.credit,true):'$0')+'/mo; income at '+p.pctFpl+'% of the poverty level.';
  }
  function all(){ if($('hsaOut')) hsa(); if($('cobraOut')) cobra(); if($('marketOut')) market(); history.replaceState(null,'',UI.stateURL()); }
  var go=UI.debounce(all,40);
  document.querySelector('main').addEventListener('input',function(e){ if(e.target.closest('form')) go(); });
  document.querySelector('main').addEventListener('change',function(e){ if(e.target.closest('form')||e.target.type==='hidden') go(); });
  document.addEventListener('click',function(e){ var s=e.target.closest('[data-share]'), c=e.target.closest('[data-copy]');
    if (s) UI.share(location.href,'Health plan cost comparison',summary[s.dataset.share]);
    if (c) UI.copy(summary[c.dataset.copy]+' '+location.href,'Summary copied'); });
  UI.readState(); UI.segs(go); UI.syncSegs(); all();
})();
