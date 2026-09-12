import test from 'node:test';
import assert from 'node:assert/strict';
import {canEdit,confirmRule,normalizeRule,proposeRule,roommates} from '../src/rules.js';
const draft={id:20,name:'安静时间',body:'23 点后保持安静',ack:['小林'],author:'小林'};
test('草案获得他人确认后，撤回也不能直接删除',()=>{
 assert.equal(canEdit(draft),true);
 let r=confirmRule(draft,'Mia');
 r=confirmRule(r,'Mia');
 assert.equal(r.ack.length,1);
 assert.equal(canEdit(r),false);
});
test('兼容已有公约：撤回使 4/4 变 3/4，保留生效状态',()=>{
 const r=confirmRule({...draft,ack:roommates},'小林');
 assert.equal(r.ack.length,3);assert.equal(r.effective,true);assert.equal(canEdit(r),false);
 assert.equal(confirmRule(r,'小林').ack.length,4);
});
test('提议单独收集确认，可撤回，四人确认前不修改原文',()=>{
 let r=proposeRule({...draft,ack:roommates},{kind:'amend',name:'新的安静时间',body:'22 点后保持安静',reason:'早睡'});
 assert.equal(r.proposal.ack.length,1);assert.equal(r.body,draft.body);
 r=confirmRule(r,'Mia',true);r=confirmRule(r,'Mia',true);assert.equal(r.proposal.ack.length,1);
 for(const p of ['阿哲','Mia'])r=confirmRule(r,p,true);
 assert.equal(r.body,draft.body);
 r=confirmRule(r,'Kevin',true);
 assert.equal(r.body,'22 点后保持安静');assert.equal(r.proposal,null);assert.equal(r.history[0].body,draft.body);
});
test('废止需全员重新确认，归档而非删除，禁止重新投票',()=>{
 let r=proposeRule({...draft,ack:roommates},{kind:'repeal',reason:'不再适用'});
 for(const p of ['阿哲','Mia'])r=confirmRule(r,p,true);
 assert.equal(Boolean(r.repealed),false);
 r=confirmRule(r,'Kevin',true);assert.equal(r.repealed,true);assert.equal(r.body,draft.body);
 assert.deepEqual(confirmRule(r,'小林'),r);
});
test('进行中提议不可覆盖；同意名单去重',()=>{
 const r=proposeRule({...draft,ack:roommates},{kind:'repeal',reason:'讨论'});
 assert.deepEqual(proposeRule(r,{kind:'amend',body:'替换'}),r);
 assert.equal(normalizeRule({...draft,ack:['小林','小林']}).ack.length,1);
});
