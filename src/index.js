/**
 * Copyright 2026 Aries Harbinger
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file Optimized utility for functional chaining and data transformation.
 * @summary Lightweight, high-performance, zero-dependency, hardened polyfill for the TC39 Pipeline Operator.
 * @author Aries Harbinger
 * @license Apache-2.0
 */

/**
 * @callback ModifyCallback
 * @description A transformation function executed within the execution pipeline.
 * @template T - The expected type of the incoming value.
 * @template R - The expected type of the returned value.
 * @param {T} value - The current internal value held by the pipeline.
 * @param {Pipe} ctx - The current Pipe instance context.
 * @returns {R} The newly transformed value.
 */

/**
 * @callback PredicateCallback
 * @description A predicate condition check used to evaluate or validate pipeline state.
 * @template T - The expected type of the value being validated.
 * @param {T} value - The current internal value held by the pipeline.
 * @param {Pipe} ctx - The current Pipe instance context, allowing access to container utilities and configuration toggles.
 * @returns {boolean} Returns true if the condition satisfies the predicate, false otherwise.
 */

/**
 * A dedicated collection of structural macros, short-hands, and rapid-fire aliases
 * automatically injected into the {@link Pipe} and {@link SilentPipe} instance prototype chains at runtime.
 * @interface PipeAliases
 * @property {function(boolean=): Pipe} togw - Alias for {@link Pipe#toggleIsWipe}
 * @property {function(boolean=): Pipe} togh - Alias for {@link Pipe#toggleIsHighPerformance}
 * @property {function(any): Pipe} _s - Alias for {@link Pipe#set}
 * @property {function(any): Pipe} $s - Alias for {@link Pipe#set}
 * @property {function(boolean=): Pipe} _rs - Alias for {@link Pipe#reset}
 * @property {function(boolean=): Pipe} $rs - Alias for {@link Pipe#reset}
 * @property {function(function(any, Pipe): any): Pipe} _p - Alias for {@link Pipe#modify}
 * @property {function(function(any, Pipe): any): Pipe} $p - Alias for {@link Pipe#modify}
 * @property {function(function(any, Pipe): void): Pipe} _m - Alias for {@link Pipe#mutate}
 * @property {function(function(any, Pipe): void): Pipe} $m - Alias for {@link Pipe#mutate}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=): Pipe} _tp - Alias for {@link Pipe#tryModify}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=): Pipe} $tp - Alias for {@link Pipe#tryModify}
 * @property {function(function(any, Pipe): void, (any|function(Error, any, Pipe): any)=): Pipe} _tm - Alias for {@link Pipe#tryMutate}
 * @property {function(function(any, Pipe): void, (any|function(Error, any, Pipe): any)=): Pipe} $tm - Alias for {@link Pipe#tryMutate}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): any): Pipe} _wp - Alias for {@link Pipe#modifyWhen}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): any): Pipe} $wp - Alias for {@link Pipe#modifyWhen}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): void): Pipe} _wc - Alias for {@link Pipe#tapWhen}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): void): Pipe} $wc - Alias for {@link Pipe#tapWhen}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): any): (Pipe|SilentPipe)} _wx - Alias for {@link Pipe#exitWhen}
 * @property {function(function(any, Pipe): boolean, function(any, Pipe): any): (Pipe|SilentPipe)} $wx - Alias for {@link Pipe#exitWhen}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=, boolean=): (Pipe|SilentPipe)} _xe - Alias for {@link Pipe#exitErr}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=, boolean=): (Pipe|SilentPipe)} $xe - Alias for {@link Pipe#exitErr}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=, boolean=): Pipe} _ce - Alias for {@link Pipe#catchErr}
 * @property {function(function(any, Pipe): any, (any|function(Error, any, Pipe): any)=, boolean=): Pipe} $ce - Alias for {@link Pipe#catchErr}
 * @property {function((string|Array<string|number>), (any|function(any): any), boolean?, (any|function(Error, any, Pipe): any)?): Pipe} _a - Alias for {@link Pipe#alterValue}
 * @property {function((string|Array<string|number>), (any|function(any): any), boolean?, (any|function(Error, any, Pipe): any)?): Pipe} $a - Alias for {@link Pipe#alterValue}
 * @property {function((any|function(): any)=, boolean=): any} _o - Alias for {@link Pipe#out}
 * @property {function((any|function(): any)=, boolean=): any} $o - Alias for {@link Pipe#out}
 * @property {function(): boolean} _l - Alias for {@link Pipe#isLocked}
 * @property {function(): boolean} $l - Alias for {@link Pipe#isLocked}
 * @readonly
 */
const PipeAliases = Object.freeze({
    // Config toggles
    togw: 'toggleIsWipe',
    togh: 'toggleIsHighPerformance',

    // Core operations
    _s: 'set',     $s: 'set',
    _rs: 'reset',  $rs: 'reset',

    // Functional transforms
    _p: 'modify',   $p: 'modify',
    _m: 'mutate',   $m: 'mutate',

    // Safe / Try variants
    _tp: 'tryModify',   $tp: 'tryModify',
    _tm: 'tryMutate',   $tm: 'tryMutate',

    // Conditional
    _wp: 'modifyWhen',  $wp: 'modifyWhen',
    _wc: 'tapWhen',     $wc: 'tapWhen',
    _wx: 'exitWhen',    $wx: 'exitWhen',

    // Error handling
    _xe: 'exitErr',     $xe: 'exitErr',
    _ce: 'catchErr',    $ce: 'catchErr',

    // Deep property alteration
    _a: 'alterValue',   $a: 'alterValue',

    // Output & state
    _o: 'out',          $o: 'out',
    _l: 'isLocked',     $l: 'isLocked'
});

import { isDeepStrictEqual, types } from 'node:util';
import { timingSafeEqual } from 'node:crypto';

/**
 * A reference to the prototype of an async function instance.
 * Used to determine if a function is natively asynchronous by comparing prototypes.
 * @internal
 * @ignore
 * @category Utility
 */
const AsyncFunctionProto = Object.getPrototypeOf(async () => {});


/**
 * Evaluates whether a given input is a function.
 * @param val - The target value to evaluate.
 * @returns `true` if the target value evaluates to a function, `false` otherwise.
 * @internal
 * @ignore
 * @category Validation
 */
const isFunction = (val) => typeof val === 'function';


/**
 * Performs a constant-time byte-array comparison loop.
 * @remarks
 * While Node.js `crypto.timingSafeEqual` is used for standard buffers, it cannot be
 * used here because `Buffer.from()` throws when wrapping `SharedArrayBuffer` allocations.
 * This manual fallback ensures a leak-free, constant-time comparison specifically for SABs.
 * @param viewA - The first TypedArray (typically Uint8Array) to compare. Do not pass DataView.
 * @param viewB - The second TypedArray (typically Uint8Array) to compare. Do not pass DataView.
 * @param length - The number of bytes to compare.
 * @returns `true` if all bytes match, `false` otherwise.
 * @internal
 * @ignore
 * @category Security
 */
const manualTimingSafeEqual = (viewA, viewB, length) => {
    let mismatch = 0;
    for (let i = 0; i < length; i++) {
        mismatch |= viewA[i] ^ viewB[i];
    }
    return mismatch === 0;
};


/**
 * Determines whether a given function is explicitly defined as a native async function.
 * @remarks
 * This function specifically checks if the function's prototype matches the native
 * `AsyncFunction` prototype. Note that regular functions returning a `Promise`
 * will return `false`; it only detects functions declared with the `async` keyword.
 * @param {unknown} fn - The function to check.
 * @returns {boolean} `true` if the function is a native async function, otherwise `false`.
 * @public
 * @category Utilities
 * @example
 * const syncFn = () => "hello";
 * const asyncFn = async () => "world";
 * isAsync(syncFn);  // false
 * isAsync(asyncFn); // true
 */
const isAsync = (fn) => (isFunction(fn) && Object.getPrototypeOf(fn) === AsyncFunctionProto);


/**
 * Normalizes any function (sync or async) into an asynchronous function.
 * @remarks
 * - If the input is already a native async function, it is returned as-is.
 * - If the input is a synchronous function, it is wrapped in an async execution context.
 * **Note:** This safely intercepts any synchronous errors thrown by the underlying
 * function and converts them into a rejected Promise.
 * - If the input is not a function, `undefined` is returned.
 * @template {(...args: any[]) => any} T
 * @param {T} fn - The target function to normalize.
 * @returns {((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) | undefined}
 * An asynchronous function wrapper that always yields a `Promise`, or `undefined` if the input is invalid.
 * @public
 * @category Utilities
 * @example
 * const syncLog = (msg) => console.log(msg);
 * const asyncLog = toAsync(syncLog);
 * if (asyncLog) await asyncLog("Hello World"); // Resolves as a Promise
 * 
 * // Error Handling Example:
 * const throwingSyncFn = () => { throw new Error("Oops!"); };
 * const asyncFn = toAsync(throwingSyncFn);
 * 
 * // Even though the source function is synchronous, the error is caught as a Promise rejection
 * await asyncFn().catch(err => console.error(err.message)); // Logs: "Oops!"
 */

const toAsync = (fn) => {
    if (!isFunction(fn)) return (void 0);
    if (isAsync(fn)) return fn;

    // Return a new async wrapper which catches synchronous errors as promise rejections
    return async (...args) => fn(...args);
};


/**
 * An asynchronous try-catch-finally wrapper for streamlined control flow.
 * @remarks
 * - Seamlessly handles both synchronous and asynchronous functions by safely awaiting execution blocks.
 * - Guarantees sequential, chronological execution of error hooks (`cb_err`) and finalizers (`cb_last`).
 * @template T - The expected resolve type of the primary logic function.
 * @template E - The expected error type caught in the catch block. Defaults to `unknown`.
 * @template R - The return type of the error callback function (recovery value).
 * @param {() => Promise<T> | T} logic - The core function to execute safely. Can be synchronous or asynchronous.
 * @param {(err: E, partialResult: undefined) => R | Promise<R>} [cb_err] - Optional error callback. Note: `partialResult` will always be `undefined` because if `logic` throws, its assignment never completes.
 * @param {(result: T | undefined) => void | Promise<void>} [cb_last] - Optional finalizer callback (runs like a `finally` block). Receives the successful result `T` from `logic`, or `undefined` if `logic` threw an exception (even if `cb_err` recovers a value).
 * @param {boolean} [isThrow=true] - If `true`, re-throws the caught error after executing all callbacks.
 * @returns {Promise<T | R | undefined>} A promise that resolves to:
 * - The result of `logic` (`T`) on success.
 * - The fallback result of `cb_err` (`R`) if an error was caught and handled.
 * - `undefined` if an error occurred, `isThrow` is false, and no `cb_err` handler was provided.
 * @throws {TypeError} If the provided `logic` argument is not an invocable function.
 * @throws {E} Re-throws the original caught error if `isThrow` is true and an exception occurs.
 * @public
 * @category Utilities
 * @example
 * const data = await wrapTry(
 *     async () => await fetchUser(1),
 *     (err) => {
 *         console.error("Failed to fetch:", err);
 *         return { guest: true }; // Fallback value (Type R)
 *     },
 *     (primaryResult) => console.log("Operation finished. Was successful:", !!primaryResult),
 *     false
 * );
 */
const wrapTry = async (logic, cb_err, cb_last, isThrow = true) => {
    let caughtError = null;
    let d, c;

    try {
        if (typeof logic !== 'function') throw new TypeError('wrapTry expected an executable function for the core execution block');
        d = await logic();
    }

    catch (e) {
        caughtError = e;
        if (cb_err) c = await cb_err(e, d);
    }

    if (cb_last) await cb_last(d);

    if (caughtError && isThrow) throw caughtError;
    return caughtError ? c : d;
};


/**
 * Synchronous try-catch wrapper for clean flow control.
 * @remarks
 * **CRITICAL:** This utility executes purely synchronously. All provided callbacks (`cb_err`, `cb_last`)
 * **must** be synchronous routines. If asynchronous functions or Promise-returning actions are provided,
 * they will fire background tasks, but the wrapper will return immediately without waiting for them to complete.
 * @template T - The return type of the main synchronous logic function.
 * @template E - The expected error type caught in the catch block. Defaults to `unknown`.
 * @template R - The return type of the error callback function.
 * @param {() => T} logic - The core synchronous function to execute. Must satisfy `isFunction` check.
 * @param {(err: E) => R} [cb_err] - Optional synchronous error callback.
 * @param {(result: T | undefined) => void} [cb_last] - Optional synchronous finalizer callback. Receives the successful result `T`, or `undefined` if execution failed.
 * @param {boolean} [isThrow=true] - If `true`, re-throws the caught error after executing callbacks.
 * @returns {T | R | undefined} The result of `logic` on success, the result of `cb_err` on failure, or `undefined` if a failure occurs and no error callback is provided.
 * @throws {TypeError} If the provided `logic` argument fails the `isFunction` validation check.
 * @throws {E} Re-throws the original caught error if `isThrow` is true and an exception occurs during execution.
 * @public
 * @category Utilities
 * @example
 * const result = wrapTrySync(
 *     () => JSON.parse(configString),
 *     (err) => ({ fallback: true }),
 *     () => console.log("Sync parsing attempted"),
 *     false
 * );
 */
const wrapTrySync = (logic, cb_err, cb_last, isThrow = true) => {
    let caughtError = null;
    let d, c;

    try {
        if (!isFunction(logic)) throw new TypeError('wrapTrySync expected a function for the core execution block');
        d = logic();
    }

    catch (e) {
        caughtError = e;
        c = cb_err?.(e);
    }

    cb_last?.(d);

    if (caughtError && isThrow) throw caughtError;
    return caughtError ? c : d;
};


/**
 * Overwrites the contents of arbitrary binary data containers with zeroes.
 * Wraps target buffers in a Uint8Array window to safely purge data footprints.
 * Supports typed array views, DataViews, standard ArrayBuffers, SharedArrayBuffers,
 * and custom buffer-like objects with a `.fill()` method.
 * @note This function safely swallows internal errors (e.g., if a buffer is detached,
 * transferred, or frozen) to prevent cleanup routines from crashing the application.
 * @param {...any} args - Multi-argument list of values targeted for clean erasure.
 * @returns {null} Always returns `null`.
 */
const zeroBuf = (...args) => {
    for (const buf of args) {
        if (!buf) continue;

        try {
            if (ArrayBuffer.isView(buf)) {
                new Uint8Array(
                    buf.buffer,
                    buf.byteOffset ?? 0,
                    buf.byteLength ?? buf.buffer?.byteLength ?? 0
                ).fill(0);
            }

            else if (types.isAnyArrayBuffer(buf)) {
                new Uint8Array(buf).fill(0);
            }

            else if (typeof buf?.fill === 'function') {
                buf.fill(0);
            }
        }
        catch (err) { } // Ignored - Some buffers may be detached, transferred, or frozen
    }

    return null;
};


/**
 * Performs a deep strict comparison between two arbitrary values, utilizing optimized
 * constant-time paths for matched binary data containers.
 * @remarks
 * Features:
 * - Uses constant-time evaluation (`timingSafeEqual`) for binary data *only* if data lengths,
 * constructors, and binary view variants match perfectly.
 * - Structural, constructor, and length mismatches will short-circuit early (not timing-safe against layout discovery).
 * - **Note on Primitives:** Mixes of primitive values and their boxed object variants (e.g., `"str"` vs `new String("str")`)
 * will safely bypass early optimization filters and correctly evaluate to `false` via the C++ validation fallback.
 * - Leverages Node.js's native C++ `isDeepStrictEqual` core as a fallback for complex object graphs.
 * @param {unknown} a - The primary input value to compare.
 * @param {unknown} b - The secondary input value to compare against.
 * @returns {boolean} `true` if both targets are structurally, prototypically, and semantically identical; otherwise `false`.
 * @public
 * @category Utilities
 */
const compareVal = (a, b) => {
    // Fast Paths & Reference Check
    if (a == null || b == null) return a === b;
    if (Object.is(a, b)) return true;
    if (typeof a === 'function' && typeof b === 'function') return false;

    // Constructor and prototype verification
    if (
        true === wrapTrySync(() => a.constructor !== b.constructor, null, null, false)
        || true === wrapTrySync(() => Object.getPrototypeOf(a) !== Object.getPrototypeOf(b), null, null, false)
    ) return false;

    // Hardened Binary & View Processing
    const isViewA = ArrayBuffer.isView(a);
    const isViewB = ArrayBuffer.isView(b);
    const isBufA = types.isAnyArrayBuffer(a);
    const isBufB = types.isAnyArrayBuffer(b);

    if ((isViewA || isBufA) && (isViewB || isBufB)) {
        const binaryMatch = wrapTrySync(() => {
            // Strictly fail if comparing a raw buffer to a view window layout
            if (isViewA !== isViewB || isBufA !== isBufB) return false;

            const lenA = a.byteLength;
            const lenB = b.byteLength;
            if (lenA !== lenB) return false;
            if (lenA <= 0) return true;

            const rawA = isViewA ? a.buffer : a;
            const rawB = isViewB ? b.buffer : b;
            const offsetA = isViewA ? a.byteOffset : 0;
            const offsetB = isViewB ? b.byteOffset : 0;

            if (types.isSharedArrayBuffer(rawA) || types.isSharedArrayBuffer(rawB))
                return manualTimingSafeEqual(
                    new Uint8Array(rawA, offsetA, lenA),
                    new Uint8Array(rawB, offsetB, lenB),
                    lenA
                );

            return timingSafeEqual(
                Buffer.from(rawA, offsetA, lenA),
                Buffer.from(rawB, offsetB, lenB)
            );
        }, null, null, false);

        if (binaryMatch !== void 0) return binaryMatch;
    }

    // Fall through to C++ Core for Maps, Sets, Errors, Objects, and Boxed Primitives
    return isDeepStrictEqual(a, b);
};


/**
 * A "Silent" empty shell version of a functional pipeline that discards all
 * downstream transformations while maintaining fluid chainability.
 * Typically utilized for safe short-circuiting of execution chains via conditional exits.
 * @class SilentPipe
 * @public
 */
class SilentPipe {
    /**
     * The internal encapsulated state value carried through the silent pipeline.
     * @private
     */
    #value;

    /**
     * Asserts that the instance has not been permanently locked by a terminal extraction.
     * @private
     * @throws {TypeError} If the pipeline context has been explicitly frozen.
     */
    #assertActive() {
        if (Object.isFrozen(this)) throw new TypeError('[modify-js] Cannot execute operations on a locked SilentPipe instance.');
    }

    /**
     * Instantiates an isolated silent pipeline context wrapped in a dynamic Proxy.
     * @param {*} val - The final terminal value captured before short-circuiting.
     */
    constructor(val) {
        this.#value = val;

        const proxy = new Proxy(this, {
            get(target, prop, receiver) {
                const isFrozen = Object.isFrozen(target);

                // Handle properties explicitly declared on the prototype chain
                if (prop in target.constructor.prototype) {
                    if (isFrozen) {
                        if (['isLocked', '_l', '$l'].includes(prop)) return () => true;
                        throw new TypeError('[modify-js] Cannot execute operations on a locked SilentPipe instance.');
                    }

                    // Bind functions correctly to the proxy receiver
                    const value = target.constructor.prototype[prop];
                    return typeof value === 'function' ? value.bind(target) : value;
                }

                // Strictly satisfy Proxy Invariants
                // If the object is frozen, we must not return intercept wrappers
                if (isFrozen) return Reflect.get(target, prop, receiver);

                // Returns a wrapper executing as a chainable channel
                return (..._args) => proxy;
            }
        });

        return proxy;
    }

    /**
     * Materializes and extracts the encapsulated value, terminating the chain execution.
     * Optionally freezes the target container permanently post-extraction.
     * @param {*|function(): *} [def] - Fallback value or function applied if internal state is undefined.
     * @param {boolean} [lock=true] - Flags whether the instance must be frozen post-extraction.
     * @returns {*} The extracted state or the provided fallback default value.
     */
    out(def, lock = true) {
        this.#assertActive();
        try     { return this.#value === void 0 ? (typeof def === 'function' ? def() : def) : this.#value; }
        finally { this.#value = void 0; if (lock) Object.freeze(this); }
    }

    /**
     * Checks if the silent pipeline instance has been frozen.
     * @returns {boolean} True if the instance is locked, false otherwise.
     */
    isLocked() { return Object.isFrozen(this); }
}


/**
 * A stateful container for executing functional transformation pipelines.
 * Provides memory safety (optional buffer zeroing) and performance configurations.
 * @class Pipe
 * @public
 * @category Core
 */
class Pipe {
    /**
     * Flag governing whether previous binary buffer state sequences (such as `ArrayBuffer`
     * or `TypedArray` views) must be systematically scrubbed via zero-filling during assignments.
     * @type {boolean}
     * @private
     */
    #isWipe;

    /**
     * Flag governing whether deep state value comparison checks should be bypassed
     * in favor of low-latency calculations, skipping expensive object graph traversals.
     * @type {boolean}
     * @private
     */
    #isHighPerformance;

    /**
     * The internal encapsulated state value carried and transformed through the execution pipeline.
     * @type {*}
     * @private
     */
    #value;


    /**
     * Core internal state mutation engine. Mutates the pipeline's internal value context
     * if the incoming value is valid and structurally distinct from the current state.
     * @remarks
     * **Memory & Reference Isolation:** If `#isWipe` is active and a structural data transition occurs, the previous state's
     * memory allocation is proactively wiped clean via {@link zeroBuf} prior to assignment.
     * *Caveat:* If a mutable reference (e.g., an Object, Array, or ArrayBuffer) is mutated
     * in-place and passed back directly into this engine, the fast-path checks inside
     * `compareVal` will match identities (`Object.is(a, b) === true`). As a result,
     * the mutation block and its corresponding memory scrub are skipped.
     * To enforce an absolute memory purge on complex types, ensure clean allocations are
     * returned or activate High-Performance mode.
     * @template V - The type of the value to commit to the pipeline.
     * @template F - The fallback type if an alternate pipeline termination value is supplied.
     * @param {V} val - The incoming payload candidate targeted for state registration.
     * @param {F} [fallback] - An optional value or reference that overrides the fluent interface chain return.
     * @returns {F | this} The explicit fallback target if provided; otherwise, the current `Pipe` instance for chaining.
     * @private
     */
    #define(val, fallback) {
        if (val === void 0) return fallback ?? this;

        // Commit the change if low-latency throughput is enabled or if deep checks verify structural differences
        if (this.#isHighPerformance || !compareVal(this.#value, val)) {
            this.#isWipe && zeroBuf(this.#value);
            this.#value = val;
        }
        return fallback ?? this;
    }

    /**
     * Structural pipeline integrity and execution guard.
     * Verifies the instance state against permanent locks and enforces interface type constraints on operands.
     * @remarks
     * Implements defensive short-circuiting to capture dead or frozen contexts early. It checks parameter
     * availability via arguments length tracking to remain transparent to missing or optional configuration calls.
     * @param {unknown} [val] - An optional operand candidate (typically a callback) to evaluate as an executable function.
     * @throws {TypeError} If the current `Pipe` instance has been structurally frozen post-extraction.
     * @throws {TypeError} If an input parameter is present but fails the `isFunction` primitive verification.
     * @private
     */
    #checkInstance(val) {
        if (Object.isFrozen(this))
            throw new TypeError('[modify-js] Cannot execute operations on a locked Pipe instance.');
        if (arguments.length > 0 && val !== void 0 && !isFunction(val))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof val}`);
    }

    /**
     * Error handling supervisor for protected functional operations.
     * Evaluates error-trapping states and forces safe teardowns if recovery routines are missing.
     * @remarks
     * If an operation throws an exception and no fallback recovery parameter is configured, this
     * method triggers an automatic cleanup phase by calling `.out()`. This purges active internal variables
     * and permanently locks the instance container before letting the error bubble up. This prevents
     * data leaks if an operational sequence crashes midway.
     * @param {unknown} fallback - The raw fallback value or recovery method supplied to the wrapper handler.
     * @param {Error} err - The runtime exception intercepted during pipeline execution.
     * @throws {Error} Re-throws the original runtime exception if the fallback variable evaluates to undefined.
     * @private
     */
    #checkFallback(fallback, err) {
        if (fallback !== void 0) return;
        this.out();
        throw err;
    }


    /**
     * Instantiates an isolated execution pipeline context with an initial state and configuration parameters.
     * @param {* | (() => *)} val - The initial data payload or a factory function returning the value to seed the pipeline state.
     * @param {boolean | object} [opts=false] - Configuration options. If passed as a boolean, toggles data-wiping policies.
     * If passed as an object, maps deeper configuration parameters.
     * @param {boolean} [opts.isWipe=false] - When true, securely zeroes binary buffers in memory upon replacement or disposal.
     * @param {boolean} [opts.isHighPerformance=false] - When true, bypasses deep strict data equality validations to optimize throughput.
     * @example
     * // Initialize with standard primitive state
     * const pipeline = new Pipe("initial_state");
     * 
     * // Initialize using a lazy factory loader with deep wiping and speed optimizations enabled
     * const securePipeline = new Pipe(() => crypto.randomBytes(32), {
     *     isWipe: true,
     *     isHighPerformance: true
     * });
     */
    constructor(val, opts) {
        const config = typeof opts === 'boolean' ? { isWipe: opts } : (opts ?? {});
        const { isWipe = false, isHighPerformance = false } = config;
        this.#isWipe = !!isWipe;
        this.#isHighPerformance = !!isHighPerformance;
        this.#define(isFunction(val) ? val() : val);
    }


    /**
     * Configures or flips the automated binary buffer secure memory wiping policy mid-chain.
     * @param {boolean} [isWipe] - Explicit toggle directive. If omitted, the runtime flips the current boolean flag value.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @example
     * chain_(sensitiveBuffer)
     *     .toggleIsWipe(true)  // Ensure wiping is active for subsequent mutation operations
     *     ._p((buf) => processCrypto(buf))
     *     .toggleIsWipe();     // Inverts the state back to false if it was true
     */
    toggleIsWipe(isWipe) {
        this.#checkInstance();
        this.#isWipe = (typeof isWipe === 'boolean') ? isWipe : !this.#isWipe;
        return this;
    }


    /**
     * Configures or flips the high-performance optimization flag mid-chain.
     * @param {boolean} [isHighPerformance] - Explicit toggle directive. If omitted, the runtime flips the current boolean flag value.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @example
     * chain_(largeDataset)
     *     .toggleIsHighPerformance(true) // Bypass heavy deep comparison scans for rapid transitions
     *     ._p((data) => modifyLargeGraph(data));
     */
    toggleIsHighPerformance(isHighPerformance) {
        this.#checkInstance();
        this.#isHighPerformance = (typeof isHighPerformance === 'boolean') ? isHighPerformance : !this.#isHighPerformance;
        return this;
    }


    /**
     * Explicitly overwrites the pipeline's internal state value wrapper with an absolute value assignment.
     * @template V - The type of the value to commit to the pipeline.
     * @param {V} val - The target payload value to forcefully register into the active state context.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @example
     * chain_("initial value")
     *     .set("completely new value")
     *     ._p(val => val.toUpperCase());
     */
    set(val) { return (this.#checkInstance(), this.#define(val)); }


    /**
     * Resets the active pipeline state back to `undefined`.
     * @remarks
     * If `isWipe` is true, it performs a secure overwrite of the current state reference
     * using {@link zeroBuf} before flushing the state to `undefined`.
     * @param {boolean} [isWipe=true] - Forces the memory scrubbing behavior for this operation.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @example
     * chain_(authTokens)
     *     .reset(true) // Cleans existing buffers with zeroes and flushes state safely to undefined
     *     .set(newTokens);
     */
    reset(isWipe = true) {
        this.#checkInstance();
        !!isWipe && zeroBuf(this.#value);
        this.#value = void 0;
        return this;
    }


    /**
     * Transforms the current internal state value by executing a mapping function.
     * The return value of the callback becomes the new internal state of the pipeline.
     * @template T - The current state type.
     * @template R - The expected return type of the transformation function.
     * @param {ModifyCallback<T, R>} fn - The transformation callback.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked or if `fn` is invalid.
     * @example
     * chain_({ count: 1 })
     *     .modify(state => ({ count: state.count + 1 }))
     *     .$p(state => state.count) // Short-hand alias example
     *     .out(); // 2
     */
    modify(fn) { return (this.#checkInstance(fn), this.#define(fn(this.#value, this)), this); }


    /**
     * Executes a callback function to perform an in-place mutation on the current state.
     * @remarks
     * **Security Note:** This method bypasses the `#define` memory-wiping engine.
     * If mutating binary buffers (e.g., `Uint8Array`) in-place, the pipeline cannot
     * track these changes for future automated wiping. Use `modify()` for tracked changes.
     * @param {(value: *, ctx: this) => void} fn - The mutation callback.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked or if `fn` is invalid.
     * @example
     * chain_([1, 2, 3])
     *     .mutate(arr => arr.push(4)) // Mutates the underlying array reference directly
     *     .out(); // [1, 2, 3, 4]
     */
    mutate(fn) { return (this.#checkInstance(fn), fn(this.#value, this), this); }


    /**
     * Attempts to transform the pipeline state via a mapping function, safely trapping exceptions via an optional fallback.
     * @remarks
     * If an error occurs and no fallback is provided, the exception is re-thrown.
     * If a fallback function is provided, its execution return value becomes the new committed state of the pipeline.
     * If a raw value fallback is passed, it breaks the pipeline chain and returns that raw value outcome directly.
     * @template R - The expected return type of a successful transformation callback.
     * @template F - The fallback value type, or the return type of the fallback recovery callback.
     * @param {ModifyCallback<*, R>} fn - The target transformation callback to attempt safely.
     * @param {F | ((err: Error, partialResult: *, ctx: this) => F)} [fallback] - An optional raw fallback state or a recovery function invoked if execution fails.
     * @returns {this | F} The current Pipe instance for chaining, or the explicit fallback termination override.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If the provided `fn` argument is not a valid function.
     * @throws {Error} Re-throws the original processing exception if no `fallback` argument is configured.
     * @example
     * chain_('{"invalid-json"}')
     *     .tryModify(
     *         str => JSON.parse(str),
     *         (err) => ({ error: true, message: err.message }) // Recovers seamlessly from syntax errors
     *     );
     */
    tryModify(fn, fallback) {
        this.#checkInstance(fn);

        try { return this.#define(fn(this.#value, this)); }

        catch (err) {
            this.#checkFallback(fallback, err);
            return this.#define(isFunction(fallback) ? fallback(err, this.#value, this) : fallback);
        }
    }


    /**
     * Attempts to trigger a side effect or mutation callback on the active state value, trapping internal errors with a fallback mechanism.
     * @remarks
     * Gated execution block for handling fragile mutations. If the core mutation callback throws an exception:
     * - If no fallback is provided, the error is re-thrown.
     * - If a fallback function is provided, it is invoked as an error-handling lifecycle hook.
     * - If a raw value fallback is provided, it acts as an escape-hatch state override, replacing the current pipeline state value entirely.
     * *Note:* Any in-place mutations committed prior to the intercepted crash remain active in memory.
     * @param {(value: *, ctx: this) => void} fn - The target execution mutation block to attempt safely.
     * @param {any} [fallback] - A fallback recovery function or a raw value to forcefully overwrite the pipeline state upon failure.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If the provided `fn` argument is not a valid function.
     * @throws {Error} Re-throws the original processing exception if no `fallback` argument is configured.
     * @example
     * chain_(someDatabaseRecord)
     *     .tryMutate(
     *         (record) => record.saveSync(),
     *         (err) => console.error("Failed to commit side-effect:", err) // Trap error safely
     *     );
     */
    tryMutate(fn, fallback) {
        this.#checkInstance(fn);

        try { fn(this.#value, this); }

        catch (err) {
            this.#checkFallback(fallback, err);
            isFunction(fallback) ? fallback(err, this.#value, this) : this.#define(fallback);
        }

        return this;
    }


    /**
     * Conditionally transforms the pipeline state using a mapping function if a predicate condition passes.
     * @remarks
     * If the predicate evaluates to a falsy state, the transformation callback is entirely bypassed and the
     * pipeline passes its current state value forward down the execution chain unmodified.
     * @template R - The expected return type of the conditional transformation callback.
     * @param {PredicateCallback<*>} predicate - Condition checking evaluation block invoked with the current state.
     * @param {ModifyCallback<*, R>} fn - Transformation mapping block executed only if the predicate condition returns truthy.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If either `predicate` or `fn` are not valid functions.
     * @example
     * chain_(10)
     *     .modifyWhen(
     *         val => val > 5,
     *         val => val * 2 // Evaluates to true, transforms 10 -> 20
     *     )
     *     .modifyWhen(
     *         val => val < 0,
     *         val => val + 100 // Bypassed, 20 remains 20
     *     );
     */
    modifyWhen(predicate, fn) {
        this.#checkInstance(predicate);
        this.#checkInstance(fn);

        if (!!predicate(this.#value, this)) this.#define(fn(this.#value, this));
        return this;
    }


    /**
     * Conditionally executes a side-effect or mutation callback if a predicate condition passes.
     * @remarks
     * The underlying pipeline state remains unchanged regardless of whether the predicate evaluates to
     * a truthy or falsy outcome. This is highly useful for conditional logging or lazy state instrumentation.
     * @param {PredicateCallback<*>} predicate - Condition checking evaluation block invoked with the current state.
     * @param {(value: *, ctx: this) => void} fn - Execution block for side effects, triggered only if the predicate returns truthy.
     * @returns {this} The current Pipe instance for fluid execution chaining.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If either `predicate` or `fn` are not valid functions.
     * @example
     * chain_({ debug: true, data: "payload" })
     *     .tapWhen(
     *         state => state.debug,
     *         state => console.log("Debug trace intercepted:", state.data)
     *     );
     */
    tapWhen(predicate, fn) {
        this.#checkInstance(predicate);
        this.#checkInstance(fn);

        if (!!predicate(this.#value, this)) fn(this.#value, this);
        return this;
    }


    /**
     * Short-circuits the pipeline execution flow by switching to a dynamic no-op container if a predicate condition matches.
     * @remarks
     * When the predicate yields a truthy value, the active `Pipe` extracts its terminal result, executes the fallback transformation mapping,
     * and constructs an active, proxy-backed `SilentPipe` instance containing the result. All downstream steps are absorbed safely
     * without breaking syntax structure.
     * @template R - The expected return type of the short-circuit mapping function.
     * @param {PredicateCallback<*>} predicate - Condition checking evaluation block used to trigger the short-circuit track.
     * @param {ModifyCallback<*, R>} fn - Final evaluation logic returning the value to wrap inside the escaping `SilentPipe`.
     * @returns {this | SilentPipe} The active `Pipe` instance to continue, or a proxy-wrapped `SilentPipe` instance terminating operations.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If either `predicate` or `fn` are not valid functions.
     * @example
     * const finalVal = chain_({ authenticated: false })
     *     .exitWhen(
     *         user => !user.authenticated,
     *         () => "Access Denied Redirect" // Predicate is true, early exit triggered!
     *     )
     *     ._p(user => user.fetchProfileData()) // Bypassed completely by SilentPipe proxy!
     *     .out(); // "Access Denied Redirect"
     */
    exitWhen(predicate, fn) {
        this.#checkInstance(predicate);
        this.#checkInstance(fn);

        if (!predicate(this.#value, this)) return this;

        const mappedValue = fn(this.#value, this);
        this.out(); // Terminate and lock this active chain cleanly
        return new SilentPipe(mappedValue);
    }


    /**
     * Executes an operation and handles exceptions by short-circuiting the chain into a locked `SilentPipe` instance with a recovery state.
     * @remarks
     * If an error occurs during processing, the exception is caught, the original pipeline state is flushed via `.out()`, and the fallback value
     * or callback recovery mapping is encapsulated into a `SilentPipe` proxy. Downstream computations are ignored, retaining the
     * caught error recovery state up to the `.out()` extractor.
     * @template R - The expected return type of a successful function run.
     * @template F - The type of the short-circuit fallback recovery element.
     * @param {ModifyCallback<*, R>} fn - The operational logic block to attempt execution on.
     * @param {F | ((err: Error, partialResult: *, ctx: this) => F)} [fallback] - The absolute recovery value or error resolution mapping.
     * @param {boolean} [isModify=true] - If true, assigns the successful execution result of `fn` as the pipeline's active state.
     * @returns {this | SilentPipe} The running `Pipe` instance, or a short-circuited `SilentPipe` wrapping the error fallback target.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If the provided `fn` argument is not a valid function.
     * @throws {Error} Re-throws the original processing exception if no `fallback` handler is provided.
     * @example
     * chain_("https://malformed-url-target")
     *     .exitErr(
     *         url => performUnsafeNetworkFetch(url),
     *         (err) => ({ failure: true, trace: err.message }) // Escapes error track early
     *     )
     *     ._p(response => response.json()) // Bypassed dynamically if fetch fails
     *     .out();
     */
    exitErr(fn, fallback, isModify = true) {
        this.#checkInstance(fn);

        try {
            const res = fn(this.#value, this);
            if (!!isModify) this.#define(res);
            return this;
        }

        catch (err) {
            this.#checkFallback(fallback, err);

            const res = isFunction(fallback) ? fallback(err, this.#value, this) : fallback;
            const finalRecovery = res === void 0 ? this.#value : res;

            this.out(); // clean and lock this active chain instance
            return new SilentPipe(finalRecovery);
        }
    }


    /**
     * Intercepts errors during an operation, allowing the active line execution to continue via inline recovery maps or state rollbacks.
     * @remarks
     * Unlike `exitErr`, `catchErr` keeps the pipeline execution track **alive**. If the logic fails, it catches the error, rolls back
     * to the state reference before the method invocation, evaluates the inline fallback strategy, and proceeds uninterrupted.
     * **Reference Note:** The rollback mechanism caches the historical state reference value. If the encapsulated state is a mutable
     * collection (Object/Array) and is modified in-place inside `fn` prior to throwing an error, the historical reference will reflect
     * those in-place mutations. Ensure clean copies are returned in volatile operations.
     * @template R - The expected return type of a successful operational calculation block.
     * @template F - The fallback item type to patch state errors with inline.
     * @param {ModifyCallback<*, R>} fn - The target logic block to evaluate safely inside a sandboxed catch framework.
     * @param {F | ((err: Error, rollbackValue: *, ctx: this) => F)} [fallback] - The raw fallback value or recovery function mapping.
     * @param {boolean} [isModify=true] - If true, commits the evaluation or recovery outcomes directly as the active pipeline state.
     * @returns {this} The active Pipe instance continuing down the execution track.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If the provided `fn` argument is not a valid function.
     * @throws {Error} Re-throws the original internal execution exception if no inline fallback is supplied.
     * @example
     * chain_({ currentBalancedFunds: 100 })
     *     .catchErr(
     *         wallet => evaluateVolatileCryptoValues(wallet),
     *         (err, snapshot) => ({ currentBalancedFunds: 0, corrupted: true }) // Recovers inline
     *     )
     *     ._p(wallet => wallet.currentBalancedFunds) // Pipeline is still ALIVE, executes next step!
     *     .out();
     */
    catchErr(fn, fallback, isModify = true) {
        this.#checkInstance(fn);
        const rollbackValue = this.#value;

        try {
            const res = fn(this.#value, this);
            if (!!isModify) this.#define(res);
        }

        catch (err) {
            this.#checkFallback(fallback, err);

            const res = isFunction(fallback) ? fallback(err, rollbackValue, this) : fallback;
            if (!!isModify)
                this.#define(res === void 0 ? rollbackValue : res);
        }

        return this;
    }


    /**
     * Alters a deeply nested object property or specific array/buffer index within the pipeline state.
     * @remarks
     * This method dynamically parses dot-notation strings (e.g., `'profile.assets.id'`) or numeric indexes to
     * traverse and modify target values. It features strict internal security guardrails that detect and
     * block malicious Prototype Pollution payloads targeting `__proto__`, `constructor`, or `prototype`.
     * *Note:* If `isCreateNestedObj` is true, a failure mid-way through a deep traversal path may leave
     * behind partially initialized empty objects `{}` on the original object reference before triggering the fallback.
     * @template V - The type of the value or modifier function being assigned.
     * @template F - The fallback type used to recover state if path traversal or assignment fails.
     * @param {string | number} nameKey - A dot-separated string path representing the object hierarchy trajectory, or a direct numeric index.
     * @param {V | ((currentVal: *) => V)} val - The absolute replacement value, or a modifier callback receiving the existing property value and returning the update.
     * @param {boolean} [isCreateNestedObj=true] - When true, automatically initializes missing path segments as empty object layers `{}`.
     * @param {F | ((err: Error, partialResult: *, ctx: this) => F)} [fallback] - An optional fallback value or error-trapping routine to handle traversal or structural errors.
     * @returns {this | F} The current Pipe instance for fluid execution chaining, or the explicit fallback override value.
     * @throws {TypeError} If the pipeline context has been locked via terminal extraction.
     * @throws {TypeError} If the provided `nameKey` argument is not a valid string or number.
     * @throws {Error} Re-throws the original processing exception if no `fallback` handler is provided.
     * @example
     * // Example 1: Updating flat or nested keys using values or modifiers
     * chain_({ user: { name: "Gabe" } })
     *     .alterValue("user.name", "Gabriel")
     *     .alterValue("user.score", (prev = 0) => prev + 3.33);
     * 
     * // Example 2: Target-altering a collection array index
     * chain_([10, 20, 30])
     *     .alterValue(1, 144); // Updates array index 1 from 20 to 144
     * 
     * // Example 3: Deep auto-instantiation with a graceful catch fallback
     * chain_(null).alterValue("meta.deeply.nested.key", "Hello!", true, (err) => {
     *     console.error("Traversal error bypassed:", err.message);
     *     return { errorState: true };
     * });
     */
    alterValue(nameKey, val, isCreateNestedObj = true, fallback) {
        this.#checkInstance();

        const isStringKey = typeof nameKey === 'string';
        let realCreateObj = isCreateNestedObj;
        let realFallback = fallback;

        if (isCreateNestedObj === void 0) { realCreateObj = true; }

        else if (typeof realCreateObj !== 'boolean') {
            realFallback = isCreateNestedObj;
            realCreateObj = true;
        }

        try {
            if (!isStringKey && typeof nameKey !== 'number')
                throw new TypeError('[modify-js] Invalid nameKey type. Expected string or number.');

            if (isStringKey && (nameKey.includes('__proto__') || nameKey.includes('constructor') || nameKey.includes('prototype')))
                throw new Error('[modify-js] Malicious prototype modification path blocked.');

            const segments = isStringKey ? nameKey.split('.') : [nameKey];
            const lastKey = segments.pop();

            if (realCreateObj && (this.#value == null || typeof this.#value !== 'object'))
                this.#value = {};

            let current = this.#value;

            for (const part of segments) {
                if (current == null || typeof current !== 'object')
                    throw new TypeError(`[modify-js] Cannot traverse path through primitive value.`);

                if (part === '__proto__' || part === 'constructor' || part === 'prototype')
                    throw new Error('[modify-js] Deep malicious prototype modification path blocked.');

                if (!realCreateObj && !(part in current))
                    throw new TypeError(`[modify-js] Strict path traversal failed. Path segment "${part}" does not exist.`);

                if (realCreateObj && (current[part] == null || typeof current[part] !== 'object'))
                    current[part] = {};

                current = current[part];
            }

            if (current == null || typeof current !== 'object')
                throw new TypeError(`[modify-js] Cannot alter property on an uninstantiated or primitive parent state.`);

            if (lastKey === '__proto__' || lastKey === 'constructor' || lastKey === 'prototype')
                throw new Error('[modify-js] Terminal key prototype modification path blocked.');

            const resultVal = isFunction(val) ? val(current[lastKey]) : val;

            this.#isWipe && zeroBuf(current[lastKey]);

            current[lastKey] = resultVal;
            return this;
        }

        catch (err) {
            this.#checkFallback(realFallback, err);

            return this.#define(isFunction(realFallback)
                ? realFallback(err, this.#value, this)
                : realFallback);
        }
    }


    /**
     * Materializes and extracts the encapsulated state value, permanently terminating the pipeline's execution chain.
     * @remarks
     * By default, extracting a value locks the container instance via `Object.freeze` to guarantee pipeline integrity.
     * Once extracted, the internal variable tracking pointer is cleared to decouple the pipeline container from the data payload.
     * *Note:* Wiping security policies (`isWipe`) do not apply to data extracted via `.out()`, as the payload is handed off intact to the calling context.
     * @template T - The current internal state type of the pipeline.
     * @template D - The type of the default fallback value.
     * @param {D | (() => D)} [def] - An optional fallback value or callback function applied if the pipeline's internal state evaluates to `undefined`.
     * @param {boolean} [lock=true] - Flags whether the pipeline instance structure must be permanently frozen post-extraction.
     * @returns {T | D} The finalized, unwrapped pipeline state, or the resolved fallback default value.
     * @throws {TypeError} If the pipeline context has been frozen prior to calling this method.
     * @example
     * // Example 1: Standard extraction with a boolean fallback value (No more bugs!)
     * const isFeatureEnabled = chain_(undefined).out(false); // Safely returns false
     * 
     * // Example 2: Standard extraction without locking the pipeline instance container
     * const data = chain_([1, 2, 3]).out(undefined, false); // def is skipped, lock is turned off safely
     */
    out(def, lock = true) {
        this.#checkInstance();

        try {
            return this.#value === void 0
                ? (isFunction(def) ? def() : def)
                : this.#value;
        }

        finally {
            this.#value = void 0;
            if (!!lock) Object.freeze(this);
        }
    }


    /**
     * Ascertains whether the execution pipeline instance has been permanently frozen and locked out from future state mutations.
     * @returns {boolean} `true` if the instance has undergone data extraction or structural sealing; otherwise `false`.
     * @example
     * const pipeline = chain_([1, 2, 3]);
     * console.log(pipeline.isLocked()); // false
     * pipeline.out();
     * console.log(pipeline.isLocked()); // true
     */
    isLocked() { return Object.isFrozen(this); }
}


/**
 * Structurally seal and alias the pipeline architecture.
 * Safely isolated from minifier scope-mangling and tree-shaking.
 * @ignore
 */
((classes, aliasMap) => {
    wrapTrySync(() => {
        // Inject short-hand and symbol aliases dynamically across all prototypes
        classes.forEach(currentClass => {
            const proto = currentClass?.prototype;
            if (!proto) return;

            Object.entries(aliasMap).forEach(([alias, original]) => {
                if (proto[original] && !proto[alias])
                    proto[alias] = proto[original];
            });
        });

        // Freeze the entire class and its prototypes
        classes.forEach(currentClass => [currentClass, currentClass?.prototype].forEach(_ => (_ && Object.freeze(_))));

    }, null, null, false);

})([Pipe, SilentPipe], PipeAliases);


/**
 * Creates a new Pipe instance to initiate a transformation pipeline.
 * @function chain_
 * @param {any|function(): any} val - The initial value to process. If a function is provided,
 * the Pipe will initialize with the return value of that function execution.
 * @param {boolean|{isWipe?: boolean, isHighPerformance?: boolean}} [opts=false] -
 * Configuration options for automated cleanups and optimized deep mutations.
 * @returns {Pipe} A new initialization wrapper for the active Pipe execution context.
 * @example
 * const result = chain_("   hello world   ")
 *     ._p(s => s.trim())
 *     ._p(s => s.toUpperCase())
 *     .out(); // "HELLO WORLD"
 */
const chain_ = (val, opts) => new Pipe(val, opts);

/**
 * Alias for {@link chain_}.
 * @function chain$
 * @param {any|function(): any} val - The initial value to process.
 * @param {boolean|{isWipe?: boolean, isHighPerformance?: boolean}} [opts=false] - Configuration options.
 * @returns {Pipe} A new initialization wrapper for the active Pipe execution context.
 */
const chain$ = (val, opts) => new Pipe(val, opts);


export {
    isAsync, toAsync, wrapTry, wrapTrySync,
    compareVal, zeroBuf,
    SilentPipe, Pipe, PipeAliases,
    chain_, chain$
};
export default chain_;