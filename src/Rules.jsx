import React, {useState} from 'react';
import {Check, ScrollText, X} from 'lucide-react';
import {canEdit, confirmRule, normalizeRule, proposeRule, roommates} from './rules.js';
export default function Rules({rules, update}) {
  const [actor,setActor] = useState('小林');
  const [dialog,setDialog] = useState(null);
  const all = rules.map(normalizeRule);
  const active = all.filter(r=>!r.repealed);
  const vote = (r, proposal=false) => {
    const target = proposal ? r.proposal : r;
    const withdraw = target.ack.includes(actor);
    update(d=>({...d,rules:d.rules.map(item=>item.id===r.id?confirmRule(item,actor,proposal):item)}),
      `${actor}${withdraw?'撤回了对':'确认了'}「${r.name}」${proposal?'的提议':''}${proposal&&!withdraw&&target.ack.length===3?'，四人已确认，提议通过':''}`);
  };
  const save = (type,r,fields) => {
    update(d=>({...d,rules:type==='delete'?d.rules.filter(item=>item.id!==r.id||!canEdit(item)):d.rules.map(item=>{
      if(item.id!==r.id)return item;
      if(type==='edit')return canEdit(item)?{...item,...fields,ack:['小林']}:item;
      return proposeRule(item,{kind:type,...fields});
    })}),type==='delete'?`小林 删除了草案「${r.name}」`:type==='edit'?`小林 编辑了草案「${r.name}」`:`小林 发起了「${r.name}」的${type==='repeal'?'废止':'修改'}提议`);
    setDialog(null);
  };
  const acknowledgments=(r,proposal=false)=>{
    const target=proposal?r.proposal:r;
    const agreed=target.ack.includes(actor);
    return <><div className="rule-bottom"><div className="ack-avatars">{roommates.map(p=><span key={p} title={`${p} · ${target.ack.includes(p)?'已确认':'待确认'}`} className={target.ack.includes(p)?'':'pending-avatar'}><span className={`avatar small a${roommates.indexOf(p)}`}>{p==='小林'?'林':p==='阿哲'?'哲':p[0]}</span>{target.ack.includes(p)&&<i>✓</i>}</span>)}</div><small>{target.ack.length}/4 已同意</small></div><button className={agreed?'secondary agreed':'primary'} onClick={()=>vote(r,proposal)} aria-label={agreed?(proposal?'撤回提议确认':'撤回同意'):(proposal?'同意提议':'同意公约')}><Check size={15}/>{agreed?'已同意 · 撤回同意':proposal?'同意提议':'同意公约'}</button></>;
  };
  return <><div className="rules-banner"><ScrollText size={25}/><div><b>好的公约，是彼此的体谅</b><p>公约经室友共同确认后，不可由单人直接删除。修改或废止须四位室友重新确认。</p><small>{active.length} 条当前约定 · {all.filter(r=>r.repealed).length} 条已废止</small></div></div>
    <div className="rule-demo"><label>演示确认身份 <select value={actor} onChange={e=>setActor(e.target.value)}>{roommates.map(p=><option key={p}>{p}</option>)}</select></label><span>仅模拟确认操作；草案编辑及提议仍由小林发起，不会通知真实室友。</span></div>
    <div className="rules-grid">{all.map(r=><section className={`card rule ${r.repealed?'rule-archived':''}`} key={r.id} aria-label={r.name}>
      <div className="item-top"><span className="rule-emoji">{r.emoji||'📝'}</span><span className={`badge ${r.repealed?'neutral':r.effective?'green':'yellow'}`}>{r.repealed?'已废止':r.effective?'已生效':r.shared?'征求确认中':'草案'}</span></div><h3>{r.name}</h3><p>{r.body}</p>
      {!r.repealed&&<><small className="muted rule-status-note">{r.effective?'撤回个人同意不会自动废止公约。':'四人确认后生效；已有他人确认的内容需通过提议变更。'}</small>{acknowledgments(r)}
      {!r.proposal&&<div className="rule-actions">{canEdit(r)?<><button className="secondary" onClick={()=>setDialog({type:'edit',rule:r})}>编辑</button><button className="secondary" onClick={()=>setDialog({type:'delete',rule:r})}>删除</button></>:<><button className="secondary" onClick={()=>setDialog({type:'amend',rule:r})}>提议修改</button><button className="secondary" onClick={()=>setDialog({type:'repeal',rule:r})}>提议废止</button></>}</div>}
      {r.proposal&&<div className="rule-proposal"><b>{r.proposal.kind==='repeal'?'废止提议':'修改提议'} · 等待重新确认</b><small>通过前保留上方原公约；原确认不会计入提议。</small>{r.proposal.kind==='amend'&&<><h4>{r.proposal.name}</h4><p>{r.proposal.body}</p></>}<p>理由：{r.proposal.reason}</p>{acknowledgments(r,true)}</div>}</>}
      {!!r.history.length&&<details className="rule-history"><summary>变更记录（{r.history.length}）</summary>{r.history.map((h,i)=><div key={i}><b>{h.action==='repeal'?'四人同意废止':'四人同意修改'} · {new Date(h.time).toLocaleDateString('zh-CN')}</b><p>原公约：{h.name} — {h.body}</p><p>理由：{h.reason}</p><small>确认：{h.approvedBy.join('、')}</small></div>)}</details>}
    </section>)}</div>{!all.length&&<div className="empty">还没有公约，发起第一条约定吧。</div>}
    {dialog&&<RuleDialog key={`${dialog.rule.id}-${dialog.type}`} {...dialog} close={()=>setDialog(null)} save={save}/>}</>;
}
function RuleDialog({type,rule,close,save}) {
  const ref=React.useRef();
  const [error,setError]=useState('');
  React.useEffect(()=>{
    const previous=document.activeElement;
    ref.current.showModal();
    return()=>previous?.focus();
  },[]);
  const title={edit:'编辑草案',delete:'删除草案',amend:'提议修改',repeal:'提议废止'}[type];
  return <dialog ref={ref} className="modal rule-dialog" onCancel={close} onClick={e=>{if(e.target===ref.current){const rect=ref.current.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close()}}} aria-labelledby="rule-dialog-title"><div className="modal-heading"><h2 id="rule-dialog-title">{title}</h2><button className="icon-button" aria-label="关闭" onClick={close}><X size={20}/></button></div><form onSubmit={e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const fields=Object.fromEntries(Object.entries(f).map(([k,v])=>[k,v.trim()]));if(Object.values(fields).some(v=>!v)){setError('请填写完整内容，不能仅包含空格。');return}if(type==='amend'&&fields.name===rule.name&&fields.body===rule.body){setError('请先修改公约名称或具体约定。');return}save(type,rule,fields)}}>
    {(type==='edit'||type==='amend')&&<><label>公约名称<input name="name" defaultValue={rule.name} required maxLength={40}/></label><label>具体约定<textarea name="body" defaultValue={rule.body} required maxLength={300}/></label></>}
    {(type==='amend'||type==='repeal')&&<><label>提议理由<textarea name="reason" required maxLength={200} placeholder="说说为什么需要调整，方便大家共同决定。"/></label><p className="confirm-copy">小林发起即计为 1/4 同意。其余三位室友需重新确认，四人全部同意后才会{type==='repeal'?'废止并归档原公约':'替换原公约内容'}。</p></>}
    {type==='delete'&&<p className="confirm-copy">确定删除草案「{rule.name}」？这条草案尚未获得其他室友确认，删除后不可恢复。</p>}{type==='edit'&&<p className="confirm-copy">保存后保留小林的确认，等待其他室友确认。</p>}{error&&<p role="alert" className="error">{error}</p>}<div className="modal-actions"><button className="secondary" type="button" onClick={close}>取消</button><button className="primary" type="submit">{type==='delete'?'确认删除':type==='edit'?'保存修改':'发起提议'}</button></div></form></dialog>;
}
