const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1300}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{const t=m.text(); if(m.type()==='error'&&!/TUNNEL|404|Failed to load resource/.test(t))errs.push(t.slice(0,200))});
 await p.goto('file://'+require('path').resolve(__dirname,'../test.html'),{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{
  const keys=Object.keys(localStorage);
  const res={emps:getEmployees().length, month:state.curYear+'/'+state.curMonth,
    keys:keys.filter(k=>!k.startsWith('mala4wtest_')), nkeys:keys.length,
    hol10:getHolidays(2026,10), hol11:getHolidays(2026,11), hol12:getHolidays(2026,12)};
  res.cycles={};
  [0,1,2].forEach(ci=>{ const c=check4W(ci);
    res.cycles[cycLabel4(ci)]={crit:c.issues.filter(x=>x.lvl==='crit').map(x=>x.who+' '+x.rid+' '+x.msg.slice(0,40)), warn:c.issues.filter(x=>x.lvl==='warn').length,
      rows:c.rows.filter(x=>x.filled).map(x=>`${x.emp.name} ${x.nsum}h 例${x.ne} 休${x.nr} 多${x.nd} 國${x.nh}`)}; });
  res.panel=document.getElementById('sch-4w').textContent.replace(/\s+/g,' ').slice(0,200);
  res.resetBtn=!!document.querySelector('[onclick="resetTestData4W()"]');
  res.gistHidden=document.getElementById('gist-setting-card').style.display==='none';
  return res;
 });
 console.log(JSON.stringify(r,null,1));
 await p.screenshot({path:'test_oct.png'});
 await p.evaluate(()=>{ changeMonth(1); document.getElementById('sch-4w').scrollIntoView(); }); await p.waitForTimeout(300);
 await p.screenshot({path:'test_nov.png'});
 // 第二次打開：資料還在、不重灌
 await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(1000);
 const r2=await p.evaluate(()=>({emps:getEmployees().length, e1_nov4:getSchedule(2026,11).t01[4]}));
 console.log('reload:',JSON.stringify(r2));
 console.log('ERRORS:',errs.length?errs:'none');
 await b.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
