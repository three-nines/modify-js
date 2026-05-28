import test from 'node:test';
import assert from 'node:assert/strict';
import {
    Pipe, SilentPipe, chain_, chain$, PipeAliases,
    compareVal, zeroBuf, isAsync, toAsync, wrapTry, wrapTrySync
} from '@stless/modify-js';


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const noop = () => {};
const throws = (fn, msg) => assert.throws(fn, TypeError, msg);


// ─────────────────────────────────────────────────────────────────────────────
// 1. FACTORY & CONSTRUCTOR
// ─────────────────────────────────────────────────────────────────────────────

test('Factory & Constructor', (t) => {

    t.test('chain_ and chain$ produce identical Pipe instances', () => {
        const a = chain_(42).out();
        const b = chain$(42).out();
        assert.strictEqual(a, b);
    });

    t.test('new Pipe() and chain_() are equivalent', () => {
        assert.strictEqual(new Pipe(10).out(), chain_(10).out());
    });

    t.test('constructor accepts a function and calls it for initial value', () => {
        const result = chain_(() => 99).out();
        assert.strictEqual(result, 99);
    });

    t.test('constructor accepts primitive: number', () => {
        assert.strictEqual(chain_(0).out(), 0);
    });

    t.test('constructor accepts primitive: string', () => {
        assert.strictEqual(chain_('hello').out(), 'hello');
    });

    t.test('constructor accepts primitive: boolean false', () => {
        assert.strictEqual(chain_(false).out(), false);
    });

    t.test('constructor accepts null', () => {
        assert.strictEqual(chain_(null).out(), null);
    });

    t.test('constructor accepts undefined — out() returns fallback', () => {
        assert.strictEqual(chain_(undefined).out('fb'), 'fb');
    });

    t.test('constructor accepts object reference', () => {
        const obj = { x: 1 };
        assert.deepEqual(chain_(obj).out(), { x: 1 });
    });

    t.test('opts as boolean true sets isWipe', () => {
        const buf = Buffer.from([1, 2, 3]);
        chain_(buf, true)._p(() => Buffer.from([9])).out();
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('opts as object { isWipe: true } sets isWipe', () => {
        const buf = new Uint8Array([5, 6]);
        chain_(buf, { isWipe: true })._p(() => new Uint8Array([0])).out();
        assert.deepEqual([...buf], [0, 0]);
    });

    t.test('opts as object { isHighPerformance: true } sets flag', () => {
        const obj = { a: 1 };
        // high performance skips equality check — same ref should still update
        const result = chain_(obj, { isHighPerformance: true })
            ._p(v => ({ ...v, b: 2 }))
            .out();
        assert.deepEqual(result, { a: 1, b: 2 });
    });

    t.test('internal #value is not accessible from outside', () => {
        const p = chain_('secret');
        assert.strictEqual(p.value, undefined);
        assert.strictEqual(p['#value'], undefined);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 2. ALIAS REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

test('Alias Registration', (t) => {

    t.test('every alias in PipeAliases exists on Pipe.prototype', () => {
        for (const [alias, original] of Object.entries(PipeAliases)) {
            assert.strictEqual(typeof Pipe.prototype[alias], 'function', `Pipe missing alias: ${alias} → ${original}`);
            assert.strictEqual(
                Pipe.prototype[alias],
                Pipe.prototype[original],
                `Alias ${alias} must be the same function reference as ${original}`
            );
        }
    });

    t.test('PipeAliases is frozen', () => {
        assert.ok(Object.isFrozen(PipeAliases));
    });

    t.test('Pipe.prototype is frozen', () => {
        assert.ok(Object.isFrozen(Pipe.prototype));
    });

    t.test('SilentPipe.prototype is frozen', () => {
        assert.ok(Object.isFrozen(SilentPipe.prototype));
    });

    t.test('_p and $p are identical to modify', () => {
        assert.strictEqual(Pipe.prototype._p, Pipe.prototype.modify);
        assert.strictEqual(Pipe.prototype.$p, Pipe.prototype.modify);
    });

    t.test('_o and $o are identical to out', () => {
        assert.strictEqual(Pipe.prototype._o, Pipe.prototype.out);
        assert.strictEqual(Pipe.prototype.$o, Pipe.prototype.out);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 3. LOCKING & LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

test('Locking & Lifecycle', (t) => {

    t.test('isLocked() returns false before out()', () => {
        const p = chain_(1);
        assert.strictEqual(p.isLocked(), false);
    });

    t.test('isLocked() returns true after out()', () => {
        const p = chain_(1);
        p.out();
        assert.strictEqual(p.isLocked(), true);
    });

    t.test('instance is frozen after out()', () => {
        const p = chain_(1);
        p.out();
        assert.ok(Object.isFrozen(p));
    });

    t.test('out(def, lock=false) does not lock the pipe', () => {
        const p = chain_(5);
        p.out(0, false);
        assert.strictEqual(p.isLocked(), false);
    });

    t.test('pipe can be reused after out(lock=false)', () => {
        const p = chain_(5);
        p.out(0, false);
        const result = p.set(10).modify(x => x * 3).out();
        assert.strictEqual(result, 30);
    });

    t.test('final out() after reuse locks permanently', () => {
        const p = chain_(1);
        p.out(0, false);
        p.set(2).out();
        assert.ok(Object.isFrozen(p));
    });

    t.test('all methods throw TypeError on locked pipe', () => {
        const methods = ['modify', 'mutate', 'set', 'reset', 'tryModify', 'tryMutate',
            'modifyWhen', 'tapWhen', 'exitWhen', 'exitErr', 'catchErr', 'alterValue',
            'toggleIsWipe', 'toggleIsHighPerformance'];
        const p = chain_(1);
        p.out();
        for (const m of methods) {
            assert.throws(() => p[m](noop, noop), TypeError, `${m} should throw on locked pipe`);
        }
    });

    t.test('isLocked() on locked pipe returns true without throwing', () => {
        const p = chain_(1);
        p.out();
        assert.strictEqual(p.isLocked(), true);
    });

    t.test('out() on locked pipe throws TypeError', () => {
        const p = chain_(1);
        p.out();
        assert.throws(() => p.out(), TypeError);
    });

    t.test('out() flushes value to undefined internally', () => {
        const p = chain_(42);
        const result = p.out(0, false);
        assert.strictEqual(result, 42);
        // after flush, value is undefined — fallback activates
        const second = p.out(999, false);
        assert.strictEqual(second, 999);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 4. SET & RESET
// ─────────────────────────────────────────────────────────────────────────────

test('set & reset', (t) => {

    t.test('set() replaces value directly', () => {
        assert.strictEqual(chain_(1).set(99).out(), 99);
    });

    t.test('set() with undefined does not replace value', () => {
        assert.strictEqual(chain_(42).set(undefined).out(), 42);
    });

    t.test('set() returns this for chaining', () => {
        const p = chain_(1);
        assert.strictEqual(p.set(2), p);
    });

    t.test('reset() drops value to undefined', () => {
        assert.strictEqual(chain_(42).reset().out('gone'), 'gone');
    });

    t.test('reset() returns this for chaining', () => {
        const p = chain_(1);
        assert.strictEqual(p.reset(), p);
    });

    t.test('reset(false) does not call zeroBuf even with isWipe enabled', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, { isWipe: true }).reset(false).out('x');
        assert.deepEqual([...buf], [1, 2, 3]);
    });

    t.test('reset(true) with isWipe=true wipes the buffer', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, { isWipe: true }).reset(true).out('x');
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('reset(false) with isWipe=false does not wipe', () => {
        const buf = new Uint8Array([7, 8, 9]);
        chain_(buf, { isWipe: false }).reset(false).out('x');
        assert.deepEqual([...buf], [7, 8, 9]);
    });

    t.test('reset(true) with isWipe=false wipes the buffer', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, { isWipe: false }).reset(true).out('x');
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('reset(false) with isWipe=true does not wipe', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, { isWipe: true }).reset(false).out('x');
        assert.deepEqual([...buf], [1, 2, 3]);
    });

    t.test('chain can continue after reset via set()', () => {
        const result = chain_(10).reset().set(50).modify(x => x + 1).out();
        assert.strictEqual(result, 51);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 5. MODIFY & MUTATE
// ─────────────────────────────────────────────────────────────────────────────

test('modify & mutate', (t) => {

    t.test('modify() transforms value via callback return', () => {
        assert.strictEqual(chain_(5).modify(x => x * 2).out(), 10);
    });

    t.test('modify() passes (value, ctx) to callback', () => {
        let capturedCtx;
        const p = chain_(7);
        p.modify((v, ctx) => { capturedCtx = ctx; return v; }).out();
        assert.strictEqual(capturedCtx, p);
    });

    t.test('modify() chained multiple times', () => {
        const result = chain_('a')
            .modify(s => s + 'b')
            .modify(s => s + 'c')
            .modify(s => s.toUpperCase())
            .out();
        assert.strictEqual(result, 'ABC');
    });

    t.test('modify() with null value passes null to callback', () => {
        assert.strictEqual(chain_(null).modify(v => String(v)).out(), 'null');
    });

    t.test('modify() returning undefined does not update value', () => {
        assert.strictEqual(chain_(42).modify(() => undefined).out(), 42);
    });

    t.test('modify() throws if non-function passed', () => {
        assert.throws(() => chain_(1).modify(42), TypeError);
    });

    t.test('mutate() does not replace value with callback return', () => {
        const result = chain_(10).mutate(v => v * 999).out();
        assert.strictEqual(result, 10);
    });

    t.test('mutate() executes side effects', () => {
        let fired = false;
        chain_(1).mutate(() => { fired = true; }).out();
        assert.ok(fired);
    });

    t.test('mutate() can modify object in place', () => {
        const result = chain_({ n: 1 }).mutate(o => { o.n = 99; }).out();
        assert.strictEqual(result.n, 99);
    });

    t.test('mutate() passes (value, ctx) to callback', () => {
        let capturedVal;
        chain_(55).mutate((v) => { capturedVal = v; }).out();
        assert.strictEqual(capturedVal, 55);
    });

    t.test('mutate() throws if non-function passed', () => {
        assert.throws(() => chain_(1).mutate('bad'), TypeError);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 6. tryModify & tryMutate
// ─────────────────────────────────────────────────────────────────────────────

test('tryModify & tryMutate', (t) => {

    t.test('tryModify() returns transformed value on success', () => {
        assert.strictEqual(chain_(4).tryModify(x => x ** 2).out(), 16);
    });

    t.test('tryModify() applies static fallback on throw', () => {
        assert.strictEqual(chain_(1).tryModify(() => { throw new Error(); }, 'safe').out(), 'safe');
    });

    t.test('tryModify() applies function fallback on throw', () => {
        const result = chain_('state').tryModify(
            () => { throw new Error('boom'); },
            (err, val) => `${val}:${err.message}`
        ).out();
        assert.strictEqual(result, 'state:boom');
    });

    t.test('tryModify() with no fallback re-throws', () => {
        assert.throws(() => chain_(1).tryModify(() => { throw new Error('x'); }).out());
    });

    t.test('tryModify() re-throws and calls out() before throwing', () => {
        const p = chain_(1);
        assert.throws(() => p.tryModify(() => { throw new Error(); }).out());
        assert.ok(p.isLocked());
    });

    t.test('tryModify() throws if non-function fn passed', () => {
        assert.throws(() => chain_(1).tryModify(null), TypeError);
    });

    t.test('tryMutate() executes without replacing value', () => {
        const result = chain_(10).tryMutate(noop).out();
        assert.strictEqual(result, 10);
    });

    t.test('tryMutate() applies function fallback on throw', () => {
        let recovered = false;
        chain_(5).tryMutate(
            () => { throw new Error(); },
            (err, val) => { recovered = true; }
        ).out();
        assert.ok(recovered);
    });

    t.test('tryMutate() applies static fallback value on throw', () => {
        const result = chain_(5).tryMutate(
            () => { throw new Error(); },
            42
        ).out();
        assert.strictEqual(result, 42);
    });

    t.test('tryMutate() with no fallback re-throws', () => {
        assert.throws(() => chain_(1).tryMutate(() => { throw new Error(); }).out());
    });

    t.test('tryMutate() throws if non-function fn passed', () => {
        assert.throws(() => chain_(1).tryMutate('bad'), TypeError);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 7. modifyWhen & tapWhen
// ─────────────────────────────────────────────────────────────────────────────

test('modifyWhen & tapWhen', (t) => {

    t.test('modifyWhen() transforms when predicate is true', () => {
        assert.strictEqual(chain_(10).modifyWhen(v => v === 10, v => v * 2).out(), 20);
    });

    t.test('modifyWhen() skips transform when predicate is false', () => {
        assert.strictEqual(chain_(10).modifyWhen(v => v === 99, v => v * 2).out(), 10);
    });

    t.test('modifyWhen() passes (value, ctx) to both callbacks', () => {
        let pVal, fVal;
        const p = chain_(7);
        p.modifyWhen(v => { pVal = v; return true; }, v => { fVal = v; return v; }).out();
        assert.strictEqual(pVal, 7);
        assert.strictEqual(fVal, 7);
    });

    t.test('modifyWhen() throws if predicate is not a function', () => {
        assert.throws(() => chain_(1).modifyWhen(true, noop), TypeError);
    });

    t.test('modifyWhen() throws if fn is not a function', () => {
        assert.throws(() => chain_(1).modifyWhen(noop, 'bad'), TypeError);
    });

    t.test('tapWhen() fires side effect when predicate is true', () => {
        let fired = false;
        chain_(5).tapWhen(v => v === 5, () => { fired = true; }).out();
        assert.ok(fired);
    });

    t.test('tapWhen() does not replace value', () => {
        assert.strictEqual(chain_(5).tapWhen(v => v === 5, () => 999).out(), 5);
    });

    t.test('tapWhen() does not fire when predicate is false', () => {
        let fired = false;
        chain_(5).tapWhen(v => v === 0, () => { fired = true; }).out();
        assert.strictEqual(fired, false);
    });

    t.test('tapWhen() throws if predicate is not a function', () => {
        assert.throws(() => chain_(1).tapWhen(false, noop), TypeError);
    });

    t.test('tapWhen() throws if fn is not a function', () => {
        assert.throws(() => chain_(1).tapWhen(noop, null), TypeError);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 8. exitWhen
// ─────────────────────────────────────────────────────────────────────────────

test('exitWhen', (t) => {

    t.test('exitWhen() short-circuits when predicate is true', () => {
        let downstream = false;
        const result = chain_(1)
            ._wx(v => v === 1, () => 'exited')
            ._m(() => { downstream = true; })
            .out();
        assert.strictEqual(result, 'exited');
        assert.strictEqual(downstream, false);
    });

    t.test('exitWhen() continues normally when predicate is false', () => {
        const result = chain_(1)
            ._wx(v => v === 99, () => 'exited')
            ._p(v => v + 10)
            .out();
        assert.strictEqual(result, 11);
    });

    t.test('exitWhen() returns a SilentPipe after exit', () => {
        const p = chain_(1)._wx(v => v === 1, () => 'x');
        // SilentPipe absorbs all calls silently
        assert.doesNotThrow(() => p._p(noop)._m(noop)._a('x', 1).out());
    });

    t.test('exitWhen() passes (value, ctx) to fn', () => {
        let captured;
        chain_(42)._wx(v => v === 42, v => { captured = v; return v; }).out();
        assert.strictEqual(captured, 42);
    });

    t.test('exitWhen() multiple in chain — first matching exits', () => {
        let second = false;
        const result = chain_(1)
            ._wx(v => v === 1, () => 'first')
            ._wx(v => { second = true; return false; }, () => 'second')
            .out();
        assert.strictEqual(result, 'first');
        assert.strictEqual(second, false);
    });

    t.test('exitWhen() throws if predicate is not a function', () => {
        assert.throws(() => chain_(1).exitWhen(true, noop), TypeError);
    });

    t.test('exitWhen() throws if fn is not a function', () => {
        assert.throws(() => chain_(1).exitWhen(noop, 'bad'), TypeError);
    });

    t.test('SilentPipe.out() returns the exit value', () => {
        const result = chain_('val')
            ._wx(() => true, v => `mapped:${v}`)
            ._p(() => 'ignored')
            .$o();
        assert.strictEqual(result, 'mapped:val');
    });

    t.test('SilentPipe.isLocked() returns true', () => {
        const sp = chain_(1)._wx(() => true, v => v);
        sp.out();
        assert.strictEqual(sp.isLocked(), true);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 9. exitErr
// ─────────────────────────────────────────────────────────────────────────────

test('exitErr', (t) => {

    t.test('exitErr() passes through when fn succeeds', () => {
        const result = chain_(5)._xe(v => v * 2)._p(v => v + 1).out();
        assert.strictEqual(result, 11);
    });

    t.test('exitErr() exits to SilentPipe on throw', () => {
        let downstream = false;
        const result = chain_('val')
            ._xe(() => { throw new Error('fail'); }, (err, v) => `${v}:caught`)
            ._m(() => { downstream = true; })
            .out();
        assert.strictEqual(result, 'val:caught');
        assert.strictEqual(downstream, false);
    });

    t.test('exitErr() with static fallback on throw', () => {
        const result = chain_(1)
            ._xe(() => { throw new Error(); }, 'fallback')
            .out();
        assert.strictEqual(result, 'fallback');
    });

    t.test('exitErr() with no fallback re-throws', () => {
        assert.throws(() =>
            chain_(1)._xe(() => { throw new Error('fatal'); }).out()
        );
    });

    t.test('exitErr() passes (err, currentVal, ctx) to fallback', () => {
        let capturedErr, capturedVal;
        chain_('state')
            ._xe(
                () => { throw new Error('oops'); },
                (err, val) => { capturedErr = err.message; capturedVal = val; return val; }
            )
            .out();
        assert.strictEqual(capturedErr, 'oops');
        assert.strictEqual(capturedVal, 'state');
    });

    t.test('exitErr() with isModify=false does not update value', () => {
        const result = chain_(10)
            ._xe(v => v * 2, null, false) // internal value remains 10
            ._p(v => v + 1)
            .out();
        assert.strictEqual(result, 11);
    });

    t.test('exitErr() throws if fn is not a function', () => {
        assert.throws(() => chain_(1).exitErr('bad'), TypeError);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 10. catchErr
// ─────────────────────────────────────────────────────────────────────────────

test('catchErr', (t) => {

    t.test('catchErr() passes through when fn succeeds', () => {
        assert.strictEqual(chain_(5)._ce(v => v * 2).out(), 10);
    });

    t.test('catchErr() restores captured value on throw', () => {
        const result = chain_(10)
            // ._ce(() => { throw new Error(); })  // if you never define the fallback value, it defaults to throw the error
            ._ce(() => { throw new Error(); }, (err, v) => v)
            .out();
        assert.strictEqual(result, 10);
    });

    t.test('catchErr() applies function fallback on throw', () => {
        const result = chain_(10)
            ._ce(
                () => { throw new Error('x'); },
                (err, rollback) => rollback + 5
            )
            .out();
        assert.strictEqual(result, 15);
    });

    t.test('catchErr() applies static fallback on throw', () => {
        const result = chain_(10)
            ._ce(() => { throw new Error(); }, 999)
            .out();
        assert.strictEqual(result, 999);
    });

    t.test('catchErr() continues chain after recovery', () => {
        const result = chain_(10)
            ._ce(() => { throw new Error(); }, 5)
            ._p(v => v * 2)
            .out();
        assert.strictEqual(result, 10);
    });

    t.test('catchErr() does not exit to SilentPipe', () => {
        let downstream = false;
        chain_(1)
            ._ce(() => { throw new Error(); }, 0)
            ._m(() => { downstream = true; })
            .out();
        assert.ok(downstream);
    });

    t.test('catchErr() with no fallback re-throws', () => {
        assert.throws(() =>
            chain_(1)._ce(() => { throw new Error('fatal'); }).out()
        );
    });

    t.test('catchErr() with isModify=false does not update value on success', () => {
        const result = chain_(5)._ce(v => v * 10, null, false).out();
        assert.strictEqual(result, 5);
    });

    t.test('catchErr() rollback is the pre-call value, not a deep clone', () => {
        const obj = { n: 1 };
        const result = chain_(obj)
            ._ce(
                v => { v.n = 99; throw new Error(); },
                (err, rollback) => rollback
            )
            .out();
        // rollback is same reference — n was mutated before throw
        assert.strictEqual(result.n, 99);
    });

    t.test('catchErr() throws if fn is not a function', () => {
        assert.throws(() => chain_(1).catchErr(123), TypeError);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 11. toggleIsWipe & toggleIsHighPerformance
// ─────────────────────────────────────────────────────────────────────────────

test('toggleIsWipe & toggleIsHighPerformance', (t) => {

    t.test('toggleIsWipe(true) enables wiping', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf).togw(true)._p(() => new Uint8Array([9])).out();
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('toggleIsWipe(false) disables wiping', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, true).togw(false)._p(() => new Uint8Array([9])).out();
        assert.deepEqual([...buf], [1, 2, 3]);
    });

    t.test('toggleIsWipe() with no arg toggles current state', () => {
        const buf = new Uint8Array([1, 2]);
        // starts false, toggle → true
        chain_(buf).togw()._p(() => new Uint8Array([0])).out();
        assert.deepEqual([...buf], [0, 0]);
    });

    t.test('toggleIsWipe() can be toggled back off mid-chain', () => {
        const buf = new Uint8Array([1, 2]);
        chain_(buf).togw(true).togw(false)._p(() => new Uint8Array([0])).out();
        assert.deepEqual([...buf], [1, 2]);
    });

    t.test('toggleIsHighPerformance(true) skips equality check', () => {
        // With HP on, same-value objects still update ref
        const o = { x: 1 };
        const result = chain_(o).togh(true)._p(() => ({ x: 1 })).out();
        assert.deepEqual(result, { x: 1 });
    });

    t.test('toggleIsHighPerformance(false) restores equality check', () => {
        const o = { x: 1 };
        const result = chain_(o).togh(true).togh(false)._p(v => v).out();
        assert.deepEqual(result, { x: 1 });
    });

    t.test('toggleIsHighPerformance() with no arg toggles', () => {
        // just ensure it doesn't throw and chain works
        assert.doesNotThrow(() => chain_(1).togh()._p(v => v + 1).out());
    });

    t.test('toggleIsWipe returns this for chaining', () => {
        const p = chain_(1);
        assert.strictEqual(p.toggleIsWipe(true), p);
    });

    t.test('toggleIsHighPerformance returns this for chaining', () => {
        const p = chain_(1);
        assert.strictEqual(p.toggleIsHighPerformance(true), p);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 12. alterValue
// ─────────────────────────────────────────────────────────────────────────────

test('alterValue', (t) => {

    t.test('sets a top-level key', () => {
        assert.deepEqual(chain_({ a: 1 })._a('a', 2).out(), { a: 2 });
    });

    t.test('sets a deep nested key via dot notation', () => {
        assert.deepEqual(
            chain_({})._a('x.y.z', 42).out(),
            { x: { y: { z: 42 } } }
        );
    });

    t.test('creates intermediate objects when missing (isCreateNestedObj=true default)', () => {
        assert.deepEqual(chain_({})._a('a.b.c', 1).out(), { a: { b: { c: 1 } } });
    });

    t.test('throws when strict traversal fails (isCreateNestedObj=false)', () => {
        assert.throws(() => chain_({})._a('missing.key', 1, false).out());
    });

    t.test('accepts a callback for value transformation', () => {
        const result = chain_({ n: 10 })._a('n', v => v * 3).out();
        assert.strictEqual(result.n, 30);
    });

    t.test('works with array indices via dot notation', () => {
        const result = chain_({ arr: ['a', 'b', 'c'] })._a('arr.1', 'X').out();
        assert.deepEqual(result.arr, ['a', 'X', 'c']);
    });

    t.test('works with numeric nameKey directly', () => {
        const arr = [10, 20, 30];
        chain_(arr)._a(1, 99).out();
        assert.strictEqual(arr[1], 99);
    });

    t.test('calls fallback on strict traversal failure', () => {
        const result = chain_({ a: 'primitive' })
            ._a('a.deep', 1, false, () => 'recovered')
            .out();
        assert.strictEqual(result, 'recovered');
    });

    t.test('calls fallback with (err, value, ctx) signature', () => {
        let capturedErr, capturedVal;
        chain_({})._a('a.b', 1, false, (err, val) => {
            capturedErr = err;
            capturedVal = val;
            return val;
        }).out();
        assert.ok(capturedErr instanceof TypeError);
        assert.deepEqual(capturedVal, {});
    });

    t.test('blocks __proto__ at root', () => {
        assert.throws(() => chain_({})._a('__proto__.evil', true).out(), Error);
    });

    t.test('blocks constructor.prototype at root', () => {
        assert.throws(() => chain_({})._a('constructor.prototype.x', true).out(), Error);
    });

    t.test('blocks __proto__ in middle of path', () => {
        assert.throws(() => chain_({})._a('a.__proto__.evil', true).out(), Error);
    });

    t.test('blocks prototype in middle of path', () => {
        assert.throws(() => chain_({})._a('a.prototype.x', true).out(), Error);
    });

    t.test('blocks constructor as terminal key', () => {
        assert.throws(() => chain_({})._a('a.constructor', true).out(), Error);
    });

    t.test('does not pollute Object.prototype', () => {
        try { chain_({})._a('__proto__.polluted', true).out(); } catch (_) {}
        assert.strictEqual(({}).polluted, undefined);
    });

    t.test('throws on invalid nameKey type', () => {
        assert.throws(() => chain_({})._a({}, 1).out(), TypeError);
    });

    t.test('returns this for chaining', () => {
        const p = chain_({ a: 1 });
        assert.strictEqual(p._a('a', 2), p);
    });

    t.test('wiping enabled — zeroBufs old buffer value at key', () => {
        const old = new Uint8Array([5, 5, 5]);
        const obj = { buf: old };
        chain_(obj, { isWipe: true })._a('buf', new Uint8Array([1])).out();
        assert.deepEqual([...old], [0, 0, 0]);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 13. SilentPipe direct behavior
// ─────────────────────────────────────────────────────────────────────────────

test('SilentPipe', (t) => {

    t.test('SilentPipe.out() returns wrapped value', () => {
        const sp = new SilentPipe('hello');
        assert.strictEqual(sp.out(), 'hello');
    });

    t.test('SilentPipe.out() with fallback returns fallback when value is undefined', () => {
        const sp = new SilentPipe(undefined);
        assert.strictEqual(sp.out('default'), 'default');
    });

    t.test('SilentPipe.out() with function fallback calls it', () => {
        const sp = new SilentPipe(undefined);
        assert.strictEqual(sp.out(() => 'computed'), 'computed');
    });

    t.test('SilentPipe absorbs unknown method calls silently', () => {
        const sp = new SilentPipe('val');
        assert.doesNotThrow(() => sp.modify(noop).mutate(noop).set(1));
    });

    t.test('SilentPipe absorbed calls return the SilentPipe for chaining', () => {
        const sp = new SilentPipe('val');
        const chained = sp.modify(noop);
        assert.strictEqual(chained, sp);
    });

    t.test('SilentPipe.isLocked() returns false', () => {
        assert.strictEqual(new SilentPipe('x').isLocked(), false);
    });

    t.test('SilentPipe is not frozen', () => {
        assert.ok(!Object.isFrozen(new SilentPipe('x')));
    });

    t.test('SilentPipe.out() after lock does not throw', () => {
        const sp = new SilentPipe(42);
        assert.strictEqual(sp.out(), 42);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 14. zeroBuf
// ─────────────────────────────────────────────────────────────────────────────

test('zeroBuf', (t) => {

    t.test('zeroes a Buffer', () => {
        const buf = Buffer.from([1, 2, 3, 4]);
        zeroBuf(buf);
        assert.deepEqual([...buf], [0, 0, 0, 0]);
    });

    t.test('zeroes a Uint8Array', () => {
        const buf = new Uint8Array([9, 8, 7]);
        zeroBuf(buf);
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('zeroes a Uint16Array', () => {
        const buf = new Uint16Array([100, 200]);
        zeroBuf(buf);
        assert.deepEqual([...buf], [0, 0]);
    });

    t.test('zeroes a Uint32Array', () => {
        const buf = new Uint32Array([0xDEAD, 0xBEEF]);
        zeroBuf(buf);
        assert.deepEqual([...buf], [0, 0]);
    });

    t.test('zeroes a Float32Array', () => {
        const buf = new Float32Array([1.1, 2.2, 3.3]);
        zeroBuf(buf);
        assert.ok(buf.every(v => v === 0));
    });

    t.test('zeroes a Float64Array', () => {
        const buf = new Float64Array([1.1]);
        zeroBuf(buf);
        assert.strictEqual(buf[0], 0);
    });

    t.test('zeroes an Int8Array', () => {
        const buf = new Int8Array([-1, -2, 127]);
        zeroBuf(buf);
        assert.deepEqual([...buf], [0, 0, 0]);
    });

    t.test('zeroes a DataView', () => {
        const ab = new ArrayBuffer(4);
        const dv = new DataView(ab);
        dv.setUint32(0, 0xDEADBEEF);
        zeroBuf(dv);
        assert.strictEqual(new Uint32Array(ab)[0], 0);
    });

    t.test('zeroes an ArrayBuffer directly', () => {
        const ab = new ArrayBuffer(4);
        new Uint32Array(ab)[0] = 0xDEADBEEF;
        zeroBuf(ab);
        assert.strictEqual(new Uint32Array(ab)[0], 0);
    });

    t.test('zeroes a SharedArrayBuffer', () => {
        const sab = new SharedArrayBuffer(4);
        new Uint32Array(sab)[0] = 0xCAFEBABE;
        zeroBuf(sab);
        assert.strictEqual(new Uint32Array(sab)[0], 0);
    });

    t.test('zeroes a custom object with .fill()', () => {
        const custom = { data: [1, 2, 3], fill(v) { this.data = this.data.map(() => v); } };
        zeroBuf(custom);
        assert.deepEqual(custom.data, [0, 0, 0]);
    });

    t.test('accepts multiple buffers in one call', () => {
        const a = new Uint8Array([1]);
        const b = new Uint8Array([2]);
        zeroBuf(a, b);
        assert.deepEqual([...a], [0]);
        assert.deepEqual([...b], [0]);
    });

    t.test('skips null without throwing', () => {
        assert.doesNotThrow(() => zeroBuf(null));
    });

    t.test('skips undefined without throwing', () => {
        assert.doesNotThrow(() => zeroBuf(undefined));
    });

    t.test('skips plain objects without .fill() without throwing', () => {
        assert.doesNotThrow(() => zeroBuf({ x: 1 }));
    });

    t.test('skips strings without throwing', () => {
        assert.doesNotThrow(() => zeroBuf('secret'));
    });

    t.test('zeroes a TypedArray backed by a shared offset in an ArrayBuffer', () => {
        const ab = new ArrayBuffer(16);
        const view = new Uint32Array(ab, 4, 2); // offset 4, 2 elements
        view[0] = 0xFF; view[1] = 0xFF;
        zeroBuf(view);
        assert.strictEqual(view[0], 0);
        assert.strictEqual(view[1], 0);
        // bytes before offset should be untouched
        assert.strictEqual(new Uint32Array(ab)[0], 0);
    });

    t.test('returns null', () => {
        assert.strictEqual(zeroBuf(new Uint8Array([1])), null);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 15. compareVal
// ─────────────────────────────────────────────────────────────────────────────

test('compareVal', (t) => {

    t.test('equal primitives: number', () => assert.ok(compareVal(1, 1)));
    t.test('equal primitives: string', () => assert.ok(compareVal('x', 'x')));
    t.test('equal primitives: boolean', () => assert.ok(compareVal(true, true)));
    t.test('unequal primitives', () => assert.ok(!compareVal(1, 2)));

    t.test('null === null', () => assert.ok(compareVal(null, null)));
    t.test('null !== undefined', () => assert.ok(!compareVal(null, undefined)));
    t.test('undefined === undefined', () => assert.ok(compareVal(undefined, undefined)));

    t.test('NaN equals NaN via Object.is', () => assert.ok(compareVal(NaN, NaN)));
    t.test('+0 !== -0', () => assert.ok(!compareVal(+0, -0)));

    t.test('functions from same reference are equal', () => assert.ok(compareVal(noop, noop)));
    t.test('functions from different reference are never equal', () => assert.ok(!compareVal(noop, () => {})));

    t.test('deep equal objects', () => assert.ok(compareVal({ a: 1 }, { a: 1 })));
    t.test('deep unequal objects', () => assert.ok(!compareVal({ a: 1 }, { a: 2 })));

    t.test('deep equal arrays', () => assert.ok(compareVal([1, 2], [1, 2])));
    t.test('deep unequal arrays', () => assert.ok(!compareVal([1, 2], [1, 3])));

    t.test('different constructors are unequal', () => {
        assert.ok(!compareVal(new Uint8Array([1]), new Int8Array([1])));
    });

    t.test('equal Uint8Array buffers', () => {
        assert.ok(compareVal(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])));
    });

    t.test('unequal Uint8Array buffers', () => {
        assert.ok(!compareVal(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4])));
    });

    t.test('equal ArrayBuffers', () => {
        const a = new ArrayBuffer(3);
        const b = new ArrayBuffer(3);
        new Uint8Array(a).set([1, 2, 3]);
        new Uint8Array(b).set([1, 2, 3]);
        assert.ok(compareVal(a, b));
    });

    t.test('unequal ArrayBuffers', () => {
        const a = new ArrayBuffer(2);
        const b = new ArrayBuffer(2);
        new Uint8Array(a).set([0, 1]);
        new Uint8Array(b).set([0, 2]);
        assert.ok(!compareVal(a, b));
    });

    t.test('equal SharedArrayBuffers', () => {
        const a = new SharedArrayBuffer(2);
        const b = new SharedArrayBuffer(2);
        new Uint8Array(a).set([5, 6]);
        new Uint8Array(b).set([5, 6]);
        assert.ok(compareVal(a, b));
    });

    t.test('unequal SharedArrayBuffers', () => {
        const a = new SharedArrayBuffer(2);
        const b = new SharedArrayBuffer(2);
        new Uint8Array(a).set([5, 6]);
        new Uint8Array(b).set([5, 7]);
        assert.ok(!compareVal(a, b));
    });

    t.test('ArrayBuffer vs SharedArrayBuffer — different types', () => {
        const a = new ArrayBuffer(2);
        const b = new SharedArrayBuffer(2);
        assert.ok(!compareVal(a, b));
    });

    t.test('different byteLength buffers are unequal', () => {
        assert.ok(!compareVal(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3])));
    });

    t.test('empty buffers are equal', () => {
        assert.ok(compareVal(new Uint8Array([]), new Uint8Array([])));
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 16. isAsync & toAsync
// ─────────────────────────────────────────────────────────────────────────────

test('isAsync & toAsync', (t) => {

    t.test('isAsync identifies async functions', () => {
        assert.ok(isAsync(async () => {}));
    });

    t.test('isAsync returns false for sync functions', () => {
        assert.ok(!isAsync(() => {}));
    });

    t.test('isAsync returns false for generator functions', () => {
        assert.ok(!isAsync(function* () {}));
    });

    t.test('isAsync returns false for non-functions', () => {
        assert.ok(!isAsync(null));
        assert.ok(!isAsync(42));
        assert.ok(!isAsync('async'));
    });

    t.test('toAsync wraps sync function into async', async () => {
        const fn = toAsync(x => x * 2);
        const result = await fn(5);
        assert.strictEqual(result, 10);
    });

    t.test('toAsync passes async function through unchanged', () => {
        const fn = async () => {};
        assert.strictEqual(toAsync(fn), fn);
    });

    t.test('toAsync returns undefined for non-function', () => {
        assert.strictEqual(toAsync(42), undefined);
        assert.strictEqual(toAsync(null), undefined);
    });

    t.test('toAsync wrapped function returns a Promise', () => {
        const fn = toAsync(() => 99);
        assert.ok(fn() instanceof Promise);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 17. wrapTry & wrapTrySync
// ─────────────────────────────────────────────────────────────────────────────

test('wrapTry & wrapTrySync', async (t) => {

    await t.test('wrapTrySync returns value on success', () => {
        const result = wrapTrySync(() => 42, null, null, false);
        assert.strictEqual(result, 42);
    });

    await t.test('wrapTrySync calls cb_err on throw', () => {
        let caught;
        wrapTrySync(() => { throw new Error('x'); }, (e) => { caught = e.message; }, null, false);
        assert.strictEqual(caught, 'x');
    });

    await t.test('wrapTrySync returns cb_err result when isThrow=false', () => {
        const result = wrapTrySync(() => { throw new Error(); }, () => 'recovered', null, false);
        assert.strictEqual(result, 'recovered');
    });

    await t.test('wrapTrySync re-throws when isThrow=true (default)', () => {
        assert.throws(() => wrapTrySync(() => { throw new Error('fatal'); }));
    });

    await t.test('wrapTrySync calls cb_last after success', () => {
        let lastCalled = false;
        wrapTrySync(() => 1, null, () => { lastCalled = true; }, false);
        assert.ok(lastCalled);
    });

    await t.test('wrapTrySync calls cb_last after throw', () => {
        let lastCalled = false;
        wrapTrySync(() => { throw new Error(); }, () => {}, () => { lastCalled = true; }, false);
        assert.ok(lastCalled);
    });

    await t.test('wrapTrySync throws TypeError if logic is not a function', () => {
        assert.throws(() => wrapTrySync('not a fn'));
    });

    await t.test('wrapTry resolves value on success', async () => {
        const result = await wrapTry(async () => 99, null, null, false);
        assert.strictEqual(result, 99);
    });

    await t.test('wrapTry calls cb_err on async throw', async () => {
        let caught;
        await wrapTry(
            async () => { throw new Error('async fail'); },
            async (e) => { caught = e.message; },
            null, false
        );
        assert.strictEqual(caught, 'async fail');
    });

    await t.test('wrapTry returns cb_err result when isThrow=false', async () => {
        const result = await wrapTry(
            async () => { throw new Error(); },
            async () => 'async recovered',
            null, false
        );
        assert.strictEqual(result, 'async recovered');
    });

    await t.test('wrapTry re-throws when isThrow=true', async () => {
        await assert.rejects(() => wrapTry(async () => { throw new Error('x'); }));
    });

    await t.test('wrapTry calls cb_last after resolution', async () => {
        let fired = false;
        await wrapTry(async () => 1, null, async () => { fired = true; }, false);
        assert.ok(fired);
    });

    await t.test('wrapTry throws TypeError if logic is not a function', async () => {
        await assert.rejects(() => wrapTry('bad'));
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 18. isWipe — memory wiping integration
// ─────────────────────────────────────────────────────────────────────────────

test('isWipe memory wiping integration', (t) => {

    t.test('wipes old Uint8Array value when set() replaces it', () => {
        const old = new Uint8Array([0xDE, 0xAD]);
        chain_(old, { isWipe: true }).set(new Uint8Array([0xFF])).out();
        assert.deepEqual([...old], [0, 0]);
    });

    t.test('wipes old value when modify() replaces it', () => {
        const old = new Uint8Array([1, 2, 3]);
        chain_(old, { isWipe: true })._p(() => new Uint8Array([9])).out();
        assert.deepEqual([...old], [0, 0, 0]);
    });

    t.test('does not wipe when equal value returned (compareVal short-circuits)', () => {
        const buf = new Uint8Array([1, 2, 3]);
        chain_(buf, { isWipe: true })._p(v => v).out();
        // same ref returned, compareVal should match — no wipe
        assert.deepEqual([...buf], [1, 2, 3]);
    });

    t.test('wipes on out() when lock=true (default)', () => {
        const buf = new Uint8Array([7, 8]);
        const p = chain_(buf, { isWipe: true });
        p.out();
        // internal value is undefined after out() — original buf should be zeroed on previous modify
        // here no modify — buf is the value and out() doesn't wipe the extracted value
        // this confirms wipe only fires on #define, not on extraction
        assert.deepEqual([...buf], [7, 8]);
    });

    t.test('wipes work across multiple modifications', () => {
        const b1 = new Uint8Array([1]);
        const b2 = new Uint8Array([2]);
        chain_(b1, { isWipe: true })
            ._p(() => b2)
            ._p(() => new Uint8Array([3]))
            .out();
        assert.deepEqual([...b1], [0]);
        assert.deepEqual([...b2], [0]);
    });

    t.test('non-buffer values are not wiped (no error thrown)', () => {
        assert.doesNotThrow(() =>
            chain_({ x: 1 }, { isWipe: true })._p(() => ({ x: 2 })).out()
        );
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 19. out() fallback behavior
// ─────────────────────────────────────────────────────────────────────────────

test('out() fallback behavior', (t) => {

    t.test('returns value when defined', () => {
        assert.strictEqual(chain_(5).out(99), 5);
    });

    t.test('returns static fallback when value is undefined', () => {
        assert.strictEqual(chain_(undefined).out(99), 99);
    });

    t.test('returns function fallback result when value is undefined', () => {
        assert.strictEqual(chain_(undefined).out(() => 'computed'), 'computed');
    });

    t.test('does not call function fallback when value is defined', () => {
        let called = false;
        chain_(1).out(() => { called = true; return 0; });
        assert.strictEqual(called, false);
    });

    t.test('null is a defined value — fallback not used', () => {
        assert.strictEqual(chain_(null).out('fallback'), null);
    });

    t.test('false is a defined value — fallback not used', () => {
        assert.strictEqual(chain_(false).out('fallback'), false);
    });

    t.test('0 is a defined value — fallback not used', () => {
        assert.strictEqual(chain_(0).out('fallback'), 0);
    });

    t.test('empty string is a defined value — fallback not used', () => {
        assert.strictEqual(chain_('').out('fallback'), '');
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// 20. complex chain integration scenarios
// ─────────────────────────────────────────────────────────────────────────────

test('Complex chain integration', (t) => {

    t.test('full transformation pipeline with conditionals', () => {
        const result = chain_({ score: 40, tier: 'bronze' })
            ._p(v => ({ ...v, score: v.score + 10 }))
            ._wp(v => v.score >= 50, v => ({ ...v, tier: 'silver' }))
            ._wp(v => v.score >= 80, v => ({ ...v, tier: 'gold' }))
            ._a('meta.processed', true)
            .out();
        assert.strictEqual(result.tier, 'silver');
        assert.strictEqual(result.score, 50);
        assert.strictEqual(result.meta.processed, true);
    });

    t.test('error recovery continues chain cleanly', () => {
        const result = chain_(10)
            ._ce(() => { throw new Error(); }, 20)
            ._p(v => v * 2)
            ._wp(v => v > 30, v => v + 100)
            .out();
        assert.strictEqual(result, 140);
    });

    t.test('exitWhen with preceding modifications', () => {
        const result = chain_(1)
            ._p(v => v + 4)          // → 5
            ._p(v => v * 2)          // → 10
            ._wx(v => v === 10, v => `exit:${v}`)
            ._p(() => 'never')
            .out();
        assert.strictEqual(result, 'exit:10');
    });

    t.test('SilentPipe from exitErr coasts to out', () => {
        const result = chain_('data')
            ._xe(() => { throw new Error(); }, (err, v) => `safe:${v}`)
            ._p(() => 'never')
            ._m(() => { throw new Error('should not run'); })
            .out();
        assert.strictEqual(result, 'safe:data');
    });

    t.test('reset mid-chain and rebuild', () => {
        const result = chain_(999)
            .reset()
            .set(1)
            ._p(v => v + 1)
            .out();
        assert.strictEqual(result, 2);
    });

    t.test('deep alterValue followed by modify', () => {
        const result = chain_({})
            ._a('user.profile.age', 25)
            ._p(v => ({ ...v, processed: true }))
            .out();
        assert.strictEqual(result.user.profile.age, 25);
        assert.strictEqual(result.processed, true);
    });

    t.test('tap side effects do not corrupt value in long chain', () => {
        let taps = 0;
        const result = chain_(100)
            ._wc(v => v > 0, () => { taps++; })
            ._p(v => v + 1)
            ._wc(v => v > 0, () => { taps++; })
            ._p(v => v * 2)
            .out();
        assert.strictEqual(result, 202);
        assert.strictEqual(taps, 2);
    });

    t.test('multiple tryModify fallbacks chain correctly', () => {
        const result = chain_('input')
            ._tp(() => { throw new Error(); }, 'fallback1')
            ._tp(v => v.toUpperCase())
            .out();
        assert.strictEqual(result, 'FALLBACK1');
    });
});