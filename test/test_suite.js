import test from 'node:test';
import assert from 'node:assert/strict';
import { Pipe, chain_, chain$ } from '@stless/modify-js';

/**
 * @stless/modify-js - Official Test Suite
 * Focus: Security, Performance, Null-Safety, and State Lifecycle
 */
test('Core Initialization & Chaining', async (t) => {
  await t.test('Linear Transformation', () => {
    const result = new Pipe("  user  ")
      ._p(s => s.trim())
      .$p(s => s.toUpperCase())
      .modify(s => `ID_${s}`)
      .out();

    assert.strictEqual(result, "ID_USER", 'Pipeline should transform value linearly');
  });
});

test('Safety & Security (Hardened Features)', async (t) => {
  await t.test('Private Value Encapsulation', () => {
    const p = chain_("secret");
    assert.strictEqual(p.value, undefined, 'Internal value must not be accessible');
  });

  await t.test('Auto-Locking & Freezing (Security)', () => {
    const p = chain_(100);
    p.out(); 
    assert.ok(Object.isFrozen(p), 'Instance must be frozen after .out()');
    assert.strictEqual(p.isLocked(), true, '.isLocked() should return true');
    
    // JavaScript classes are strict by default, but let's test the side effect
    p.modify(x => 999); 
    // If it's frozen and the value was wiped, it stays wiped
    assert.strictEqual(p.isLocked(), true, 'Should remain locked');
  });

  await t.test('Memory Wiping (Data Sanitization)', () => {
    const p = chain_({ sensitive: "data" });
    const result1 = p.out(); // First exit: returns data, wipes internal state
    assert.deepEqual(result1, { sensitive: "data" });

    // Second exit: Should return the default/null because state was wiped
    const result2 = p.out("RECOVERED");
    assert.strictEqual(result2, "RECOVERED", 'Should return default because internal state was wiped');
  });
});

test('Null & Undefined Handling (The "Universal" Test)', async (t) => {
  await t.test('Handling Null with Default', () => {
    const result = chain_(null)
      ._p(v => v + " added") // null + " added" = "null added"
      .out("fallback");
    assert.strictEqual(result, "null added");
  });

  await t.test('Null Fallback at Exit', () => {
    const result = chain$(null).out("SAFE");
    assert.strictEqual(result, null, 'Should return null, ignoring fallback');
  });

  await t.test('Undefined Fallback at Exit', () => {
    const result = chain$(undefined).out(404);
    assert.strictEqual(result, 404, 'Should return default if value is undefined');
  });
});

test('Error Handling - tryModify Suite', async (t) => {
  await t.test('tryModify - Smooth Execution (No Error)', () => {
    const result = chain_(10)
      ._t(x => x * 2, 0)
      .out();
    assert.strictEqual(result, 20, 'Should transform successfully if no error occurs');
  });

  await t.test('tryModify - Dynamic Recovery (Function Fallback)', () => {
    const result = chain_("invalid_json")
      ._t(
        val => JSON.parse(val), 
        (err, currentVal) => ({ error: err.message, raw: currentVal })
      )
      .out();
    assert.ok(result.error, 'Fallback function should execute on error');
    assert.strictEqual(result.raw, "invalid_json", 'Fallback should receive the current pipeline value');
  });

  await t.test('tryModify - Static Value Fallback', () => {
    const result = chain_(5)
      .$t(x => { throw new Error('Boom'); }, 999).out();
    assert.strictEqual(result, 999, 'Should assign the static fallback value on error');
  });

  await t.test('tryModify - Implicit Safe Fallback (No Argument)', () => {
    const result = chain_("preserve_me")
      ._t(x => { throw new Error('Boom'); })
      .out();
    assert.strictEqual(result, "preserve_me", 'Should preserve current pipeline state if fallback is omitted');
  });
});

test('Error Handling - tryMutate Suite', async (t) => {
  await t.test('tryMutate - Isolation of Side-Effects', () => {
    let sideEffect = 0;
    const result = chain_({ score: 10 })
      ._tm(obj => { sideEffect = obj.score * 2; }).out();
    assert.strictEqual(sideEffect, 20, 'Side-effect should run smoothly');
    assert.deepEqual(result, { score: 10 }, 'Pipeline value must remain unreplaced');
  });

  await t.test('tryMutate - Intercept and Recovery Function', () => {
    let errorCaught = false;
    const result = chain_("state")._tm(
        val => { throw new Error('Mutation crash'); },
        (err, currentVal) => {
          if (err.message === 'Mutation crash' && currentVal === "state") {
            errorCaught = true;
          }
        }
      ).out();
    assert.strictEqual(errorCaught, true, 'Fallback tracking function should catch the exact error context');
    assert.strictEqual(result, "state", 'Pipeline value must remain unchanged after mutation error recovery');
  });

  await t.test('tryMutate - Implicit Safe State Protection', () => {
    const result = chain_("immortal_value")
      .$tm(val => { throw new Error('Crash without fallback argument'); }).out();
    assert.strictEqual(result, "immortal_value", 'Pipeline value must not be wiped out or set to undefined on side-effect crashes');
  });
});

test('Structural Manipulation - alterValue Suite', async (t) => {
  await t.test('Deep Path Spawning & Updating', () => {
    const result = chain_({})
      ._al('a.b.c', 1)
      ._al('a.b.c', val => val + 1)
      .out();
    assert.deepEqual(result, { a: { b: { c: 2 } } });
  });

  await t.test('Fallback on Error', () => {
    const result = chain_(null) // Path lookup on null will throw
      ._al('a.b', 1, true, () => 'RECOVERED').out();
    assert.strictEqual(result, 'RECOVERED');
  });
});

test('Conditional Control Flow', async (t) => {
  await t.test('tapWhen - Conditional Detour', () => {
    let touched = false;
    const result = chain_({ val: 10 })
      ._w(d => d.val === 10, d => { touched = true; d.val = 20; }).out();
    assert.strictEqual(touched, true);
    assert.strictEqual(result.val, 20);
  });

  await t.test('exitWhen - Early Short-Circuit', () => {
    const result = chain_({ val: 5 })
      ._x(d => d.val === 5, () => "BAILOUT")
      // Should be skipped these:
      ._m(d => console.log(d))
      ._p(d => d.val = 999)
      .out();
    assert.strictEqual(result, true);
  });
});

test('Advanced Lifecycle (Stateful Chaining)', async (t) => {
  await t.test('Forgiving Mode (lock = false)', () => {
    const p = chain$(10);
    const first = p.modify(x => x + 5).out(0, false);
    assert.strictEqual(first, 15, 'Should return value');
    assert.strictEqual(p.isLocked(), false, 'Pipe should NOT be locked');
    
    // Continue using the SAME instance
    const second = p.modify(x => 100).out(); // Now lock it
    assert.strictEqual(second, 100);
    assert.strictEqual(p.isLocked(), true, 'Pipe should now be locked');
  });
});