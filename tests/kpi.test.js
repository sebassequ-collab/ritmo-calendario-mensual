import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMarketingKpis } from '../src/kpi.js';

test('calculates the four weighted marketing categories', () => {
  const result = calculateMarketingKpis([
    { task_type: 'reel', status: 'done' },
    { task_type: 'story', status: 'late' },
    { task_type: 'property', status: 'done' },
    { task_type: 'ad', status: 'missed' },
  ]);

  assert.equal(result.score, 80);
  assert.deepEqual(result.categories.map((type) => type.score), [100, 50, 100, 0]);
});

test('pending content is not included in a category average', () => {
  const result = calculateMarketingKpis([
    { task_type: 'reel', status: 'done' },
    { task_type: 'reel', status: 'pending' },
  ]);

  assert.equal(result.categories[0].score, 100);
  assert.equal(result.categories[0].pending, 1);
  assert.equal(result.score, 100);
});

test('legacy tasks without a type count as reels', () => {
  const result = calculateMarketingKpis([{ status: 'late' }]);
  assert.equal(result.categories[0].score, 50);
  assert.equal(result.score, 50);
});

test('categories without scheduled tasks are excluded and active weights are normalized', () => {
  const result = calculateMarketingKpis([
    { task_type: 'reel', status: 'done' },
    { task_type: 'story', status: 'late' },
  ]);

  assert.equal(result.activeWeight, 70);
  assert.equal(result.score, 86);
  assert.deepEqual(result.categories.map((type) => type.active), [true, true, false, false]);
  assert.deepEqual(result.categories.map((type) => type.effectiveWeight), [71, 29, 0, 0]);
  assert.deepEqual(result.categories.map((type) => type.score), [100, 50, null, null]);
});

test('a scheduled category with only pending tasks participates with zero', () => {
  const result = calculateMarketingKpis([
    { task_type: 'reel', status: 'done' },
    { task_type: 'story', status: 'pending' },
  ]);

  assert.equal(result.score, 71);
  assert.equal(result.categories[1].active, true);
  assert.equal(result.categories[1].score, 0);
});
