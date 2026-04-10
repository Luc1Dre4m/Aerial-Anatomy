import { useState, useMemo, useCallback } from 'react';
import { Muscle } from '../utils/types';

/**
 * Simplified SM-2 spaced repetition system.
 * Each card has: easeFactor, interval (days), nextReview (timestamp), repetitions.
 * Quality ratings: 0=again, 1=hard, 2=good, 3=easy
 */

interface CardState {
  muscleId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number; // timestamp ms
}

interface SpacedRepetitionResult {
  currentCard: Muscle | null;
  dueCount: number;
  totalReviewed: number;
  rateCard: (quality: 0 | 1 | 2 | 3) => void;
  isComplete: boolean;
  stats: { again: number; hard: number; good: number; easy: number };
}

function initCardState(muscleId: string): CardState {
  return {
    muscleId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: 0, // due immediately
  };
}

function updateCard(card: CardState, quality: 0 | 1 | 2 | 3): CardState {
  const now = Date.now();
  let { easeFactor, interval, repetitions } = card;

  if (quality < 1) {
    // Again: reset
    repetitions = 0;
    interval = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1; // 1 day
    } else if (repetitions === 2) {
      interval = 3; // 3 days
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Adjust ease factor
    easeFactor = easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
  }

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return { ...card, easeFactor, interval, repetitions, nextReview };
}

export function useSpacedRepetition(allMuscles: Muscle[]): SpacedRepetitionResult {
  const [cardStates, setCardStates] = useState<Map<string, CardState>>(() => {
    const map = new Map<string, CardState>();
    allMuscles.forEach((m) => map.set(m.id, initCardState(m.id)));
    return map;
  });

  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  // Get due cards sorted by next review time (oldest first)
  const dueCards = useMemo(() => {
    const now = Date.now();
    return allMuscles
      .filter((m) => {
        const state = cardStates.get(m.id);
        return state && state.nextReview <= now && !reviewedIds.has(m.id);
      })
      .sort((a, b) => {
        const sa = cardStates.get(a.id)!;
        const sb = cardStates.get(b.id)!;
        return sa.nextReview - sb.nextReview;
      });
  }, [allMuscles, cardStates, reviewedIds]);

  const currentCard = dueCards.length > 0 ? dueCards[0] : null;

  const rateCard = useCallback((quality: 0 | 1 | 2 | 3) => {
    if (!currentCard) return;

    const oldState = cardStates.get(currentCard.id);
    if (!oldState) return;

    const newState = updateCard(oldState, quality);
    setCardStates((prev) => {
      const next = new Map(prev);
      next.set(currentCard.id, newState);
      return next;
    });

    // If quality >= 1 (not "again"), mark as reviewed for this session
    if (quality >= 1) {
      setReviewedIds((prev) => new Set(prev).add(currentCard.id));
    }

    setStats((prev) => ({
      ...prev,
      ...(quality === 0 ? { again: prev.again + 1 } : {}),
      ...(quality === 1 ? { hard: prev.hard + 1 } : {}),
      ...(quality === 2 ? { good: prev.good + 1 } : {}),
      ...(quality === 3 ? { easy: prev.easy + 1 } : {}),
    }));
  }, [currentCard, cardStates]);

  return {
    currentCard,
    dueCount: dueCards.length,
    totalReviewed: reviewedIds.size,
    rateCard,
    isComplete: dueCards.length === 0 && reviewedIds.size > 0,
    stats,
  };
}
