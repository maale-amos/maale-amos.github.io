// worker/test/validators.test.mjs — pure-function tests. No D1/KV needed.
// Run: node --test worker/test
import { test } from 'node:test';
import assert from 'node:assert/strict';

// klita.js is an ES module that only imports other Worker modules for its
// endpoint handlers. The validator functions are pure and safe to import.
// We import from source directly (no transpile step).
import {
  isValidIsraeliId
} from '../src/klita.js';

// ─── isValidIsraeliId ─────────────────────────────────────────────────────
test('isValidIsraeliId — accepts real test IDs', () => {
  assert.equal(isValidIsraeliId('000000018'), true);
  assert.equal(isValidIsraeliId('123456782'), true);
});

test('isValidIsraeliId — rejects wrong-checksum digits', () => {
  assert.equal(isValidIsraeliId('123456789'), false);
  assert.equal(isValidIsraeliId('111111111'), false);
});

test('isValidIsraeliId — rejects all-zero + short strings', () => {
  assert.equal(isValidIsraeliId('000000000'), false);
  assert.equal(isValidIsraeliId('1'), false);
  assert.equal(isValidIsraeliId('12345'), false);
});

test('isValidIsraeliId — rejects non-digits', () => {
  assert.equal(isValidIsraeliId('12345abc'), false);
  assert.equal(isValidIsraeliId('12 34 56'), false);
  assert.equal(isValidIsraeliId('-12345678'), false);
});

test('isValidIsraeliId — rejects null / undefined / non-string', () => {
  assert.equal(isValidIsraeliId(null), false);
  assert.equal(isValidIsraeliId(undefined), false);
  assert.equal(isValidIsraeliId(123456782), false);   // number, not string
  assert.equal(isValidIsraeliId({}), false);
  assert.equal(isValidIsraeliId(''), false);
});

test('isValidIsraeliId — trims surrounding whitespace', () => {
  assert.equal(isValidIsraeliId(' 000000018 '), true);
  assert.equal(isValidIsraeliId('\t123456782\n'), true);
});

test('isValidIsraeliId — 5-digit input padded to 9 for checksum', () => {
  // 5-digit real numbers should still validate if the padded-to-9 version
  // has a correct checksum. E.g. '00018' pads to '000000018' → valid.
  assert.equal(isValidIsraeliId('00018'), true);
});
