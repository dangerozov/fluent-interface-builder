export interface Builder<TWrapper, TObject> {
	value: (context: TObject) => TWrapper,
	cascade: (name: string, func: (...args: any[]) => (context: TObject) => void) => Builder<TWrapper, TObject>,
	chain: <TNewObject>(name: string, func: (...args: any[]) => (context: TObject) => TNewObject) => Builder<TWrapper, TNewObject>,
	unwrap: (name: string, func: (...args: any[]) => (context: TObject) => any) => Builder<TWrapper, TObject>
};

interface Ctor<T> { new (context: T): Instance<T>; }
interface Instance<T> { value: T; }

interface Cascadable<T> { (...args: any[]): (ctx: T) => void }
interface Chainable<T> { (...args: any[]): (ctx: T) => T };

let cascade = <T>(name: string, ctor: Ctor<T>, func: Cascadable<T>) => {
	ctor.prototype[name] = function(this: Instance<T>, ...args: any[]) {
		func(...args)(this.value);
		return this;
	};
};

// TODO: can't make it T1->T2, because I need to change type of this after operation. How? :\
let chain = <T>(name: string, ctor: Ctor<T>, func: Chainable<T>) => {
	ctor.prototype[name] = function(this: Instance<T>, ...args: any[]){
		this.value = func(...args)(this.value);
		return this;
	};
};

class Builder2<T> implements Instance<Ctor<T>> {
	public value: Ctor<T>;
	constructor(context: Ctor<T>) {
		this.value = context;
	}
}

interface IBuilder2<T> {
	chain: (name: string, func: Chainable<T>) => IBuilder2<T> & Builder2<T>;
}

cascade("cascade", Builder2, (name: string, func: Cascadable<any>) => (ctx) => {
	cascade(name, ctx, func);
});
cascade("chain", Builder2, (name: string, func: Chainable<any>) => (ctx) => {
	chain(name, ctx, func);
})

class Calc implements Instance<number> {
	public value: number;
	constructor(context: number) {
		this.value = context;
	}
}

interface ICalc {
	add: (b: number) => ICalc & Calc;
	sub: (b: number) => ICalc & Calc;
	add2: (b: number) => ICalc & Calc;
	sub2: (b: number) => ICalc & Calc;
}

// adding "add" and "sub" directly
chain("add", Calc, (b) => (a) => a + b);
chain("sub", Calc, (b) => (a) => a + b);

// adding "add2" and "sub2" using builder
((<IBuilder2<number> & Builder2<number>>new Builder2(Calc))
	.chain("add2", (b) => (a) => a + b)
	.chain("sub2", (b) => (a) => a - b)
	.value);

let calc = <ICalc & Calc>new Calc(5);
console.log(calc.add(6).add(7).value);
let calc2 = <ICalc & Calc>new Calc(5);
console.log(calc2.add2(6).add2(7).value);

export let build = <TWrapper, TObject>() => {
	class Wrapper {
		public value: TObject;
		constructor(context: TObject) {
			this.value = context;
		}
	}

	const prototype: { [key: string]: any } = Wrapper.prototype;

	let result: Builder<TWrapper, TObject> = {
		value: (context: TObject) => <TWrapper & Wrapper>new Wrapper(context),
		cascade: (name: string, func: (...args: any[]) => (context: TObject) => void) => {
			prototype[name] = function(...args: any[]) {
				func(...args)((<Wrapper>this).value);
				return this;
			}
			return result;
		},
		chain: (name: string, func: (...args: any[]) => (context: TObject) => TObject) => {
			prototype[name] = function(...args: any[]) {
				(<Wrapper>this).value = func(...args)((<Wrapper>this).value);
				return this;
			}
			return result;
		},
		unwrap: (name: string, func: <U>(...args: any[]) => (context: TObject) => U) => {
			prototype[name] = function(...args: any[]) {
				return func(...args)((<Wrapper>this).value);
			}
			return result;
		}
	};

	return result;
};
