(function(root){
  function r2(n){return Math.round(parseFloat((n*100).toFixed(6)))/100;}
  // Out-of-pocket for a given amount of allowed medical spend (simplified: deductible, then coinsurance, capped at OOP max; copays ignored)
  function oop(spend, p){
    if (spend<=0) return Math.min(p.copays||0, p.oopMax);
    var c = spend <= p.deductible ? spend : p.deductible + p.coins*(spend - p.deductible);
    return Math.min(c + (p.copays||0), p.oopMax);
  }
  /* plan: {premiumAnnual, deductible, coins (0-1), oopMax, employerHsa, yourHsa}; tax: {marginal, fica (0/0.0765)} */
  function annualCost(spend, plan, tax){
    var taxSave = (plan.yourHsa||0) * ((tax.marginal||0) + (tax.fica||0));
    return r2(plan.premiumAnnual + oop(spend,plan) - (plan.employerHsa||0) - taxSave);
  }
  function compare(hdhp, ppo, tax, maxSpend){
    maxSpend = maxSpend || Math.max(hdhp.oopMax, ppo.oopMax)*4 + 10000;
    var diff = function(s){ return annualCost(s,hdhp,tax) - annualCost(s,ppo,tax); }; // <0 => HDHP cheaper
    var crossings = [], step = 25, prev = diff(0);
    for (var s=step; s<=maxSpend; s+=step){
      var d = diff(s);
      if ((prev<0) !== (d<0)){
        var lo=s-step, hi=s; for (var i=0;i<40;i++){ var m=(lo+hi)/2; if ((diff(m)<0)===(prev<0)) lo=m; else hi=m; }
        crossings.push({spend:Math.round(hi), hdhpCheaperBelow: prev<0});
      }
      prev = d;
    }
    return {crossings:crossings, worstHdhp:annualCost(1e9,hdhp,tax), worstPpo:annualCost(1e9,ppo,tax), atZero:{hdhp:annualCost(0,hdhp,tax),ppo:annualCost(0,ppo,tax)}};
  }
  function hsaLimit(L, year, coverage, age55){ var y=L.years[year]; return (coverage==='family'?y.hsaFamily:y.hsaSelf) + (age55?L.hsaCatchUp55:0); }
  // COBRA: total monthly plan cost x 102% (150% in disability-extension months 19-29)
  function cobra(totalMonthly, months, L, disabilityExt){
    var base = Math.min(months,18), ext = disabilityExt ? Math.max(0, Math.min(months,29)-18) : 0;
    var m1 = r2(totalMonthly*L.cobraPct), m2 = r2(totalMonthly*L.cobraDisabilityPct);
    return {monthly:m1, monthlyExt:m2, months:base+ext, total:r2(m1*base + m2*ext)};
  }
  // Employer plan affordability (general ACA test) + total cost comparison
  function employerVsMarket(o, L){
    var pct = L.years[o.year].affordPct, cap = r2(o.householdIncome*pct/12);
    var selfAffordable = o.employerSelfMonthly <= cap;
    var familyAffordable = o.coverage==='family' ? o.employerFamilyMonthly <= cap : null;
    var empMonthly = o.coverage==='family' ? o.employerFamilyMonthly : o.employerSelfMonthly;
    var emp = r2(empMonthly*12 + Math.min(o.expectedSpendEmp, o.empOopMax||Infinity));
    var mkt = r2(o.marketMonthly*12 + Math.min(o.expectedSpendMkt, o.mktOopMax||Infinity));
    return {pct:pct, monthlyCap:cap, selfAffordable:selfAffordable, familyAffordable:familyAffordable, employerAnnual:emp, marketAnnual:mkt, diff:r2(mkt-emp)};
  }

  // HSA money you can actually put in: limit minus employer money
  function hsaRoom(limit, employer){ return Math.max(0, limit - (employer||0)); }
  // Premium tax credit estimate (illustrative): uses HHS poverty guideline for the prior year and the IRS applicable-percentage table.
  function ptc(o, L){
    var y=L.years[o.year], f=y.fpl, size=Math.max(1,o.size|0), fpl=f.base + f.add*(size-1), pctFpl=o.income/fpl*100;
    var out={fpl:fpl, pctFpl:Math.round(pctFpl), credit:0, expectedMonthly:null, applicablePct:null, note:''};
    if (pctFpl<100){ out.note='below100'; return out; }
    if (pctFpl>400){ out.note='above400'; return out; }
    var t=y.ptcTable, ap=t[t.length-1][3];
    for (var i=0;i<t.length;i++){ var b=t[i]; if (pctFpl < b[1] || i===t.length-1){ ap = b[2] + (b[3]-b[2]) * Math.min(1,Math.max(0,(pctFpl-b[0])/(b[1]-b[0]))); break; } }
    out.applicablePct=Math.round(ap*10000)/100; out.expectedMonthly=r2(o.income*ap/12);
    out.credit=r2(Math.max(0,(o.benchmarkMonthly||0)-out.expectedMonthly)); return out;
  }
  // Future value of yearly HSA deposits invested at `rate` (deposit at start of each year)
  function hsaGrowth(annual, years, rate){ var b=0, rows=[]; for (var i=1;i<=years;i++){ b=(b+annual)*(1+rate); rows.push(r2(b)); } return rows; }
  // COBRA vs marketplace for the rest of the year: COBRA keeps deductible progress, a new plan resets it.
  function cobraVsMarket(o){
    var cobra=r2(o.months*o.cobraMonthly + o.cobraOop), market=r2(o.months*o.marketMonthly + o.marketOop);
    return {cobra:cobra, market:market, diff:r2(market-cobra)};
  }
  var api={hsaRoom:hsaRoom,ptc:ptc,hsaGrowth:hsaGrowth,cobraVsMarket:cobraVsMarket,oop:oop,annualCost:annualCost,compare:compare,hsaLimit:hsaLimit,cobra:cobra,employerVsMarket:employerVsMarket};
  if (typeof module!=='undefined'&&module.exports) module.exports=api; else root.OECalc=api;
})(this);
