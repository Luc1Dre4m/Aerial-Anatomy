import React from 'react';
import { PosedFigure } from './PosedFigure';

interface StickFigureProps {
  movementId: string;
  size?: number;
}

export function StickFigure({ movementId, size = 100 }: StickFigureProps) {
  return <PosedFigure poseKey={movementId} size={size} />;
}
