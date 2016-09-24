# Fluent interface builder
Create fluent interfaces fluently.
## Installation
`npm install fluent-interface-builder --save`

## Usage

`var builder = require('fluent-interface-builder');`

`builder` has single function `build`, that starts fluent interface. It has `cascade`, `chain` and `unwrap` for all your fluent needs and `value` to end fluent interface and get the result.

### [cascade](https://en.wikipedia.org/wiki/Method_cascading)
```
cascade(name: string, func: (...args: any[]) => (context: T) => void)
cascade('setUrl', (url, port) => (context) => { context.url = url; context.port = port; })
```

Use:
- when your function doesn't return value;
- for mutable objects with settable properties;
- for anything options-like, requests etc. 

### [chain](https://en.wikipedia.org/wiki/Method_chaining)
```
chain(name: string, func: (...args: any[]) => (context: T) => T)
chain('filter', (predicate) => (context) => { return array.filter(context, predicate); })
```

Use:
- when your function return value of the same type;
- for immutable objects like numbers, booleans and strings;
- array helpers, that return new array.

### unwrap
```
unwrap(name: string, func: (...args: any[]) => (context: T) => U)
unwrap('toString', () => (context) => return context.url + ':' + context.port)
```

Use:
- when your function returns value of different type
- if you want your function to end fluent interface prematurely

## Examples
Calculator
```
let calculator = builder.build()
  .chain('add', (b) => (a) => a + b)
  .chain('sub', (b) => (a) => a - b)
  .chain('mul', (b) => (a) => a * b)
  .chain('div', (b) => (a) => a / b)
  .value;
  
let result = calculator(10)
  .add(4)
  .div(2)
  .sub(3)
  .mul(5)
  .value;

// result = 20
```
Url builder
```
let url = builder.build()
  .cascade('scheme', (scheme) => (opts) => { opts.scheme = scheme; })
  .cascade('address', (address) => (opts) => { opts.address = address; })
  .cascade('port', (port) => (opts) => { opts.port = port; }
  .unwrap('toUrl', () => (opts) => { return opts.scheme + '://' + opts.address + ':' opts.port; })
  .value;
  
let localhost = url({ scheme: null, address: null, port: null })
  .scheme('http')
  .address('127.0.0.1')
  .port('80')
  .toUrl();
  
// localhost = 'http://127.0.0.1:80'
```

## Notes

### builder is mutable
Basically `builder` is written with itself using `cascade` for all its functions.
```
build.build = builder.build()
  .cascade('cascade', ...)
  .cascade('chain', ...)
  .cascade('unwrap' ...)
  .value;
```
This means that `cascade`, `chain` and `unwrap` update inner object. You can't split building into several directions like this.
```
let partiallyBuilt = builder.build()
  .chain('foo', ...);
let partiallyBuilt1 = partiallyBuilt()
  .chain('foo1', ...);
let partiallyBuilt2 = partiallyBuilt()
  .chain('foo2');
  
let result1 = partiallyBuilt1.value;
let result2 = partiallyBuilt2.value;
```
`result1` and `result2` both get `foo`, `foo1` and `foo2` functions.

This behavior may change in the future though.
