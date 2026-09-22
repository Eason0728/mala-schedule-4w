const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL|404|Failed to load resource/.test(m.text()))errs.push(m.text().slice(0,160))});
 await p.goto('file://'+require('path').resolve(__dirname,'../index.html')); await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{
  state.curYear=2026; state.curMonth=10;
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
  saveHolidays(2026,10,[10,25]); saveHolidays(2026,11,[]); saveHolidays(2026,12,[25]);
  save('mala4w_sch_2026_10',{}); save('mala4w_sch_2026_11',{}); save('mala4w_sch_2026_12',{});
  const res=[];
  const inputs={
    0:{cannotWork:{e1:[2,3,4],e2:[1,2,8,9],e4:[10]}, workDays:{e5:[5,6,12,13,19,20,26,27]}},
    1:{cannotWork:{}, workDays:{e5:[5,6,12,13,19,20,26,27]}},
    2:{cannotWork:{e6:[0,1,2,3,4,5,6]}, workDays:{e5:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]}},
  };
  for(const ci of [0,1,2]){
    const g=autoGen4W(ci,inputs[ci]);
    writeCycle4W(g.dates,g.emps,g.out);
    const c=check4W(ci);
    const grid=g.emps.map(e=>e.name.slice(0,2)+' '+g.out[e.id].map(x=>(x||'·').padEnd(2,' ')).join(''));
    res.push({cycle:cycLabel4(ci),
      rows:c.rows.map(x=>`${x.emp.name} ${x.nsum}h 例${x.ne} 休${x.nr} 多${x.nd} 國${x.nh}`),
      crit:c.issues.filter(x=>x.lvl==='crit').map(x=>x.who+' '+x.rid+' '+x.msg),
      warn:c.issues.filter(x=>x.lvl==='warn').map(x=>x.who+' '+x.rid+' '+x.msg.slice(0,50)),
      short:g.short, trimmed:g.trimmed, notes:g.notes, grid});
  }
  // 跨月寫入確認：12 月有沒有 T03 的資料
  const dec=getSchedule(2026,12), nov=getSchedule(2026,11);
  const cross={dec1:dec.e1&&dec.e1[1], dec26:dec.e1&&dec.e1[26], dec27:dec.e1&&dec.e1[27], nov29:nov.e1&&nov.e1[29]};
  // 視窗
  state.curMonth=11; renderSchedule(); openAuto4W();
  const sel=[...document.querySelectorAll('#auto4w-cycle option')].map(o=>o.textContent);
  const btns=document.querySelectorAll('#auto4w-body .auto-day-btn').length;
  return {res,cross,sel,btns,panelLen:document.getElementById('sch-4w').innerHTML.length};
 });
 r.res.forEach(x=>{console.log('\n=== '+x.cycle);
  x.grid.forEach(g=>console.log('  '+g));
  x.rows.forEach(y=>console.log('   ',y));
  console.log('   違法',x.crit.length,'要確認',x.warn.length,'缺人',x.short.length,'改多',x.trimmed.length,'提醒',x.notes.length);
  x.crit.forEach(y=>console.log('    X',y)); x.warn.forEach(y=>console.log('    ?',y));
  x.short.forEach(y=>console.log('    缺',y)); x.trimmed.forEach(y=>console.log('    多',y)); x.notes.forEach(y=>console.log('    !',y));});
 console.log('\n跨月:',JSON.stringify(r.cross),'\n視窗期別:',r.sel,'按鈕數:',r.btns,'面板長度:',r.panelLen);
 console.log('ERRORS:',errs.length?errs:'none');
 await p.screenshot({path:'modal.png'});
 await p.evaluate(()=>{closeModal('auto4w-overlay'); state.curMonth=10; renderSchedule(); document.getElementById('sch-4w').scrollIntoView();});
 await p.waitForTimeout(300); await p.screenshot({path:'panel.png'});
 await b.close();})().catch(e=>console.log('FAIL',e.message));
