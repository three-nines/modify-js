<div align="center">
<img src="https://raw.githubusercontent.com/harnuma9/modify-js/refs/heads/main/media/banner.png" alt="Banner" width="1250">
</div>

<br />

# @stless/modify-js

[![npm version](https://img.shields.io/npm/v/@stless/modify-js.svg)](https://www.npmjs.com/package/@stless/modify-js)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.11.0-green)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/harnuma9/modify-js/blob/main/LICENSE)
![Verify Status](https://github.com/harnuma9/modify-js/actions/workflows/verify.yml/badge.svg)
[![Socket Badge](https://badge.socket.dev/npm/package/@stless/modify-js/2.0.0)](https://badge.socket.dev/npm/package/@stless/modify-js/2.0.0)
[![Donate](https://img.shields.io/badge/@Harnuma9-Donate-FF4D4D)](https://harnuma9.github.io/donate/)

<br />

`@stless/modify-js` is an opinionated, zero-dependency utility implementing functional piping through a stateful container. It provides a predictable, secure alternative to the TC39 Pipeline Operator.

<br />

> 📖 **Documentation:** Full API breakdowns, edge cases, and advanced configurations are available at **[harnuma9.github.io/modify-js](https://harnuma9.github.io/modify-js/)**.

> 📦 **Full API context optimized for AI assistants and contributors** is available in [`llms-full.txt`](https://github.com/harnuma9/modify-js/blob/main/llms-full.txt).

<br />
<br />

---

<br />

## 🚀 Getting Started

```bash
npm install @stless/modify-js
```

<br />

### Requirements

* **Node.js**: `>=16.11.0` (For stable [ES2022 Private Field](https://dev.to/smitterhane/private-class-fields-in-javascript-es2022-3b8) support)

<br />

> [!NOTE]
> 
> **Node.js only.**
> This library has no browser equivalent for `timingSafeEqual`, and bundler polyfills cannot fully substitute these APIs.

<br />
<br />

## 📖 Usage Guide

Every method exposed on the pipeline passes the current state `val` along with a reference to the active pipeline instance `ctx` down to your callback structures, enabling fluid data and configuration manipulation mid-chain.

<br />

### Basic Operations (`set`, `reset`, `modify`, `mutate`)

* **`modify` (`_p`)**: Transforms data by replacing the internal pipeline state with the callback's return value.
* **`mutate` (`_m`)**: Designed for executing mutations or side effects directly on object references. The callback's return value is ignored.
* **`set` (`_s`)**: Discards the current state and forces a fresh assignment without callback execution overhead.
* **`reset` (`_rs`)**: Clears the internal state to `undefined` and returns `this`. Calls `zeroBuf` only if `isWipe` is enabled.

```javascript
import chain_ from '@stless/modify-js';

const result = chain_({ score: 10 })
  .mutate(data => { data.score += 5; })              // In-place property mutation
  .modify(data => ({ ...data, rank: 'A' }))          // Data transformation (returns a new reference)
  .mutate((val, ctx) => console.log(ctx.isLocked())) // Inspect instance flags via 'ctx' context
  .reset()                                           // Drop state to undefined; zeroBuf only fires if isWipe is enabled
  .out('Default');                                   // Evaluates undefined state, falls back and returns 'Default'

```

<br />

### Deep Path Traversal (`alterValue` / `_a`)

* **`alterValue` (`_a`)**: Targets and mutates deep object properties or nested array indices using string-based dot notation paths. Employs aggressive internal prototype validation hooks to block malicious injection vectors automatically.

```javascript
const userProfile = { meta: { session: { roles: ['guest'] } } };

const upgraded = chain_(userProfile, false)
  ._a('meta.session.roles.0', 'administrator') // Modifies structural dependency trees cleanly
  .out();

```

<br />

### Pipeline Flag Modifiers (`toggleIsWipe`, `toggleIsHighPerformance`)

* **`toggleIsWipe` (`togw`)**: Activates or deactivates runtime byte-erasure routines over buffers and memory blocks.
* **`toggleIsHighPerformance` (`togh`)**: Bypasses expensive deep-equality checks before tracking internal value alterations when performance speed is favored.

```javascript
const processedToken = chain_(sensitiveBuffer)
  .togw(true)   // Arm the engine's zeroBuf memory shredder for downstream extraction
  .togh(true)   // Fast-track state updates by bypassing structural object graph validations
  ._p(buf => transformCrypto(buf))
  .out();       // Extracts data, then safely overwrites historical raw memory tracks with zeroes

```

<br />

### Conditional Control Flow (`exitWhen`)

* **`exitWhen` (`_wx`)**: Evaluates a check condition. If it returns true, it materializes the data, transforms it, and short-circuits the pipeline into a `SilentPipe` Proxy wrapper. All downstream chain methods are safely ignored.

```javascript
const processRequest = (payload) => 
  chain_(payload)
    ._wx(p => !p.valid, p => ({ status: 400, err: 'Invalid request payload' }))
    ._p(p => processValidData(p)) // Bypassed dynamically if payload.valid was false
    .out();

```

<br />

### Advanced Exception Management (`exitErr`, `catchErr`)

* **`exitErr` (`_xe`)**: Tries an action. If it catches an unhandled error, it instantly terminates the active pipeline context, resolves your assigned fallback recovery data, and returns a short-circuited `SilentPipe` wrapper.
* **`catchErr` (`_ce`)**: Acts as an inline functional try/catch boundary. If processing fails, it traps the exception, captures the current value before attempting execution, and restores it if the operation throws — equivalent to a local variable snapshot before a try/catch block, and continues uninterrupted down the chain.

```javascript
const safeDataPipeline = chain_(rawInput)
  ._ce(
    input => potentialFlakyParsing(input),
    (err, rollbackValue) => ({ ...rollbackValue, fallbackApplied: true }) // Recovery rollback step
  )
  ._xe(
    state => criticalHardwareWrite(state), 
    () => ({ fatal: true, log: 'Hardware Write Error' }) // Halts pipeline entirely on failure
  )
  ._p(state => finalFormattingStep(state)) // Bypassed if criticalHardwareWrite threw an error
  .out();

```

<br />
<br />

## ⚔️ Syntax Comparison

Achieve entirely linear functional execution tracks with zero assignment overhead (`const`, `let`, or `var`).

<br />

**Before (Imperative):**

```javascript
import crypto from 'node:crypto';

function encryptMsg(algo, data, key, iv) {
  const cipher = crypto.createCipheriv(algo, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  key.fill(0); // Sensitive cleanup
  iv.fill(0);
  return encrypted;
}

```

<br />

**After (With Pipe):**

```javascript
import { chain_, zeroBuf } from '@stless/modify-js';
import crypto from 'node:crypto';

function encryptMsg(algo, data, key, iv) {
  return chain_([algo, key, iv])
    ._p(args => crypto.createCipheriv(...args))           // Create cipher instance
    ._p(cipher => Buffer.concat([cipher.update(data), cipher.final()])) // Process data payload
    ._m(() => zeroBuf(key, iv))                           // Direct security side-effect cleanup
    .out();
}

```

<br />

**Visual comparison to TC39 (Hack-style proposal syntax):**

```javascript
import crypto from 'node:crypto';

function encryptMsg(algo, data, key, iv) {
  return [algo, key, iv]
    |> crypto.createCipheriv(...%) 
    |> Buffer.concat([%.update(data), %.final()])
    |> (key.fill(0), iv.fill(0), %)
}

```

<br />
<br />

## ⚔️ Library Comparison

> **Scenario:** parse a raw user record, validate it, transform fields, handle a bad parse, and extract the result.

<br />

### Lodash

```javascript
import _ from 'lodash';

function processUser(raw) {
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    parsed = { name: 'unknown', score: 0 };
  }

  if (!parsed.name) {
    throw new Error('missing name');
  }

  const trimmed  = _.mapValues(parsed, v =>
    typeof v === 'string' ? v.trim() : v
  );
  const renamed  = _.omit(trimmed, ['__v']);
  const scored   = _.merge(renamed, {
    score: _.clamp(renamed.score ?? 0, 0, 100),
    tier:  renamed.score >= 80 ? 'gold'
         : renamed.score >= 50 ? 'silver'
         : 'bronze',
  });

  return _.pick(scored, ['name', 'score', 'tier']);
}
```

<br />

### RxJS

```javascript
import { of } from 'rxjs';
import {
  map, filter, catchError, take
} from 'rxjs/operators';

function processUser(raw) {
  let result;

  of(raw).pipe(
    map(r => JSON.parse(r)),
    catchError(() => of({
      name: 'unknown', score: 0
    })),
    filter(u => !!u.name),
    map(u => ({
      ...u,
      name:  u.name.trim(),
      score: Math.min(Math.max(u.score ?? 0, 0), 100),
    })),
    map(u => ({
      name:  u.name,
      score: u.score,
      tier:  u.score >= 80 ? 'gold'
           : u.score >= 50 ? 'silver'
           : 'bronze',
    })),
    take(1),
  ).subscribe({
    next: v  => { result = v; },
    error: e => { throw e; },
  });

  return result;
}
```

<br />

### With `@stless/modify-js`

```javascript
import chain_ from '@stless/modify-js';

const processUser = (raw) =>
  chain_(raw)
    ._ce(
      r  => JSON.parse(r),
      () => ({ name: 'unknown', score: 0 })
    )
    ._wx(
      u  => !u.name,
      () => { throw new Error('missing name'); }
    )
    ._p(u => ({
      ...u,
      name:  u.name.trim(),
      score: Math.min(Math.max(u.score ?? 0, 0), 100)
    }))
    ._p(u => ({
      name:  u.name,
      score: u.score,
      tier:  u.score >= 80 ? 'gold'
           : u.score >= 50 ? 'silver'
           : 'bronze'
    }))
    .$o();
```

<br />

### At a glance

| | lodash | rxjs | modify-js |
| --- | --- | --- | --- |
| **Error flow in chain** | No — manual `try/catch` outside | Partial — `catchError` operator | Yes — `_ce`, `_xe`, `_wx` built in |
| **Temp variables needed** | Yes — `let parsed`, `const trimmed`... | Yes — `let result` to escape observable | No — fully linear, zero assignments |
| **Primary use case** | Object/array utility ops | Async reactive streams | Stateful sequential pipelines |
| **Async/stream support** | No | Yes — core feature | No — sync only |
| **Memory wiping** | No | No | Yes — `isWipe`, `zeroBuf` |
| **Browser support** | Yes | Yes | No — Node only |
| **Bundle size** | ~75KB minified | ~45KB minified (core) | ~7.2KB minified |

<br />

**[Lodash](https://www.npmjs.com/package/lodash)** is a utility toolkit — great for individual object and array operations but error handling lives outside any chain.

**[RxJS](https://www.npmjs.com/package/rxjs)** is a reactive stream runtime — powerful for async event sequences but heavy overhead for a synchronous single-value pipeline, and `subscribe()` breaks linearity.

**`modify-js`** is purpose-built for sequential stateful transforms where error recovery, conditional exits, and memory safety need to be part of the chain itself, not wrapped around it.

<br />
<br />

## 🧩 Technical Implementation Reference

This library utilizes an opinionated, stateful container design relying on explicit memory-wiping boundaries, dynamic error proxies, and structural finalization.

<br />

### Pipeline Instance Methods

These methods are available on instances returned by `chain_()` or `chain$()`, as well as their shorthand aliases.

| Method | Production Shorthands | Operation Category | Deep Behavioral Engine Notes |
| --- | --- | --- | --- |
| **`toggleIsWipe`** | `togw` | Flag Control | Inverts or explicitly sets the underlying memory-sanitization policy. |
| **`toggleIsHighPerformance`** | `togh` | Flag Control | Bypasses the extensive structural/binary `compareVal` verification layer when `true`. |
| **`set`** | `_s`, `$s` | Raw Overwrite | Directly swaps the root `#value` without functional allocation overhead. Clears memory if `isWipe` is active. |
| **`reset`** | `_rs`, `$rs` | Security Purge | Clears the internal state to `undefined` and returns `this`. Only calls `zeroBuf` to wipe memory if `isWipe` is currently enabled — otherwise it just drops the reference. |
| **`modify`** | `_p`, `$p` | Functional Map | Spawns a functional frame, passes the current state, and overrides root memory reference with the callback’s explicit return value. |
| **`mutate`** | `_m`, `$m` | In-place Effect | Ignores functional return values entirely. Designed for direct property manipulation on arrays or object references. |
| **`tryModify`** | `_tp`, `$tp` | Error Isolation | Attempts a functional mapping. If it throws a runtime error, intercepts the crash to bind an assigned fallback value or recovery callback. |
| **`tryMutate`** | `_tm`, `$tm` | Error Isolation | Attempts an in-place mutation. If an exception occurs, executes a recovery block or drops the chain to a fallback state. |
| **`modifyWhen`** | `_wp`, `$wp` | Conditional Logic | Conditional execution. Evaluates a predicate check; executes a core state `modify` transformation *only* if the condition yields `true`. |
| **`tapWhen`** | `_wc`, `$wc` | Conditional Logic | Conditional side-effect. Evaluates a predicate check; executes a functional mutation block without overriding the parent reference hook. |
| **`exitWhen`** | `_wx`, `$wx` | Early Short-Circuit | If the predicate is met, flushes out the data via `out()`, transforms it, and morphs the engine into a dynamic `SilentPipe` Proxy to dead-end all future calls. |
| **`exitErr`** | `_xe`, `$xe` | Exception Handshake | Attempts execution; if an unhandled exception triggers, instantly kills the active pipe, resolves the fallback value, and returns a `SilentPipe` Proxy. |
| **`catchErr`** | `_ce`, `$ce` | Exception Rollback | Acts like a standard functional `try/catch`. If an execution step fails, it catches the exception and restores the value that was captured before the call, or applies your fallback if provided. |
| **`alterValue`** | `_a`, `$a` | Anti-Pollution Set | Traverses object trees via string notation paths (`'a.b.c'`). Employs a triple-layered security guard that throws errors if prototype corruption strings are detected. |
| **`out`** | `_o`, `$o` | Terminal Extraction | Evaluates and extracts the final calculation state. Automatically triggers a `finally` block that zeroes out references and locks the pipeline via `Object.freeze`. |
| **`isLocked`** | `_l`, `$l` | Structural Guard | Performs a real-time health check returning `Object.isFrozen(this)` to ensure instance integrity. |

<br />

### Standalone Core Utilities

The underlying infrastructure components can be imported independently as named exports for lower-level systems engineering tasking.

```javascript
import { zeroBuf, compareVal, isAsync, toAsync, wrapTry, wrapTrySync } from '@stless/modify-js';
```

<br />

| Named Export | Type | Purpose & Low-Level Mechanics |
| --- | --- | --- |
| **`chain_`** / **`chain$`** | `Function` | Factory entry points that instantiate a new, stateful `Pipe` container wrapping the target input value. |
| **`zeroBuf`** | `Function` | Zeros out binary views and raw buffers (`ArrayBuffer`, `SharedArrayBuffer`, typed views) by calling `.fill(0)` across the allocated memory region. **Note:** the JS runtime or OS may not guarantee immediate physical erasure. |
| **`compareVal`** | `Function` | A hardened, timing-safe equality engine. Falls back to a manual constant-time bitwise loop (`manualTimingSafeEqual`) when a `SharedArrayBuffer` is involved, since Node's `timingSafeEqual` does not accept shared memory. Uses `timingSafeEqual` for standard buffers, and `isDeepStrictEqual` for everything else. |
| **`isAsync`** | `Function` | Evaluates if a given target function is explicitly asynchronous by mapping its internal descriptor prototype chain against `AsyncFunctionProto`. |
| **`toAsync`** | `Function` | Normalizes input execution signatures. Wraps synchronous function references inside a non-blocking asynchronous executor shell while passing existing async chains straight through. |
| **`wrapTry`** | `Function` | Asynchronous error boundary orchestration engine. Automatically handles both synchronous and asynchronous execution branches, callbacks, and teardown lifecycles seamlessly via native await normalization. |
| **`wrapTrySync`** | `Function` | Synchronous variation of `wrapTry`. Absorbs processing errors safely inside synchronous runtime steps without throwing uncaught thread failures. |
| **`Pipe`** | `Class` | The core underlying pipeline state machine container. Highly defensive structure requiring active instance validation on every lifecycle state change. |
| **`SilentPipe`** | `Class` | A shell container wrapped inside a dynamic ECMAScript `Proxy`. Captures unmapped downstream methods and cleanly neutralizes them to execute seamless short-circuiting patterns. |
| **`PipeAliases`** | `Object` | A frozen map of shorthand aliases registered onto the `Pipe` and `SilentPipe` prototypes at module load time (e.g. `_p` → `modify`, `$xe` → `exitErr`). |

<br />
<br />
<br />

---

<br />

## 🛠 ️Development & Verification

```bash
npm run check        # test + verify checksums
npm run build        # minify + generate docs + checksums
npm test
```

<br />

The project uses:

* `terser` for minification
* SHA-256 checksums for all built files
* Strict mode + comprehensive test suite

<br />

---

<br />

## ⭐ Contributor(s)

<a href="https://github.com/harnuma9/modify-js/graphs/contributors">
  <img alt="contributors" src="https://contrib.rocks/image?repo=harnuma9/modify-js"/>
</a>

<br />
<br />
<br />

## License

Licensed under the **Apache License, Version 2.0**; a robust, permissive license that includes an explicit grant of patent rights and provides protection against contributor liability.

Copyright © 2026 Aries Harbinger. See the **[LICENSE](https://github.com/harnuma9/modify-js/blob/main/LICENSE)** file for full details.

<br />
<br />

## 🔗 Links

* [Github Repository](https://github.com/harnuma9/modify-js)
* [npm Package](https://www.npmjs.com/package/@stless/modify-js)
* Full AI Context **[llms-full.txt](https://github.com/harnuma9/modify-js/blob/main/llms-full.txt)** (for contributors / LLM assistants)
* Full API Documentations **[harnuma9.github.io/modify-js](https://harnuma9.github.io/modify-js/)**

<br />
<br />
<br />
<br />