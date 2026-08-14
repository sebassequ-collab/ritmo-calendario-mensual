import test from 'node:test'; import assert from 'node:assert/strict'; import { calendarDays, monthKey } from '../src/date.js';
test('month key uses local calendar month',()=>assert.equal(monthKey(new Date(2026,7,14)),'2026-08'));
test('calendar begins Monday and has six weeks',()=>{const days=calendarDays(new Date(2026,7,1));assert.equal(days.length,42);assert.equal(days[0].getDay(),1);});
