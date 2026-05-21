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
 * A transformation function used within the pipeline.
 * @template T, R
 * @callback ModifyCallback
 * @param {T} value - The current value in the pipeline.
 * @returns {R} The transformed value.
 */

/**
 * A predicate validation condition check.
 * @template T
 * @callback PredicateCallback
 * @param {T} value - The current value in the pipeline.
 * @returns {boolean} True if the condition passes, false otherwise.
 */
const __UNDEFINED__ = void 0;

/**
 * Validates whether a value is a function.
 * @param {any} val - The value to check.
 * @returns {boolean} True if the value is a function, false otherwise.
 * @private
 */
const isFunction = (val) => typeof val === 'function';

/**
 * Overwrites buffers/arrays with zeros.
 * @param {...(Buffer|any)} args - Any values, will only wipe the valid ones.
 * @example
 * zeroBuf(buf1, buf2, arr)
 * @returns {void}
 */
export const zeroBuf = (...args) => {
    for (const buf of args) {
        buf?.fill?.(0);
        (buf instanceof ArrayBuffer) &&
            new Uint8Array(buf).fill(0);
    }
};


/**
 * A "Silent" or empty shell version of Pipe that discards all operations.
 * Typically used for short-circuiting chains via exitWhen.
 * @class SilentPipe
 */
export class SilentPipe {
    #value;
    #extracted;
    #cache;

    constructor(val) {
        this.#value = isFunction(val) ? val() : val;
        this.#extracted = false;
    }

    modify() { return this; }
    _p() { return this; }
    $p() { return this; }

    mutate() { return this; }
    _m() { return this; }
    $m() { return this; }

    tryModify() { return this; }
    _t() { return this; }
    $t() { return this; }

    tryMutate() { return this; }
    _tm() { return this; }
    $tm() { return this; }

    tapWhen() { return this; }
    _w() { return this; }
    $w() { return this; }

    exitWhen() { return this; }
    _x() { return this; }
    $x() { return this; }

    alterValue() { return this; }
    _al() { return this; }
    $al() { return this; }

    /**
     * Resolves the captured short-circuit value and freezes the instance.
     * @param {any} [def] - Fallback default value if internal resolution yields undefined.
     * @param {boolean} [lock=true] - Structural signature match for framework parity.
     * @returns {any}
     * @private
     */
    out(def, lock = true) {
        if (this.#extracted) return this.#cache === __UNDEFINED__ ? def : this.#cache;
        try {
            const res = isFunction(this.#value) ? this.#value() : this.#value;
            this.#cache = res === __UNDEFINED__ ? def : res;
            this.#extracted = true;
            return this.#cache;
        }

        finally { lock && Object.freeze((this.#value = __UNDEFINED__, this)); }
    }
    _o(def, lock) { return this.out(def, lock); }
    $o(def, lock) { return this.out(def, lock); }

    isLocked() { return Object.isFrozen(this); }
    _l() { return this.isLocked(); }
    $l() { return this.isLocked(); }
}


/**
 * Represents a secure, stateful container for functional transformations.
 * @class Pipe
 */
export class Pipe {
    /**
     * Whether to include wiping previous values before any replacements.
     * @type {boolean}
     * @private
     */
    #isWipe;

    /**
     * The internal value held by the pipe.
     * @type {any}
     * @private
     */
    #value;

    /**
     * Internal state manager that conditionally updates the wrapped value 
     * and returns the specified fallback or the current Pipe instance.
     * @param {any} val - The potential new value to assign if it is not undefined.
     * @param {any} [fallback] - An optional alternative return value (e.g., a SilentPipe instance).
     * @returns {this|any} The provided fallback if present, otherwise the current Pipe instance for chaining.
     * @private
     */
    #define(val, fallback) {
        if (val !== __UNDEFINED__) 
            this.#value = (this.#isWipe && zeroBuf(this.#value), val);
        return fallback ?? this;
    }

    /**
     * Creates an instance of Pipe.
     * @param {any} val - The initial value to wrap.
     * @param {boolean} [isWipe=false] - Wipe internal value that might
     * be a Buffer, Uint arrays, or ArrayBuffer, before overwriting it
     * with a new value. Can be prone to bugs if you are still handling these values mid-chain.
     */
    constructor(val, isWipe = false) {
        this.#define(isFunction(val) ? val() : val);
        this.#isWipe = !!isWipe;
    }


    /**
     * Passes the internal value through a transformation function.
     * Updates the internal state and returns the same Pipe instance.
     * @method modify
     * @param {ModifyCallback<any, any>} fn - The transformation function to execute.
     * @returns {this} The current Pipe instance for further chaining.
     * @throws {TypeError} If the provided argument is not a function.
     */
    modify(fn) {
        if (Object.isFrozen(this)) return this;
        if (!isFunction(fn))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof fn}`);

        return this.#define(fn(this.#value));
    }

    /**
     * Shorthand alias for {@link modify}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _p(fn) { return this.modify(fn); }

    /**
     * Shorthand alias for {@link modify}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $p(fn) { return this.modify(fn); }


    /**
     * Executes a side-effect or mutation on the internal value without replacing it.
     * The internal value remains the same object/primitive, updated by the callback.
     * @method mutate
     * @param {ModifyCallback<any, any>} fn - The mutation function to execute.
     * @returns {this} The current Pipe instance for further chaining.
     * @throws {TypeError} If the provided argument is not a function.
     */
    mutate(fn) {
        if (Object.isFrozen(this)) return this;
        if (!isFunction(fn))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof fn}`);

        return (fn(this.#value), this);
    }

    /**
     * Shorthand alias for {@link mutate}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _m(fn) { return this.mutate(fn); }

    /**
     * Shorthand alias for {@link mutate}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $m(fn) { return this.mutate(fn); }


    /**
     * Attempts a transformation function. If it throws an error and the fallback is a function, 
     * executes the fallback to resolve a new value. Otherwise, assigns the fallback value directly.
     * @method tryModify
     * @param {ModifyCallback<any, any>} fn - The transformation function to attempt.
     * @param {any|Function} [fallback] - Dynamic recovery function or static fallback value.
     * @returns {this}
     * @throws {TypeError} If the primary argument is not a function.
     */
    tryModify(fn, fallback) {
        if (Object.isFrozen(this)) return this;
        if (!isFunction(fn))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof fn}`);

        try { this.#define(fn(this.#value)); } 

        catch (err) { 
            if (isFunction(fallback)) {
                this.#define(fallback(err, this.#value));
            } 
            else if (__UNDEFINED__ !== fallback) {
                this.#define(fallback);
            }
        }

        return this;
    }

    /**
     * Shorthand alias for {@link tryModify}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _t(fn, fallback) { return this.tryModify(fn, fallback); }

    /**
     * Shorthand alias for {@link tryModify}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $t(fn, fallback) { return this.tryModify(fn, fallback); }


    /**
     * Attempts a mutation or side-effect. If it throws an error and a fallback function is provided,
     * executes the fallback for side-effect recovery. Otherwise, optionally swaps the internal value.
     * @method tryMutate
     * @param {ModifyCallback<any, any>} fn - The mutation function to attempt.
     * @param {any|Function} [fallback] - Recovery error-handling function or optional static swap value.
     * @returns {this}
     * @throws {TypeError} If the primary argument is not a function.
     */
    tryMutate(fn, fallback) {
        if (Object.isFrozen(this)) return this;
        if (!isFunction(fn))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof fn}`);

        try { fn(this.#value); } 

        catch (err) {
            if (isFunction(fallback)) {
                fallback(err, this.#value);
            } 
            else if (fallback !== __UNDEFINED__) {
                this.#define(fallback);
            }
        }

        return this;
    }

    /**
     * Shorthand alias for {@link tryMutate}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _tm(fn, fallback) { return this.tryMutate(fn, fallback); }

    /**
     * Shorthand alias for {@link tryMutate}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $tm(fn, fallback) { return this.tryMutate(fn, fallback); }


    /**
     * Executes a side-effect or transforms the internal value 
     * only if a predicate function evaluates to true.
     * @method tapWhen
     * @param {PredicateCallback<any>} predicate - Condition to check.
     * @param {boolean|ModifyCallback<any, any>} isModify - Can be a boolean flag, or skipped entirely to default to true.
     * @param {ModifyCallback<any, any>} [fn] - The execution function.
     * @returns {this}
     */
    tapWhen(predicate, isModify = true, fn) {
        if (Object.isFrozen(this)) return this;

        // Handle argument shifting if the user skipped the boolean parameter
        let realIsModify = isModify;
        let realFn = fn;
        if (isFunction(isModify)) {
            realIsModify = true;
            realFn = isModify;
        }

        if (!isFunction(predicate) || !isFunction(realFn))
            throw new TypeError('[modify-js] Expected predicate and callback to be functions.');

        if (predicate(this.#value))
            realIsModify
                ? this.#define(realFn(this.#value))
                : realFn(this.#value);

        return this;
    }

    /**
     * Shorthand alias for {@link tapWhen}
     * @param {PredicateCallback<any>} predicate
     * @param {boolean|ModifyCallback<any, any>} [isModify=true]
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _w(predicate, isModify, fn) { return this.tapWhen(predicate, isModify, fn); }

    /**
     * Shorthand alias for {@link tapWhen}
     * @param {PredicateCallback<any>} predicate
     * @param {boolean|ModifyCallback<any, any>} [isModify=true]
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $w(predicate, isModify, fn) { return this.tapWhen(predicate, isModify, fn); }


    /**
     * Executes a transformation predicate. If the condition is met or the result is not undefined, 
     * returns a SilentPipe instance to short-circuit the chain.
     * Supports argument shifting if the boolean flag is omitted.
     * @method exitWhen
     * @param {ModifyCallback<any, any>} fn 
     * @param {boolean|any|Function} [isModify=true] Update internal value, or skipped to act as fallback function.
     * @param {any|Function} [fallback] Optional recovery mechanism if primary execution throws.
     * @returns {SilentPipe|this}
     */
    exitWhen(fn, isModify = true, fallback) {
        if (Object.isFrozen(this)) return this;
        if (!isFunction(fn))
            throw new TypeError(`[modify-js] Expected a function, but received: ${typeof fn}`);

        // Handle argument shifting if the user skipped the boolean parameter
        let realIsModify = isModify;
        let realFallback = fallback;
        if (isFunction(isModify)) {
            realIsModify = true;
            realFallback = isModify;
        }

        try {
            const res = fn(this.#value);
            const exitValue = realIsModify ? res : this.#value;

            realIsModify && this.#define(res);

            this.out(__UNDEFINED__, true);
            return new SilentPipe(() => exitValue);
        }

        catch (err) {
            if (realFallback !== __UNDEFINED__) {
                const tmp = isFunction(realFallback) ? realFallback(err, this.#value) : realFallback;
                const exitValue = realIsModify ? tmp : this.#value;

                realIsModify && this.#define(tmp);

                this.out(__UNDEFINED__, true);
                return new SilentPipe(() => exitValue);
            }
        }

        return this;
    }

    /**
     * Shorthand alias for {@link exitWhen}
     * @param {ModifyCallback<any, any>} fn
     * @param {boolean|any|Function} [isModify=true]
     * @param {any|Function} [fallback]
     * @returns {SilentPipe|this}
     */
    _x(fn, isModify, fallback) { return this.exitWhen(fn, isModify, fallback); }

    /**
     * Shorthand alias for {@link exitWhen}
     * @param {ModifyCallback<any, any>} fn
     * @param {boolean|any|Function} [isModify=true]
     * @param {any|Function} [fallback]
     * @returns {SilentPipe|this}
     */
    $x(fn, isModify, fallback) { return this.exitWhen(fn, isModify, fallback); }


    /**
     * Surgically updates a single property or element inside an object, array, or buffer.
     * Supports dot-notation path traversing for deep object hierarchies and dynamically 
     * supports intermediate object spawning if enabled.
     * @method alterValue
     * @param {string|number} nameKey - The object key string (supporting dot-notation paths like 'a.b.c') or array/buffer index number.
     * @param {any|Function} val - The replacement value or an updater function receiving the current localized property value.
     * @param {boolean|any|Function} [isCreateNestedObj=true] - Flag to enable object generation, or shifted into fallback parameter if function.
     * @param {any|Function} [fallback] - Dynamic recovery function or static fallback value to assign if an operation throws.
     * @returns {this} The current Pipe instance for further chaining.
     */
    alterValue(nameKey, val, isCreateNestedObj = true, fallback) {
        if (Object.isFrozen(this)) return this;

        // Handle argument shifting if the user skipped the boolean parameter
        let realCreateObj = isCreateNestedObj;
        let realFallback = fallback;
        if (isFunction(isCreateNestedObj)) {
            realCreateObj = true;
            realFallback = isCreateNestedObj;
        }

        try {
            if (typeof nameKey === 'string' && nameKey.includes('.')) {
                const parts = nameKey.split('.');
                const lastKey = parts.pop();

                // Walk down the object tree until we hit the parent of the target key
                let current = this.#value;
                for (const part of parts) {
                    if (realCreateObj && (current[part] === __UNDEFINED__))
                        current[part] = {}; // Safely create missing structural objects on the fly
                    current = current[part];
                }

                current[lastKey] = isFunction(val) ? val(current[lastKey]) : val;
            } else {
                this.#value[nameKey] = isFunction(val)
                    ? val(this.#value[nameKey])
                    : val;
            }
        } 

        catch (err) {
            if (realFallback !== __UNDEFINED__)
                isFunction(realFallback)
                    ? this.#define(realFallback(err, this.#value))
                    : this.#define(realFallback);
        }

        return this;
    }

    /**
     * Shorthand alias for {@link alterValue}.
     * @param {string|number} nameKey
     * @param {any|Function} val
     * @param {boolean|any|Function} [isCreateNestedObj=true]
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _al(nameKey, val, isCreateNestedObj, fallback) { return this.alterValue(nameKey, val, isCreateNestedObj, fallback); }

    /**
     * Shorthand alias for {@link alterValue}.
     * @param {string|number} nameKey
     * @param {any|Function} val
     * @param {boolean|any|Function} [isCreateNestedObj=true]
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $al(nameKey, val, isCreateNestedObj, fallback) { return this.alterValue(nameKey, val, isCreateNestedObj, fallback); }


    /**
     * Extracts the value from the pipe and terminates the chain.
     * If the internal value is undefined, the provided default fallback is returned.
     * @method out
     * @param {any} [def] - Optional fallback value if the pipe's value is undefined.
     * @param {boolean} [lock=true] - If true, clears the internal state and freezes the instance.
     * @returns {any} The final transformed value or the default fallback.
     */
    out(def, lock = true) {
        try { return this.#value === __UNDEFINED__ ? def : this.#value; }
        finally { lock && Object.freeze((this.#value = __UNDEFINED__, this)); }
    }

    /**
     * Shorthand alias for {@link out}.
     * @param {any} [def]
     * @param {boolean} [lock=true]
     * @returns {any}
     */
    _o(def, lock) { return this.out(def, lock); }

    /**
     * Shorthand alias for {@link out}.
     * @param {any} [def]
     * @param {boolean} [lock=true]
     * @returns {any}
     */
    $o(def, lock) { return this.out(def, lock); }


    /**
     * Checks if the pipe instance has been locked and frozen.
     * A locked pipe can no longer be modified or used to extract values.
     * @method isLocked
     * @returns {boolean} True if the instance is frozen, false otherwise.
     */
    isLocked() { return Object.isFrozen(this); }

    /** Shorthand alias for {@link isLocked} */
    _l() { return this.isLocked(); }

    /** Shorthand alias for {@link isLocked} */
    $l() { return this.isLocked(); }
}

// Freeze the pipe
Object.freeze(Pipe);


/**
 * Entry point to create a new Pipe instance.
 * @function chain_
 * @param {any} val - The value to start the pipeline with.
 * @param {boolean} isWipe - Whether to include wiping previous values before any replacements.
 * @returns {Pipe} A new Pipe container.
 * @example
 * const result = chain_(" hello ")
 *      ._p(s => s.trim())
 *      ._p(s => s.toUpperCase())
 *      .out(); // "HELLO"
 */
export const chain_ = (val, isWipe) => new Pipe(val, isWipe);

/**
 * Shorthand alias for {@link chain_}.
 * @function chain$
 * @param {any} val - The value to start the pipeline with.
 * @param {boolean} isWipe - Whether to include wiping previous values before any replacements.
 * @returns {Pipe} A new Pipe container.
 */
export const chain$ = (val, isWipe) => new Pipe(val, isWipe);

export default chain_;