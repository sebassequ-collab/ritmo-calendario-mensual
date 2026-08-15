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
  assert.equal(result.score, 50);
});

test('legacy tasks without a type count as reels', () => {
  const result = calculateMarketingKpis([{ status: 'late' }]);
  assert.equal(result.categories[0].score, 50);
  assert.equal(result.score, 25);
});
