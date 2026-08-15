export const CONTENT_TYPES = [
  { id: 'reel', label: 'Reels', singular: 'Reel', short: 'REEL', weight: 50 },
  { id: 'story', label: 'Historias', singular: 'Historia', short: 'HIST.', weight: 20 },
  { id: 'property', label: 'Propiedades', singular: 'Publicación de propiedad', short: 'PROP.', weight: 20 },
  { id: 'ad', label: 'Pautas', singular: 'Pauta', short: 'PAUTA', weight: 10 },
];

export const STATUS_POINTS = { done: 100, late: 50, missed: 0 };

export function calculateMarketingKpis(tasks) {
  const categories = CONTENT_TYPES.map((type) => {
    const scheduled = tasks.filter((task) => (task.task_type || 'reel') === type.id);
    const evaluated = scheduled.filter((task) => task.status in STATUS_POINTS);
    const score = evaluated.length
      ? Math.round(evaluated.reduce((sum, task) => sum + STATUS_POINTS[task.status], 0) / evaluated.length)
      : 0;

    return {
      ...type,
      scheduled: scheduled.length,
      evaluated: evaluated.length,
      pending: scheduled.filter((task) => task.status === 'pending').length,
      score,
      contribution: score * (type.weight / 100),
    };
  });

  return {
    score: Math.round(categories.reduce((sum, type) => sum + type.contribution, 0)),
    categories,
    evaluated: categories.reduce((sum, type) => sum + type.evaluated, 0),
    pending: categories.reduce((sum, type) => sum + type.pending, 0),
  };
}
