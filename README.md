# Fluent interface builder
Create fluent interfaces fluently.
## Installation
`npm install fluent-interface-builder --save`

## Usage

`var builder = require('fluent-interface-builder');`

`builder` has single function `build`, that starts fluent interface. It has `cascade`, `chain` and `unwrap` for all your fluent needs and `value` to end fluent interface and get the result.

All these functions follow the same interface `(name: string, func: (...args: any[]) => (context: T) => ...)`.
Function `func` should be [partially applied](https://en.wikipedia.org/wiki/Partial_application) to accept zero to many arguments and return another function that accept context. Context is an object hidden inside fluent interface.

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
### JavaScript
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
### TypeScript
`builder.build` has generic parameters `<TWrapper, TObject>`.
`TWrapper` - type of your fluent interface. You need to provide it due to dynamically assigning functions to object via indexer.
`TObject` - type of object, that will be passed around behind the scenes.

```
type Point = { x: number, y: number };
type WrappedPoint = {
  value: Point,
  add: (point: Point) => WrappedPoint,
  sub: (point: Point) => WrappedPoint,
  mul: (point: Point) => WrappedPoint,
  div: (point: Point) => WrappedPoint
}

let point = builder.build<WrappedPoint, Point>()
  .chain("add", (b) => (a) => ({ x: a.x + b.x, y: a.y + b.y }))
  .chain("sub", (b) => (a) => ({ x: a.x - b.x, y: a.y - b.y }))
  .chain("mul", (b) => (a) => ({ x: a.x * b.x, y: a.y * b.y }))
  .chain("div", (b) => (a) => ({ x: a.x / b.x, y: a.y / b.y }))
  .value;
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


### Merge your static functions with fluent interface using object.assign
If you have an object with all your static functions, that you've used to create fluent interface, you can merge them using object.assign.
```
let pointHelpers = {
  add: (left, right) => ({ x: left.x + right.x, y: left.y + right.y });
  sub: (left, right) => ({ x: left.x - right.x, y: left.y - right.y });
  mul: (left, right) => ({ x: left.x * right.x, y: left.y * right.y });
  div: (left, right) => ({ x: left.x / right.x, y: left.y / right.y });
}

let pointFluent = builder.build()
  .chain("add", (right) => (left) => pointHelpers.add(left, right))
  .chain("sub", (right) => (left) => pointHelpers.sub(left, right))
  .chain("mul", (right) => (left) => pointHelpers.mul(left, right))
  .chain("div", (right) => (left) => pointHelpers.div(left, right))
  .value;

let point = object.assign(pointFluent, pointHelpers);

let p1 = point({ x: 2, y: 3 }).add({ x: 4, y: 5 }).div({ x: 2, y: 2 }).value; // { x: 3, y: 4 }
let p2 = point.add({ x: 1, y: 2 }, { x: 3, y: 4 }); // { x: 4, y: 6 }
```
