import { describe, it, expect } from 'vitest';
import { collectionNames, itemCollectionNames } from './store';

// Structural guard for the append-only journal (ADR 0046 / 0068): the only writer of
// `validation_journal` is the /validate endpoint, which always appends. It must NOT be an
// id-addressable collection, or the generic `PUT /:collection/:id` route would let a client rewrite
// or delete an existing validation entry — breaking the no-retroactive-edit invariant.
describe('store collections', () => {
  it('registers the judge + journal collections', () => {
    expect(collectionNames).toContain('judgements');
    expect(collectionNames).toContain('validation_journal');
  });

  it('keeps the validation journal OUT of the id-addressable (PUT-writable) collections', () => {
    expect(itemCollectionNames).not.toContain('validation_journal');
    // Judge reports are candidate-only, replaced wholesale on each run — also not item-writable.
    expect(itemCollectionNames).not.toContain('judgements');
  });
});
