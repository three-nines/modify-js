export function zeroBuf(...args: (Buffer | any)[]): void;
/**
 * A "Silent" or empty shell version of Pipe that discards all operations.
 * Typically used for short-circuiting chains via exitWhen.
 * @class SilentPipe
 */
export class SilentPipe {
    constructor(val: any);
    modify(): this;
    _p(): this;
    $p(): this;
    mutate(): this;
    _m(): this;
    $m(): this;
    tryModify(): this;
    _t(): this;
    $t(): this;
    tryMutate(): this;
    _tm(): this;
    $tm(): this;
    tapWhen(): this;
    _w(): this;
    $w(): this;
    exitWhen(): this;
    _x(): this;
    $x(): this;
    alterValue(): this;
    _al(): this;
    $al(): this;
    /**
     * Resolves the captured short-circuit value and freezes the instance.
     * @param {any} [def] - Fallback default value if internal resolution yields undefined.
     * @param {boolean} [lock=true] - Structural signature match for framework parity.
     * @returns {any}
     * @private
     */
    private out;
    _o(def: any, lock: any): any;
    $o(def: any, lock: any): any;
    isLocked(): boolean;
    _l(): boolean;
    $l(): boolean;
    #private;
}
/**
 * Represents a secure, stateful container for functional transformations.
 * @class Pipe
 */
export class Pipe {
    /**
     * Creates an instance of Pipe.
     * @param {any} val - The initial value to wrap.
     * @param {boolean} [isWipe=false] - Wipe internal value that might
     * be a Buffer, Uint arrays, or ArrayBuffer, before overwriting it
     * with a new value. Can be prone to bugs if you are still handling these values mid-chain.
     */
    constructor(val: any, isWipe?: boolean);
    /**
     * Passes the internal value through a transformation function.
     * Updates the internal state and returns the same Pipe instance.
     * @method modify
     * @param {ModifyCallback<any, any>} fn - The transformation function to execute.
     * @returns {this} The current Pipe instance for further chaining.
     * @throws {TypeError} If the provided argument is not a function.
     */
    modify(fn: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link modify}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _p(fn: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link modify}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $p(fn: ModifyCallback<any, any>): this;
    /**
     * Executes a side-effect or mutation on the internal value without replacing it.
     * The internal value remains the same object/primitive, updated by the callback.
     * @method mutate
     * @param {ModifyCallback<any, any>} fn - The mutation function to execute.
     * @returns {this} The current Pipe instance for further chaining.
     * @throws {TypeError} If the provided argument is not a function.
     */
    mutate(fn: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link mutate}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _m(fn: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link mutate}.
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $m(fn: ModifyCallback<any, any>): this;
    /**
     * Attempts a transformation function. If it throws an error and the fallback is a function,
     * executes the fallback to resolve a new value. Otherwise, assigns the fallback value directly.
     * @method tryModify
     * @param {ModifyCallback<any, any>} fn - The transformation function to attempt.
     * @param {any|Function} [fallback] - Dynamic recovery function or static fallback value.
     * @returns {this}
     * @throws {TypeError} If the primary argument is not a function.
     */
    tryModify(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link tryModify}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _t(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link tryModify}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $t(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Attempts a mutation or side-effect. If it throws an error and a fallback function is provided,
     * executes the fallback for side-effect recovery. Otherwise, optionally swaps the internal value.
     * @method tryMutate
     * @param {ModifyCallback<any, any>} fn - The mutation function to attempt.
     * @param {any|Function} [fallback] - Recovery error-handling function or optional static swap value.
     * @returns {this}
     * @throws {TypeError} If the primary argument is not a function.
     */
    tryMutate(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link tryMutate}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _tm(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link tryMutate}.
     * @param {ModifyCallback<any, any>} fn
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $tm(fn: ModifyCallback<any, any>, fallback?: any | Function): this;
    /**
     * Executes a side-effect or transforms the internal value
     * only if a predicate function evaluates to true.
     * @method tapWhen
     * @param {PredicateCallback<any>} predicate - Condition to check.
     * @param {boolean|ModifyCallback<any, any>} isModify - Can be a boolean flag, or skipped entirely to default to true.
     * @param {ModifyCallback<any, any>} [fn] - The execution function.
     * @returns {this}
     */
    tapWhen(predicate: PredicateCallback<any>, isModify?: boolean | ModifyCallback<any, any>, fn?: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link tapWhen}
     * @param {PredicateCallback<any>} predicate
     * @param {boolean|ModifyCallback<any, any>} [isModify=true]
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    _w(predicate: PredicateCallback<any>, isModify?: boolean | ModifyCallback<any, any>, fn: ModifyCallback<any, any>): this;
    /**
     * Shorthand alias for {@link tapWhen}
     * @param {PredicateCallback<any>} predicate
     * @param {boolean|ModifyCallback<any, any>} [isModify=true]
     * @param {ModifyCallback<any, any>} fn
     * @returns {this}
     */
    $w(predicate: PredicateCallback<any>, isModify?: boolean | ModifyCallback<any, any>, fn: ModifyCallback<any, any>): this;
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
    exitWhen(fn: ModifyCallback<any, any>, isModify?: boolean | any | Function, fallback?: any | Function): SilentPipe | this;
    /**
     * Shorthand alias for {@link exitWhen}
     * @param {ModifyCallback<any, any>} fn
     * @param {boolean|any|Function} [isModify=true]
     * @param {any|Function} [fallback]
     * @returns {SilentPipe|this}
     */
    _x(fn: ModifyCallback<any, any>, isModify?: boolean | any | Function, fallback?: any | Function): SilentPipe | this;
    /**
     * Shorthand alias for {@link exitWhen}
     * @param {ModifyCallback<any, any>} fn
     * @param {boolean|any|Function} [isModify=true]
     * @param {any|Function} [fallback]
     * @returns {SilentPipe|this}
     */
    $x(fn: ModifyCallback<any, any>, isModify?: boolean | any | Function, fallback?: any | Function): SilentPipe | this;
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
    alterValue(nameKey: string | number, val: any | Function, isCreateNestedObj?: boolean | any | Function, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link alterValue}.
     * @param {string|number} nameKey
     * @param {any|Function} val
     * @param {boolean|any|Function} [isCreateNestedObj=true]
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    _al(nameKey: string | number, val: any | Function, isCreateNestedObj?: boolean | any | Function, fallback?: any | Function): this;
    /**
     * Shorthand alias for {@link alterValue}.
     * @param {string|number} nameKey
     * @param {any|Function} val
     * @param {boolean|any|Function} [isCreateNestedObj=true]
     * @param {any|Function} [fallback]
     * @returns {this}
     */
    $al(nameKey: string | number, val: any | Function, isCreateNestedObj?: boolean | any | Function, fallback?: any | Function): this;
    /**
     * Extracts the value from the pipe and terminates the chain.
     * If the internal value is undefined, the provided default fallback is returned.
     * @method out
     * @param {any} [def] - Optional fallback value if the pipe's value is undefined.
     * @param {boolean} [lock=true] - If true, clears the internal state and freezes the instance.
     * @returns {any} The final transformed value or the default fallback.
     */
    out(def?: any, lock?: boolean): any;
    /**
     * Shorthand alias for {@link out}.
     * @param {any} [def]
     * @param {boolean} [lock=true]
     * @returns {any}
     */
    _o(def?: any, lock?: boolean): any;
    /**
     * Shorthand alias for {@link out}.
     * @param {any} [def]
     * @param {boolean} [lock=true]
     * @returns {any}
     */
    $o(def?: any, lock?: boolean): any;
    /**
     * Checks if the pipe instance has been locked and frozen.
     * A locked pipe can no longer be modified or used to extract values.
     * @method isLocked
     * @returns {boolean} True if the instance is frozen, false otherwise.
     */
    isLocked(): boolean;
    /** Shorthand alias for {@link isLocked} */
    _l(): boolean;
    /** Shorthand alias for {@link isLocked} */
    $l(): boolean;
    #private;
}
export function chain_(val: any, isWipe: boolean): Pipe;
export function chain$(val: any, isWipe: boolean): Pipe;
export default chain_;
/**
 * A transformation function used within the pipeline.
 */
export type ModifyCallback<T, R> = (value: T) => R;
/**
 * A predicate validation condition check.
 */
export type PredicateCallback<T> = (value: T) => boolean;
