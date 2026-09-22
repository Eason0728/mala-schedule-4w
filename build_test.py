#!/usr/bin/env python3
"""從 index.html 產生測試版 test.html。
測試版：資料鍵改成 mala4wtest_（跟正式版、月曆版都不相通）、第一次打開自動灌 8 位假人員、
T01／T02 兩期班表（11 月故意放 3 個錯讓檢核面板有東西看）、設定頁多一顆「重設測試資料」。
改完 index.html 後重跑：python3 schedule_4w/build_test.py
"""
import pathlib
here=pathlib.Path(__file__).parent
s=here.joinpath('index.html').read_text()
def rep(old,new,n=1):
    global s
    assert s.count(old)==n,(old[:50],s.count(old)); s=s.replace(old,new)

s=s.replace('mala4w_','mala4wtest_')
rep('<title>麻的🔥小辛辣 排班系統（四週變形版）</title>','<title>麻的🔥小辛辣 排班系統（四週變形版・測試）</title>')
rep('<body>','''<body>
<div style="background:#8f6100;color:#fff;font-size:12px;text-align:center;padding:6px 16px">
  測試版：資料只存在這台裝置，隨便改；玩壞了到「設定 → 測試資料」重設。
</div>''')
rep('<div class="section-title">🔒 班表鎖定</div>','''<div class="section-title">🧪 測試資料</div>
  <div class="card">
    <div style="font-size:12px;color:var(--gray);line-height:1.7;margin-bottom:10px">
      八位假人員、T01（10/4–10/31）已排好且合規、T02（11/1–11/28）故意放了三個錯、T03 起是空的可以試自動排班。
    </div>
    <button class="btn btn-danger" style="width:100%" onclick="resetTestData4W()">重設測試資料</button>
  </div>
  <div class="section-title">🔒 班表鎖定</div>''')
rep('<div class="section-title">☁️ 雲端同步</div>','<div class="section-title" style="display:none">☁️ 雲端同步</div>')
rep('<div class="card" id="gist-setting-card">','<div class="card" id="gist-setting-card" style="display:none">')
rep("  saveEmployees(DEMO_EMPS_4W.map(e=>({...e,id:uid()})));","  /* 測試版：由檔尾 seedTestData4W() 灌資料 */")

seed=r'''
// ===================== 測試版：灌測試資料 =====================
function seedTestData4W(){
  _suppressPush=true;
  saveEmployees(DEMO_EMPS_4W.map((e,i)=>({...e,id:'t0'+(i+1)})));
  save('mala4wtest_auto_rules',{empRules:{
    t01:{allowedShifts:['E','F']}, t02:{allowedShifts:['A','B']},
    t03:{weekdayShift:'E',offWeekends:true,allowedShifts:['E']},
    t04:{allowedShifts:['E','A']},
    t05:{designatedWorkMode:true,allowedShifts:['C']},
    t06:{allowedShifts:['C','D','C2','D1']}, t07:{allowedShifts:['C','C2','D']}, t08:{allowedShifts:['D','D1','C2']} }});
  seedHolidays();
  // T01（10/4–10/31）、T02（11/1–11/28）由自動排班產生
  [0,1].forEach(ci=>{
    const g=autoGen4W(ci,{cannotWork:{t01:ci===0?[2,3]:[]}, workDays:{t05:[5,6,12,13,19,20,26,27]}});
    writeCycle4W(g.dates,g.emps,g.out); });
  // 11 月故意放三個錯，讓檢核面板有東西看
  const nov=getSchedule(2026,11), W=c=>isWork4(c,getShifts());
  for(let d=2;d<=27;d++){ if(W(nov.t02[d])&&W(nov.t02[d+1])){ nov.t02[d]='A'; nov.t02[d+1]='E'; break; } }   // R7：A 班 23:30 下班、隔天 E 班 09:00，只隔 9.5 小時
  const ex=Object.keys(nov.t04).filter(d=>+d>=15&&nov.t04[d]==='例'); if(ex.length) nov.t04[ex[ex.length-1]]='B';   // R4／R5：後半期少一天例假
  let n=0; for(let d=1;d<=28&&n<6;d++){ if(nov.t01[d]==='F'){ nov.t01[d]='A10'; n++; } }   // R1：6 天 F 班改晚長班，多 12 小時，超過 160
  saveSchedule(2026,11,nov);
  _suppressPush=false;
}
function resetTestData4W(){
  if(!confirm('清掉這台裝置上的測試資料，重新灌一份？')) return;
  const del=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith('mala4wtest_')) del.push(k); }
  del.forEach(k=>localStorage.removeItem(k)); location.reload();
}
// 第一次打開才灌；週期還沒開始前，打開直接跳到 2026 年 10 月
if(!getEmployees().length) seedTestData4W();
if(new Date()<new Date(2026,9,1)){ state.curYear=2026; state.curMonth=10; }
renderSchedule();
'''
i=s.rindex('</script>'); s=s[:i]+seed+s[i:]
here.joinpath('test.html').write_text(s)
print('test.html', len(s))
