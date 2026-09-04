import test from 'node:test'; import assert from 'node:assert/strict'; import { calendarDays, monthKey, taskOccursInMonth, taskOccursOnDate } from '../src/date.js';
test('month key uses local calendar month',()=>assert.equal(monthKey(new Date(2026,7,14)),'2026-08'));
test('calendar begins Monday and has six weeks',()=>{const days=calendarDays(new Date(2026,7,1));assert.equal(days.length,42);assert.equal(days[0].getDay(),1);});
test('a multi-day ad appears on every day in its range', () => {
  const ad = { task_type: 'ad', date: '2026-08-29', end_date: '2026-09-04' };
  assert.equal(taskOccursOnDate(ad, '2026-08-28'), false);
  assert.equal(taskOccursOnDate(ad, '2026-08-29'), true);
  assert.equal(taskOccursOnDate(ad, '2026-09-02'), true);
  assert.equal(taskOccursOnDate(ad, '2026-09-04'), true);
  assert.equal(taskOccursOnDate(ad, '2026-09-05'), false);
});
test('a multi-day ad participates in every month it crosses', () => {
  const ad = { task_type: 'ad', date: '2026-08-29', end_date: '2026-09-04' };
  assert.equal(taskOccursInMonth(ad, '2026-08'), true);
  assert.equal(taskOccursInMonth(ad, '2026-09'), true);
  assert.equal(taskOccursInMonth(ad, '2026-10'), false);
});
