/* HSA per-paycheck calculator */
addEventListener('DOMContentLoaded',function(){ var $=UI.$;
  function r(){ var y=LIMITS.years[$('pcYear').value],lim=($('pcCov').value==='family'?y.hsaFamily:y.hsaSelf)+(+$('pcAge').value?LIMITS.hsaCatchUp55:0),left=Math.max(0,lim-(+$('pcEr').value||0)-(+$('pcSoFar').value||0)),n=+$('pcFreq').value,per=left/n,sav=left*((+$('pcTax').value||0)/100+LIMITS.fica);
    $('pcOut').innerHTML='Limit '+UI.money(lim,true)+' · room left <b>'+UI.money(left,true)+'</b><br>Contribute <b>'+UI.money(per)+'</b> per paycheck · est. tax savings <b>'+UI.money(sav,true)+'</b> (incl. 7.65% FICA via payroll)'; history.replaceState(null,'',UI.stateURL()); }
  UI.readState(); document.querySelectorAll('#tool input,#tool select').forEach(function(e){e.addEventListener('input',r);e.addEventListener('change',r)}); r(); });
