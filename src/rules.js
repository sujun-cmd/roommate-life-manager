export const roommates = ['小林', '阿哲', 'Mia', 'Kevin'];
export function normalizeRule(rule) {
  const ack = [...new Set(rule.ack || [])].filter(p => roommates.includes(p));
  return {
    ...rule, ack, author: rule.author || (rule.id <= 5 ? 'Mia' : '小林'),
    shared: Boolean(rule.shared || ack.length > 1),
    effective: Boolean(rule.effective || ack.length === 4),
    history: rule.history || [],
  };
}
export function canEdit(rule) {
  const r = normalizeRule(rule);
  return r.author === '小林' && !r.shared && !r.effective && !r.repealed && !r.proposal;
}
export function confirmRule(rule, person, proposal = false) {
  const r = normalizeRule(rule);
  if (r.repealed || !roommates.includes(person) || (proposal && !r.proposal)) return r;
  const target = proposal ? r.proposal : r;
  const ack = target.ack.includes(person) ? target.ack.filter(p => p !== person) : [...target.ack, person];
  if (!proposal) return {...r, ack, shared: r.shared || ack.length > 1, effective: r.effective || ack.length === 4};
  const next = {...r.proposal, ack};
  if (ack.length < 4) return {...r, proposal: next};
  const history = [...r.history, {name:r.name, body:r.body, action:next.kind, reason:next.reason, approvedBy:ack, time:new Date().toISOString()}];
  return next.kind === 'repeal'
    ? {...r, repealed:true, proposal:null, history}
    : {...r, name:next.name, body:next.body, ack, effective:true, shared:true, proposal:null, history};
}
export function proposeRule(rule, proposal) {
  const r = normalizeRule(rule);
  if (canEdit(r) || r.repealed || r.proposal) return r;
  return {...r, proposal:{...proposal, author:'小林', ack:['小林']}};
}
