export interface Instance<T> { value: T; }
export interface Ctor<T, T2 extends Instance<T>> { new (value: T): T2; }

export interface Cascadable<T> { (...args: any[]): (ctx: T) => void };
export interface Chainable<T> { (...args: any[]): (ctx: T) => T };
export interface Unwrappable<T, U> { (...args: any[]): (ctx: T) => U };

let cascade = <T, TI extends Instance<T>>(name: string, func: Cascadable<T>) => (ctor: Ctor<T, TI>) => {
	ctor.prototype[name] = function(this: TI, ...args: any[]) {
		func(...args)(this.value);
		return this;
	};
};

let chain = <T, TI extends Instance<T>>(name: string, func: Chainable<T>) => (ctor: Ctor<T, TI>) => {
	ctor.prototype[name] = function(this: TI, ...args: any[]) {
		this.value = func(...args)(this.value);
		return this;
	};
};

let unwrap = <T, TI extends Instance<T>, U>(name: string, func: Unwrappable<T, U> ) => (ctor: Ctor<T, TI>) => {
	ctor.prototype[name] = function(this: TI, ...args: any[]) {
		return func(...args)(this.value);
	}
};

export interface IBuilder<T, TI extends Instance<T>> {
	value: Ctor<T, TI>;
	cascade: (name: string, func: Cascadable<T>) => IBuilder<T, TI>;
	chain: (name: string, func: Chainable<T>) => IBuilder<T, TI>;
	unwrap: <U>(name: string, func: Unwrappable<T, U>) => IBuilder<T, TI>;
}

class Builder<T, TI extends Instance<T>> implements Instance<Ctor<T, TI>> {
	constructor(public value: Ctor<T, TI>) {}
}

cascade<any, Instance<any>>("cascade", cascade)(Builder);
cascade<any, Instance<any>>("chain", chain)(Builder);
cascade<any, Instance<any>>("unwrap", unwrap)(Builder);

export let build = <T, TI extends Instance<T>>() => {
	class RealCtor implements Instance<T> {
		constructor(public value: T) { }
	}

	return <IBuilder<T, TI>>new Builder(RealCtor);
};
