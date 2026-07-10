// worker/test/validators.test.mjs — pure-function tests. No D1/KV needed.
// Run: node --test worker/test/validators.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  isValidIsraeliId,
  pickApplicantFields,
  validateApplicant,
  normalizeEmail,
  isAsciiEmail,
  hasBadKeys
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
  assert.equal(isValidIsraeliId(123456782), false);
  assert.equal(isValidIsraeliId({}), false);
  assert.equal(isValidIsraeliId(''), false);
});
test('isValidIsraeliId — trims surrounding whitespace', () => {
  assert.equal(isValidIsraeliId(' 000000018 '), true);
  assert.equal(isValidIsraeliId('\t123456782\n'), true);
});
test('isValidIsraeliId — 5-digit input padded to 9 for checksum', () => {
  assert.equal(isValidIsraeliId('00018'), true);
});

// ─── pickApplicantFields ──────────────────────────────────────────────────
test('pickApplicantFields — trims + clips long strings + drops extras', () => {
  const out = pickApplicantFields({
    family_name: '  שניידר  ',
    husband_name: 'יוסף',
    wife_name: 'אישה',
    husband_id: '123456782',
    wife_id: '234567891',
    phone: '054-1234567',
    email: 'yosef@x.com',
    address: 'רחוב הזית 1',
    track: 'buy',
    __proto__: { evil: true },              // dropped by whitelist
    ignore_me: 'nope'                        // dropped by whitelist
  });
  assert.equal(out.family_name, 'שניידר');
  assert.equal(out.husband_name, 'יוסף');
  assert.equal(out.track, 'buy');
  assert.equal(out.evil, undefined);
  assert.equal(out.ignore_me, undefined);
});
test('pickApplicantFields — bad track defaults to buy', () => {
  const out = pickApplicantFields({ family_name: 'x', track: 'evilroute' });
  assert.equal(out.track, 'buy');
});
test('pickApplicantFields — non-string values coerce to empty', () => {
  const out = pickApplicantFields({
    family_name: 'x', husband_name: 42, wife_name: null, phone: {}, email: []
  });
  assert.equal(out.husband_name, '');
  assert.equal(out.wife_name, '');
  assert.equal(out.phone, '');
  assert.equal(out.email, '');
});

// ─── validateApplicant ────────────────────────────────────────────────────
test('validateApplicant — happy path passes', () => {
  const errs = validateApplicant({
    family_name: 'שניידר',
    husband_name: 'יוסף',
    wife_name: 'אישה',
    husband_id: '123456782',
    wife_id: '000000018',
    phone: '054-1234567',
    email: 'x@example.com'
  }, { requireContact: true });
  assert.deepEqual(errs, []);
});
test('validateApplicant — missing family_name is reported', () => {
  const errs = validateApplicant({ family_name: '', husband_name: 'x' }, { requireContact: false });
  assert.ok(errs.includes('family_name'));
});
test('validateApplicant — bad IL-ID reported', () => {
  const errs = validateApplicant({
    family_name: 'x', husband_id: '999999999', wife_id: '111111111'
  }, { requireContact: false });
  assert.ok(errs.includes('husband_id'));
  assert.ok(errs.includes('wife_id'));
});
test('validateApplicant — requireContact=true forces phone or email', () => {
  const errs = validateApplicant({ family_name: 'x' }, { requireContact: true });
  assert.ok(errs.includes('phone_or_email'));
});
test('validateApplicant — bad email format reported', () => {
  const errs = validateApplicant({
    family_name: 'x', email: 'not-an-email', phone: '054-1234567'
  }, { requireContact: true });
  assert.ok(errs.includes('email'));
});

// ─── normalizeEmail / isAsciiEmail ────────────────────────────────────────
test('normalizeEmail — lowercases + trims + strips zero-width', () => {
  // zero-width space between "admin" and "@" — homograph attack
  assert.equal(normalizeEmail('  Admin​@Example.COM  '), 'admin@example.com');
  assert.equal(normalizeEmail('Foo@Bar.co.il'), 'foo@bar.co.il');
});
test('normalizeEmail — returns empty for null/undefined/non-string', () => {
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(undefined), '');
  assert.equal(normalizeEmail(42), '');
});
test('isAsciiEmail — accepts real ASCII emails', () => {
  assert.equal(isAsciiEmail('admin@example.com'), true);
  assert.equal(isAsciiEmail('a.b+c@x.co.il'), true);
});
test('isAsciiEmail — rejects non-ASCII (Turkish dotless i homograph)', () => {
  assert.equal(isAsciiEmail('admın@example.com'), false);
  assert.equal(isAsciiEmail('אבג@example.com'), false);
});

// ─── hasBadKeys (recursive prototype-pollution guard) ─────────────────────
test('hasBadKeys — flat object without bad keys is safe', () => {
  assert.equal(hasBadKeys({ a: 1, b: 'x', c: [1, 2, 3] }), false);
});
// {__proto__: X} in a literal SETS prototype (no own key). But a real
// attack ships JSON.parse-parsed input, where __proto__ IS an own key.
// Test with actual JSON.parse output — closer to the attack surface.
test('hasBadKeys — top-level __proto__ from JSON.parse is flagged', () => {
  const attack = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(hasBadKeys(attack), true);
});
test('hasBadKeys — nested __proto__ from JSON.parse is flagged', () => {
  const attack = JSON.parse('{"a":{"b":{"__proto__":{"x":1}}}}');
  assert.equal(hasBadKeys(attack), true);
});
test('hasBadKeys — __proto__ inside array element from JSON.parse is flagged', () => {
  const attack = JSON.parse('[{"safe":1},{"__proto__":{"x":1}}]');
  assert.equal(hasBadKeys(attack), true);
});
test('hasBadKeys — nested constructor / prototype flagged', () => {
  assert.equal(hasBadKeys({ x: { constructor: 'bad' } }), true);
  assert.equal(hasBadKeys({ x: { y: { prototype: 'bad' } } }), true);
});
test('hasBadKeys — null / primitives are safe', () => {
  assert.equal(hasBadKeys(null), false);
  assert.equal(hasBadKeys('str'), false);
  assert.equal(hasBadKeys(42), false);
  assert.equal(hasBadKeys(true), false);
});
test('hasBadKeys — depth limit prevents runaway recursion', () => {
  // Build a 40-deep chain; depth cap is 30 in the impl.
  let deep = { end: true };
  for (let i = 0; i < 40; i++) deep = { a: deep };
  // No __proto__ anywhere, so still false — but doesn't stack-overflow.
  assert.equal(hasBadKeys(deep), false);
});
