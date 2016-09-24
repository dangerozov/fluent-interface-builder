import builder = require('./index');

describe('Builder', () => {
    interface OptionsBuilder {
        url: (value: string) => OptionsBuilder
        reset: (newOpts: Options) => OptionsBuilder
        toString: () => string
        value: any
    }

    interface Options {
        url: string
    }

    let createOpts = builder.build<OptionsBuilder, Options>()
        .cascade('url', (value) => (opts) => { opts.url = value; })
        .chain('reset', (newOpts) => (opts) => newOpts)
        .unwrap('toString', () => (opts) => `{ url: ${opts.url} }`)
        .value;

    it('should cascade', () => {
        let opts = createOpts({ url: null })
            .url('http://localhost/')
            .value;

        expect(opts.url).toBe('http://localhost/');
    });

    it('should chain', () => {
        let oldOpts = { url: 'http://localhost/' };
        let newOpts = { url: 'http://127.0.0.1/' };
        let opts = createOpts(oldOpts)
            .reset(newOpts)
            .value;

        expect(opts).toBe(newOpts);
    });

    it('should unwrap', () => {
        let opts = createOpts({ url: 'http://localhost/' })
            .toString();

        expect(opts).toBe('{ url: http://localhost/ }');
    });
});