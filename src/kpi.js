export const CONTENT_TYPES = [
  { id: 'reel', label: 'Reels', singular: 'Reel', short: 'REEL', weight: 50 },
  { id: 'story', label: 'Historias', singular: 'Historia', short: 'HIST.', weight: 20 },
  { id: 'property', label: 'Propiedades', singular: 'Publicación de propiedad', short: 'PROP.', weight: 20 },
  { id: 'ad', label: 'Pautas', singular: 'Pauta', short: 'PAUTA', weight: 10 },
];

export const STATUS_POINTS = { done: 100, late: 50, missed: 0 };

export function calculateMarketingKpis(tasks) {
  const categoryRows = CONTENT_TYPES.map((type) => {
    const scheduled = tasks.filter((task) => (task.task_type || 'reel') === type.id);
    const evaluated = scheduled.filter((task) => task.status in STATUS_POINTS);
    const active = scheduled.length > 0;
    const score = active
      ? (evaluated.length
        ? Math.round(evaluated.reduce((sum, task) => sum + STATUS_POINTS[task.status], 0) / evaluated.length)
        : 0)
      : null;

    return {
      ...type,
      active,
      scheduled: scheduled.length,
      evaluated: evaluated.length,
      pending: scheduled.filter((task) => task.status === 'pending').length,
      score,
    };
  });

  const activeWeight = categoryRows.reduce((sum, type) => sum + (type.active ? type.weight : 0), 0);
  const categories = categoryRows.map((type) => ({
    ...type,
    effectiveWeight: type.active && activeWeight ? Math.round((type.weight / activeWeight) * 100) : 0,
    contribution: type.active ? type.score * type.weight : 0,
  }));

  return {
    score: activeWeight
      ? Math.round(categories.reduce((sum, type) => sum + type.contribution, 0) / activeWeight)
      : 0,
    activeWeight,
    categories,
    evaluated: categories.reduce((sum, type) => sum + type.evaluated, 0),
    pending: categories.reduce((sum, type) => sum + type.pending, 0),
  };
}
