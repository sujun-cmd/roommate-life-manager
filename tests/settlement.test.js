import test from 'node:test';
import assert from 'node:assert/strict';
import {settleExpenses,undoSettlement} from '../src/settlement.js';
test('undo restores only affected expenses and preserves subsequent additions',()=>{
 const before={expenses:[{id:1,settled:true},{id:2,settled:false}]};
 let data=settleExpenses(before);
 assert.equal(data.expenses[1].settled,true);
 data=JSON.parse(JSON.stringify(data));
 data.expenses.push({id:3,settled:false});
 assert.deepEqual(undoSettlement(data).expenses,[...before.expenses,{id:3,settled:false}]);
});
test('multiple settlement batches undo in reverse order after persistence',()=>{
 let data=settleExpenses({expenses:[{id:1,settled:false}]});
 data.expenses.push({id:2,settled:false});
 data=settleExpenses(data);
 data=undoSettlement(JSON.parse(JSON.stringify(data)));
 assert.deepEqual(data.expenses,[{id:1,settled:true},{id:2,settled:false}]);
 data=undoSettlement(data);
 assert.equal(data.expenses.every(e=>!e.settled),true);
 assert.deepEqual(undoSettlement(data),data);
});
test('no-op settlement does not overwrite undo history; old saved data supported',()=>{
 const data=settleExpenses({expenses:[{id:1,settled:false}]});
 assert.deepEqual(settleExpenses(data),data);
 assert.deepEqual(undoSettlement({expenses:[]}),{expenses:[]});
});
