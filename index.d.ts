export interface Builder<TClass, TContext> {
    value: (context: TContext) => TClass;
    cascade: (name: string, func: (...args: any[]) => (context: TContext) => void) => Builder<TClass, TContext>;
    chain: <TNewContext>(name: string, func: (...args: any[]) => (context: TContext) => TNewContext) => Builder<TClass, TNewContext>;
    unbox: (name: string, func: (...args: any[]) => (context: TContext) => any) => Builder<TClass, TContext>;
}
export declare let build: <TClass, TContext>() => Builder<TClass, TContext>;
