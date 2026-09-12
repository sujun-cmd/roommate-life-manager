// Record affected IDs only, so undo never removes newer expenses or reopens older paid bills.
export function settleExpenses(data) {
  const ids = data.expenses.filter(e => !e.settled).map(e => e.id);
  if (!ids.length) return data;
  return {...data, expenses:data.expenses.map(e=>ids.includes(e.id)?{...e,settled:true}:e), settlementHistory:[...(data.settlementHistory || []), ids]};
}
export function undoSettlement(data) {
  const history = data.settlementHistory || [];
  if (!history.length) return data;
  const ids = history.at(-1);
  return {...data, expenses:data.expenses.map(e=>ids.includes(e.id)?{...e,settled:false}:e), settlementHistory:history.slice(0,-1)};
}
