export interface Instance<TValue> { value: TValue; }
export interface Ctor<TValue, TInstance extends Instance<TValue>> { new (value: TValue): TInstance; }

export interface Cascadable<TValue> { (...args: any[]/*, ctx: TValue*/): void };
export interface Chainable<TValue> { (...args: any[]/*, ctx: TValue*/): TValue };
export interface Unwrappable<TValue, U> { (...args: any[]/*, ctx: TValue*/): U };

let cascade = <TValue, TInstance extends Instance<TValue>>(name: string, func: Cascadable<TValue>, ctor: Ctor<TValue, TInstance>) => {
	ctor.prototype[name] = function(this: TInstance, ...args: any[]) {
		func(...args, this.value);
		return this;
	};
};

let chain = <TValue, TInstance extends Instance<TValue>>(name: string, func: Chainable<TValue>, ctor: Ctor<TValue, TInstance>) => {
	ctor.prototype[name] = function(this: TInstance, ...args: any[]) {
		this.value = func(...args, this.value);
		return this;
	};
};

let unwrap = <TValue, TInstance extends Instance<TValue>, U>(name: string, func: Unwrappable<TValue, U>, ctor: Ctor<TValue, TInstance>) => {
	ctor.prototype[name] = function(this: TInstance, ...args: any[]) {
		return func(...args, this.value);
	}
};

export interface IBuilder<TValue, TInstance extends Instance<TValue>> {
	value: Ctor<TValue, TInstance>;
	cascade: (name: string, func: Cascadable<TValue>) => IBuilder<TValue, TInstance>;
	chain: (name: string, func: Chainable<TValue>) => IBuilder<TValue, TInstance>;
	unwrap: <U>(name: string, func: Unwrappable<TValue, U>) => IBuilder<TValue, TInstance>;
}

export class Builder<TValue, TInstance extends Instance<TValue>> implements IBuilder<TValue, TInstance> {
	public value: Ctor<TValue, TInstance>;
	constructor(value?: Ctor<TValue, TInstance>) {
		if (value === void 0) {
			class RealCtor implements Instance<TValue> {
				constructor(public value: TValue) { }
			}

			value = <Ctor<TValue, TInstance>>RealCtor;
		}

		this.value = value;
	}
	cascade(name: string, func: Cascadable<TValue>) { return <IBuilder<TValue, TInstance>>null; };
	chain(name: string, func: Chainable<TValue>) { return <IBuilder<TValue, TInstance>>null; };
	unwrap<U>(name: string, func: Unwrappable<TValue, U>) { return <IBuilder<TValue, TInstance>>null };
}

cascade<any, Instance<any>>("cascade", cascade, Builder);
cascade<any, Instance<any>>("chain", chain, Builder);
cascade<any, Instance<any>>("unwrap", unwrap, Builder);