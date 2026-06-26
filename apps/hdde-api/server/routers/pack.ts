// Exposes the active domain pack's interview structure to the frontend (questions, blocks, personas,
// dimensions). Read-only methodology data; safe to serve to any authenticated analyst.
import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { getPack } from '../pack';

export const packRouter = Router();

packRouter.get('/', requireAuth, (_req, res) => {
  const pack = getPack();
  res.json({
    id: pack.id,
    version: pack.version,
    pack_hash: pack.packHash,
    ui_language: pack.uiLanguage,
    output_languages: pack.outputLanguages,
    dimensions: pack.dimensions,
    interview_blocks: pack.interviewBlocks,
    questions: pack.questions,
    personas: pack.personas,
    actor_types: pack.actorTypes,
    evidence_types: pack.evidenceTypes,
  });
});
