import fib = require('./index');

describe('Builder', () => {
    interface OptionsBuilder {
        url: (value: string) => OptionsBuilder
        reset: (newOpts: Options) => OptionsBuilder
        toString: () => string
        value: Options
    }

    interface Options {
        url: string
    }

    let createOpts = new fib.Builder<Options, OptionsBuilder>()
        .cascade('url', (value, opts) => { opts.url = value; })
        .chain('reset', (newOpts, opts) => newOpts)
        .unwrap('toString', (opts) => `{ url: ${opts.url} }`)
        .value;

    it('should cascade', () => {
        let opts = new createOpts({ url: null })
            .url('http://localhost/')
            .value;

        expect(opts.url).toBe('http://localhost/');
    });

    it('should chain', () => {
        let oldOpts = { url: 'http://localhost/' };
        let newOpts = { url: 'http://127.0.0.1/' };
        let opts = new createOpts(oldOpts)
            .reset(newOpts)
            .value;

        expect(opts).toBe(newOpts);
    });

    it('should unwrap', () => {
        let opts = new createOpts({ url: 'http://localhost/' })
            .toString();

        expect(opts).toBe('{ url: http://localhost/ }');
    });

    interface ICalc {
        value: number,
        add: (b: number) => ICalc;
        sub: (b: number) => ICalc;
        unwrap: () => number;
    }

    let Calc = new fib.Builder<number, ICalc>()
        .chain("add", (b, a) => a + b)
        .chain("sub", (b, a) => a - b)
        .value;

    it('should calc', () => {
        let result = new Calc(5).add(6).sub(7).value;

        expect(result).toBe(5 + 6 - 7);
    });
});