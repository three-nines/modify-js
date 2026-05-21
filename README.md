<div align="center">
<img src="https://raw.githubusercontent.com/harnuma9/modify-js/refs/heads/main/media/banner.png" alt="Banner" width="1250">
</div>

<br />

# @stless/modify-js

[![npm version](https://img.shields.io/npm/v/@stless/modify-js.svg)](https://www.npmjs.com/package/@stless/modify-js)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.11.0-green)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/harnuma9/modify-js/blob/main/LICENSE)
![Verify Status](https://github.com/harnuma9/modify-js/actions/workflows/verify.yml/badge.svg)
[![Socket Badge](https://badge.socket.dev/npm/package/@stless/modify-js/1.2.4)](https://badge.socket.dev/npm/package/@stless/modify-js/1.2.4)
[![Donate](https://img.shields.io/badge/@Harnuma9-Donate-FF4D4D)](https://harnuma9.github.io/donate/)

<br />

`@stless/modify-js` is an opinionated, zero-dependency utility that implements functional piping via a stateful container, designed to provide a predictable alternative to the pending TC39 Pipeline Operator.

It employs a defensive, immutable-adjacent architecture to manage state transitions and error boundaries across complex data transformations.

<br />

> **Full API context optimized for AI assistants and contributors** is available in [`llms-full.txt`](https://github.com/harnuma9/modify-js/blob/main/llms-full.txt).

<br />
<br />

---

<br />

## 🚀 Getting Started

### NPM

```bash
npm install @stless/modify-js
```

### Yarn

```bash
yarn add @stless/modify-js
```

### PNPM

```bash
pnpm add @stless/modify-js
```

<br />

### Requirements

* **Node.js**: `>=16.11.0` (For stable [ES2022 Private Field](https://dev.to/smitterhane/private-class-fields-in-javascript-es2022-3b8) support)

* **Browser**: Modern evergreen browsers (Chrome 91+, Firefox 90+, Safari 15+)

<br />
<br />

## 💡 Usage

<br />

### Pipeline Initialization and Usage

Start a chain using `chain_` or its `chain$` alias. The input is encapsulated within a stateful `Pipe` instance, abstracting away the need for intermediate variable declarations.

```javascript
// ESM
import chain_ from '@stless/modify-js';
// or CJS
const { default: chain_, chain$, zeroBuf } = require('@stless/modify-js'); 

const result = chain_("  hello world  ")
  ._p(s => s.trim())
  .$p(s => s.toUpperCase())
  .out(); // "HELLO WORLD"

```

<br />

### Linear Transformation and Chaining

Process data sequentially by passing functions to `modify` (`._p`, `.$p`). This style flattens complex data flows into a readable, top-to-bottom pipeline.

```javascript
import { Pipe } from '@stless/modify-js';

const user = new Pipe(apiResponse)
  ._p(res => res.data)
  ._p(data => ({ ...data, timestamp: Date.now() }))
  .out({ error: "No data found" }); // Returns fallback if internal state is undefined

```

<br />

### Lifecycle and State Persistence

By setting the second argument of `.out(def, lock)` to `false`, you can extract the current value while leaving the pipe unlocked for further operations. This allows you to "fork" or resume an existing chain.

```javascript
const a = chain$(100)
  ._p(n => n * 4)
  ._m(v => console.log(`Debug: ${v}`)) // Logging side-effect
  ._p(n => n - 1);

const val1 = a.out(null, false); // Extract without freezing

// Resume the existing chain
const val2 = a
  .modify(n => n - 30)
  .out(null, true); // Extract and permanently lock the instance

console.log(val1); // 399
console.log(val2); // 369

```

<br />

### Side-Effect Management

Use `mutate` (`._m`, `.$m`) to perform in-place updates or side-effects. Unlike `modify`, these methods ignore the return value and automatically pass the existing reference to the next step, removing the need for manual return statements.

```javascript
// Complex object preparation
const processedUser = chain_(rawUserData)
  ._p(parseJson)
  ._m(user => {
    user.lastAccess = Date.now();
    user.isVerified = user.emailVerified && user.phoneVerified;
    user.tags = [...new Set(user.tags || [])]; // Deduplicate array in-place
    console.log(`Processing user: ${user.id}`); // Side-effect
  })
  ._p(stringifyJson)
  .out();

```

<br />

### Structural Manipulation with `alterValue` (`._al()`, `.$al()`)

This method allows for targeted, granular updates to nested objects, arrays, or buffers. It effectively flattens structural modification into the pipeline, handling path resolution—including the dynamic creation of intermediate objects—to avoid common `TypeError` crashes when accessing undefined properties.

```javascript
// Simple key/property injection
const user = chain_(rawData)
  ._p(parseJson)
  ._al('date', Date.now())
  ._al('role', 'admin')
  ._p(stringifyJson)
  .out();

// Deeply nested assignment with automatic path spawning
const config = chain_({})
  ._al('settings.network.port', 8080)
  ._al('settings.network.host', 'localhost')
  ._al('settings.network.port', (port) => port + 1) // Functional update
  .out();
// Result: { settings: { network: { port: 8081, host: 'localhost' } } }

// Error handling within deep updates
const secureUpdate = chain_(data)
  ._al(
      'user.profile.meta.loginCount',
      (c) => c + 1,
      false,         // Disable automatic object spawning
      () => 0        // Fallback assigned if path traversal fails
  ).out();

// Array index manipulation
const arr = chain_([10, 20, 30])
  .$al(3, 99)         // Append to index 3
  ._al(0, v => v + 2) // Modify index 0
  .$al(1, v => v + Math.random() + 1) 
  .$o();              // Result: [12, 21.333144666360999, 30, 99]

```

<br />

### Error Handling & Control Flow

The library employs an opinionated approach to error isolation and conditional flow, utilizing try-catch blocks and predicate-based branching to avoid the nested complexity of traditional procedural code.

#### Fault-Tolerant Operations

These methods wrap execution in internal `try-catch` blocks. If an operation fails, they can either trigger a recovery callback or force a transition to a static fallback value.

* **`tryModify` (`._t`, `.$t`)**: Maps an input to a result. If the transformation throws, the library executes a fallback (if provided) or assigns the recovery value to the internal state.
* **`tryMutate` (`._tm`, `.$tm`)**: Designed for side-effect-heavy tasks (e.g., buffer manipulation, DB rollbacks). It captures errors during execution to perform cleanup, such as zeroing sensitive buffers, without altering the underlying data flow.

```javascript
// Example: Safe API recovery
chain_(rawInput)
  ._t(JSON.parse, (err, raw) => ({ error: true, raw })) // Intercept and handle parsing failure
  ._p(result => result.error ? defaultData : result)    // Resume chain
  ._o();

```

#### Branching & Early Exit

These methods provide mechanism for conditional execution and short-circuiting to keep the pipeline linear.

* **`tapWhen` (`._w`, `.$w`)**: Conditional side-effect execution. If the predicate returns `true`, the callback executes. The pipeline continues regardless of whether the predicate passed.
* **`exitWhen` (`._x`, `.$x`)**: The short-circuit mechanism. If the predicate condition is met, the instance returns a `SilentPipe`—a minimal, non-functional wrapper that discards all subsequent method calls, effectively terminating the chain with the current value.

```javascript
// Example: Short-circuiting the pipeline
chain_(input)
  ._x(d => !d.isValid, () => "ABORTED") // Terminates chain here if invalid
  ._p(d => heavyLogic(d))               // Skipped if exitWhen triggered
  ._o();

```

<br />

### The Termination Routine

The `.out()` method serves as the final step of the chain, acting as a mandatory cleanup and exit point for the internal state.

```javascript
// Signature: .out(fallbackValue?, shouldLock=true)

const result = pipe.out("fallback", true);
console.log(pipe.isLocked()); // true
```

* **Fallback Logic**: Returns the provided `fallbackValue` if the internal state evaluates to `undefined`, effectively handling empty results.
* **State Disposal**: Performs a destructive update to the internal private variable, stripping the instance of its previous data.
* **Lifecycle Locking**: Invokes `Object.freeze()` on the instance, rendering the container immutable and preventing any further method invocations on that specific pipeline.

<br />

### Shortcut one-liner

It is possible to achieve a functional code with almost no `const`, `let`, or `var`.

<br />

**Before (Imperative):**

```javascript
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
function encryptMsg(algo, data, key, iv) {
  return chain_([algo, key, iv])
    ._p(a => crypto.createCipheriv(...a))                // Create cipher
    ._p(c => Buffer.concat([c.update(data), c.final()])) // Process data
    ._m(() => zeroBuf(key, iv))                          // Cleanup & return
    .out();
}
```

<br />

**Visual comparison to TC39 (Hack-style pipes):**

```javascript
function encryptMsg(algo, data, key, iv) {
  return [algo, key, iv]
    |> crypto.createCipheriv(...%) 
    |> Buffer.concat([%.update(data), %.final()])
    |> (key.fill(0), iv.fill(0), %)
}
```

<br />
<br />
<br />

### 🧩 Technical Implementation Reference

This table outlines the API for this library, which utilizes an opinionated, stateful container design that is heavily reliant on internal object references and side-effect management.

| Method | Shorthand | Strategy | Behavioral Notes |
| --- | --- | --- | --- |
| **`modify`** | `_p`, `$p` | Functional Map | Replaces internal state with the result of the callback. Requires explicit return value. |
| **`mutate`** | `_m`, `$m` | In-place Effect | Ignores the return value of the callback. Strictly for modifying existing references. |
| **`tryModify`** | `_t`, `$t` | Error-Bound Map | Maps to a fallback value or execution if the primary transformation throws an exception. |
| **`tryMutate`** | `_tm`, `$tm` | Error-Bound Effect | Similar to `mutate` but catches exceptions to run a recovery function or assign a fallback value. |
| **`tapWhen`** | `_w`, `$w` | Conditional Logic | Executes only if the predicate matches. Does not necessarily transform data. |
| **`exitWhen`** | `_x`, `$x` | Short-Circuit | Returns a `SilentPipe` instance upon success, effectively terminating all future operations. |
| **`alterValue`** | `_al`, `$al` | Path-based Set | Performs direct key assignment or deep-property traversal using string-based dot notation. |
| **`out`** | `_o`, `$o` | Finalization | Resolves the final value and enforces an internal `Object.freeze` (default) to terminate usage. |
| **`isLocked`** | `_l`, `$l` | Status Check | Returns the `Object.isFrozen` status of the internal pipe instance. |

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

<br />
<br />
<br />
<br />