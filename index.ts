export interface Builder<TClass, TContext> {
	value: (context: TContext) => TClass,
	cascade: (name: string, func: (...args: any[]) => (context: TContext) => void) => Builder<TClass, TContext>,
	chain: <TNewContext>(name: string, func: (...args: any[]) => (context: TContext) => TNewContext) => Builder<TClass, TNewContext>,
	unbox: (name: string, func: (...args: any[]) => (context: TContext) => any) => Builder<TClass, TContext>
};

export let build = <TClass, TContext>() => {
	class Wrapper {
		public value: TContext;
		constructor(context: TContext) {
			this.value = context;
		}
	}

	const prototype: { [key: string]: any } = Wrapper.prototype;

	let result: Builder<TClass, TContext> = {
		value: (context: TContext) => <TClass & Wrapper>new Wrapper(context),
		cascade: (name: string, func: (...args: any[]) => (context: TContext) => void) => {
			prototype[name] = function(...args: any[]) {
				func(...args)((<Wrapper>this).value);
				return this;
			}
			return result;
		},
		chain: (name: string, func: (...args: any[]) => (context: TContext) => TContext) => {
			prototype[name] = function(...args: any[]) {
				(<Wrapper>this).value = func(...args)((<Wrapper>this).value);
				return this;
			}
			return result;
		},
		unbox: (name: string, func: <U>(...args: any[]) => (context: TContext) => U) => {
			prototype[name] = function(...args: any[]) {
				return func(...args)((<Wrapper>this).value);
			}
			return result;
		}
	};
	
	return result;
};