const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{ const t=m.text(); if(t.startsWith('STEP')) console.log(t); else if(m.type()==='error'&&!/TUNNEL|404|Failed to load resource/.test(t))errs.push(t.slice(0,160))});
 await p.goto('file://'+require('path').resolve(__dirname,'../index.html'),{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1500);
 console.log('loaded');
 await p.evaluate(()=>{
  state.curYear=2026; state.curMonth=11;
  save('mala4w_employees',[
   {id:'e1',name:'王大明',isFullTime:true,base:42000,active:true},
   {id:'e2',name:'林淑芬',isFullTime:true,base:36000,active:true},
   {id:'e3',name:'陳建宏',isFullTime:true,base:34000,active:true},
   {id:'e4',name:'張雅婷',isFullTime:true,base:34000,active:true},
   {id:'e5',name:'吳俊傑',isFullTime:false,wage:190,active:true},
   {id:'e6',name:'黃美玲',isFullTime:false,wage:190,active:true}]);
  save('mala4w_auto_rules',{empRules:{
   e1:{allowedShifts:['E','F']}, e2:{allowedShifts:['A','B']},
   e3:{weekdayShift:'E',offWeekends:true,allowedShifts:['E']},
   e4:{allowedShifts:['E','A']},
   e5:{designatedWorkMode:true,allowedShifts:['C']},
   e6:{allowedShifts:['C','D','C2','D1']}}});
  saveHolidays(2026,11,[]); console.log('STEP seeded');
  renderSchedule(); console.log('STEP rendered');
  openAuto4W(); console.log('STEP modal '+document.querySelectorAll('#auto4w-body .auto-day-btn').length);
  const box=document.getElementById('leaves4w-e1');
  box.querySelector('[data-k="3"]').click(); box.querySelector('[data-k="4"]').click(); console.log('STEP clicked');
  const inp=readAuto4WInput(empsOfCycle4(1)); console.log('STEP input '+JSON.stringify(inp));
  const g=autoGen4W(1,inp); console.log('STEP gen short='+g.short.length+' trimmed='+g.trimmed.length);
 });
 console.log('phase1 ok');
 const r=await p.evaluate(()=>{
  runAuto4W(); console.log('STEP ran');
  const after=getSchedule(2026,11); const c=check4W(1);
  return {toast:document.getElementById('toast').textContent, e1_4:after.e1[4], e1_5:after.e1[5],
    crit:c.issues.filter(x=>x.lvl==='crit').length, rows:c.rows.map(x=>`${x.emp.name} ${x.nsum}h 例${x.ne} 休${x.nr} 多${x.nd}`),
    trimmed:_auto4wLast.trimmed, modalOpen:document.getElementById('auto4w-overlay').classList.contains('show'),
    summary:document.getElementById('sch-4w').textContent.includes('上次自動排班')};
 });
 console.log(JSON.stringify(r,null,1));
 await p.evaluate(()=>{ document.getElementById('sch-4w').scrollIntoView(); });
 await p.waitForTimeout(300); await p.screenshot({path:'panel.png'});
 await p.evaluate(()=>{ openAuto4W(); }); await p.waitForTimeout(300); await p.screenshot({path:'modal.png'});
 console.log('ERRORS:',errs.length?errs:'none');
 await b.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
