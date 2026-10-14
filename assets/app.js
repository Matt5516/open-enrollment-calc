(function(){
  var L=window.LIMITS,$=function(id){return document.getElementById(id);},n=Site.num,m=Site.money;
  $('checked').textContent=L.checked;
  function hsa(){
    var y=$('year').value, cov=$('coverage').value, lim=OECalc.hsaLimit(L,y,cov,$('age55').value==='1'), Y=L.years[y];
    var tax={marginal:n('marg')/100, fica:$('payroll').value==='1'?L.fica:0};
    var hd={premiumAnnual:n('hPrem')*12,deductible:n('hDed'),coins:n('hCo')/100,oopMax:n('hOop'),employerHsa:n('hEr'),yourHsa:n('hYou')};
    var pp={premiumAnnual:n('pPrem')*12,deductible:n('pDed'),coins:n('pCo')/100,oopMax:n('pOop')};
    var warn=[];
    if (hd.employerHsa+hd.yourHsa>lim) warn.push('Total HSA contributions ('+m(hd.employerHsa+hd.yourHsa)+') are above the '+y+' limit of '+m(lim)+'.');
    var minDed=cov==='family'?Y.hdhpMinDedFamily:Y.hdhpMinDedSelf, maxOop=cov==='family'?Y.hdhpOopFamily:Y.hdhpOopSelf;
    if (hd.deductible<minDed) warn.push('An HSA-eligible plan must have a deductible of at least '+m(minDed)+' in '+y+'. This plan may not qualify.');
    if (hd.oopMax>maxOop) warn.push('HSA-eligible plans can\'t have an out-of-pocket max above '+m(maxOop)+' in '+y+'.');
    var s=n('spend'), ch=OECalc.annualCost(s,hd,tax), cp=OECalc.annualCost(s,pp,tax), c=OECalc.compare(hd,pp,tax);
    var h='<p>'+y+' HSA limit for you: <strong>'+m(lim)+'</strong> (employer + your contributions combined).</p>';
    h+='<div class="table-scroll"><table><thead><tr><th>Estimated net annual cost</th><th>HDHP + HSA</th><th>PPO</th></tr></thead><tbody>';
    h+='<tr><td>No medical use</td><td>'+m(c.atZero.hdhp)+'</td><td>'+m(c.atZero.ppo)+'</td></tr>';
    h+='<tr><td>At your expected spending ('+m(s)+')</td><td><strong>'+m(ch)+'</strong></td><td><strong>'+m(cp)+'</strong></td></tr>';
    h+='<tr><td>Worst case (hit out-of-pocket max)</td><td>'+m(c.worstHdhp)+'</td><td>'+m(c.worstPpo)+'</td></tr></tbody></table></div>';
    h+='<p class="hint">Net cost = premiums + out-of-pocket − employer HSA money − tax saved on your HSA contributions.</p>';
    var cls=ch<=cp?'good':'warn';
    h+='<div class="verdict '+cls+'">At '+m(s)+' of medical spending, the '+(ch<=cp?'HDHP + HSA':'PPO')+' is estimated to cost about '+m(Math.abs(cp-ch))+' less for the year.</div>';
    if (c.crossings.length) h+='<p>Break-even: '+c.crossings.map(function(x){return 'the '+(x.hdhpCheaperBelow?'HDHP is cheaper below':'PPO is cheaper below')+' about <strong>'+m(x.spend)+'</strong> of medical spending';}).join('; and ')+'.</p>';
    else h+='<p>Break-even: the '+(c.atZero.hdhp<=c.atZero.ppo?'HDHP':'PPO')+' is estimated cheaper at every spending level with these numbers.</p>';
    warn.forEach(function(w){h+='<p class="verdict warn">'+Site.esc(w)+'</p>';});
    $('hsaOut').innerHTML=h;
  }
  function cobra(){
    var tot=n('cEe')+n('cEr'), r=OECalc.cobra(tot,n('cMonths'),L,$('cDis').value==='1');
    var h='<div class="grid cols-3"><div><div class="hint">Estimated COBRA per month</div><strong>'+m(r.monthly)+'</strong></div><div><div class="hint">vs what you pay now</div><strong>'+m(n('cEe'))+'</strong> (+'+m(r.monthly-n('cEe'))+')</div><div><div class="hint">Total for '+r.months+' months</div><strong>'+m(r.total)+'</strong></div></div>';
    if ($('cDis').value==='1') h+='<p class="hint">Months 19–29 estimated at up to 150%: '+m(r.monthlyExt)+'/month.</p>';
    if (n('cMonths')>18 && $('cDis').value!=='1') h+='<p class="hint">COBRA after job loss generally lasts up to 18 months. This estimate stops at 18.</p>';
    h+='<p class="hint">COBRA can cost up to 102% of the full plan cost. You generally have 60 days to elect it. Losing job-based coverage also opens a special enrollment period for marketplace coverage, which may cost less, so compare both.</p>';
    $('cobraOut').innerHTML=h;
  }
  function market(){
    var y=$('year').value, o={year:y,coverage:$('mCov').value,householdIncome:n('mIncome'),employerSelfMonthly:n('mSelf'),employerFamilyMonthly:n('mFam'),expectedSpendEmp:n('mEmpOop'),expectedSpendMkt:n('mMktOop'),marketMonthly:n('mMkt')};
    var r=OECalc.employerVsMarket(o,L);
    var h='<p>'+y+' affordability line: employer coverage is generally "affordable" if it costs no more than <strong>'+(r.pct*100).toFixed(2)+'%</strong> of household income, which is <strong>'+m(r.monthlyCap)+'/month</strong> for your income.</p>';
    h+='<ul><li>Employee-only cost '+m(o.employerSelfMonthly)+'/mo: <strong>'+(r.selfAffordable?'affordable':'not affordable')+'</strong> under this test.</li>';
    if (r.familyAffordable!==null) h+='<li>Family cost '+m(o.employerFamilyMonthly)+'/mo: <strong>'+(r.familyAffordable?'affordable':'not affordable')+'</strong> for family members.</li>';
    h+='</ul>';
    if (r.selfAffordable) h+='<p class="verdict warn">If your employer plan is affordable and meets minimum value, you generally can\'t get a premium tax credit for yourself. Enter the full unsubsidized marketplace price above.</p>';
    h+='<div class="table-scroll"><table><thead><tr><th>Estimated annual cost</th><th>Employer plan</th><th>Marketplace</th></tr></thead><tbody><tr><td>Premiums + expected out-of-pocket</td><td><strong>'+m(r.employerAnnual)+'</strong></td><td><strong>'+m(r.marketAnnual)+'</strong></td></tr></tbody></table></div>';
    h+='<div class="verdict '+(r.diff>=0?'good':'warn')+'">With these numbers the '+(r.diff>=0?'employer plan':'marketplace plan')+' is estimated to cost about '+m(Math.abs(r.diff))+' less per year. Employer premiums are usually paid pre-tax, which this does not count.</div>';
    $('marketOut').innerHTML=h;
  }
  function all(){hsa();cobra();market();}
  document.querySelector('main').addEventListener('input',all);
  document.querySelector('main').addEventListener('change',all);
  all();
})();
