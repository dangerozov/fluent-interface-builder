export interface Builder<TWrapper, TObject> {
	value: (context: TObject) => TWrapper,
	cascade: (name: string, func: (...args: any[]) => (context: TObject) => void) => Builder<TWrapper, TObject>,
	chain: <TNewObject>(name: string, func: (...args: any[]) => (context: TObject) => TNewObject) => Builder<TWrapper, TNewObject>,
	unbox: (name: string, func: (...args: any[]) => (context: TObject) => any) => Builder<TWrapper, TObject>
};

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
		unbox: (name: string, func: <U>(...args: any[]) => (context: TObject) => U) => {
			prototype[name] = function(...args: any[]) {
				return func(...args)((<Wrapper>this).value);
			}
			return result;
		}
	};

	return result;
};
