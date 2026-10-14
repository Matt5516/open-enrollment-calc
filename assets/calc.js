(function(root){
  function r2(n){return Math.round(parseFloat((n*100).toFixed(6)))/100;}
  // Out-of-pocket for a given amount of allowed medical spend (simplified: deductible, then coinsurance, capped at OOP max; copays ignored)
  function oop(spend, p){
    if (spend<=0) return 0;
    var c = spend <= p.deductible ? spend : p.deductible + p.coins*(spend - p.deductible);
    return Math.min(c, p.oopMax);
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
  var api={oop:oop,annualCost:annualCost,compare:compare,hsaLimit:hsaLimit,cobra:cobra,employerVsMarket:employerVsMarket};
  if (typeof module!=='undefined'&&module.exports) module.exports=api; else root.OECalc=api;
})(this);
