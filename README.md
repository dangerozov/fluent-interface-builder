# Fluent interface builder
[![Build Status](https://travis-ci.org/dangerozov/fluent-interface-builder.svg?branch=master)](https://travis-ci.org/dangerozov/fluent-interface-builder)

Create fluent interfaces fluently.

## Installation
`npm install fluent-interface-builder --save`

## Usage

`let fib = require('fluent-interface-builder');`

`fib` has constructor `Builder`, that starts fluent interface. It has `cascade`, `chain` and `unwrap` that add provided functions to inner constructor prototype and `value` to return this inner constructor as result.

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
let Calculator = new fib.Builder()
  .chain('add', (b) => (a) => a + b)
  .chain('sub', (b) => (a) => a - b)
  .chain('mul', (b) => (a) => a * b)
  .chain('div', (b) => (a) => a / b)
  .value;
  
let result = new Calculator(10)
  .add(4)
  .div(2)
  .sub(3)
  .mul(5)
  .value;

// result = 20
```
Url builder
```
let Url = new fib.Builder()
  .cascade('scheme', (scheme) => (url) => { url.scheme = scheme; })
  .cascade('address', (address) => (url) => { url.address = address; })
  .cascade('port', (port) => (url) => { url.port = port; }
  .unwrap('toUrl', () => (url) => { return url.scheme + '://' + url.address + ':' url.port; })
  .value;
  
let localhost = new Url({ scheme: null, address: null, port: null })
  .scheme('http')
  .address('127.0.0.1')
  .port('80')
  .toUrl();
  
// localhost = 'http://127.0.0.1:80'
```
### TypeScript
`Builder` constructor has generic parameters `<TValue, TInstance>`.
`TValue` - type of value, that will be passed around behind the scenes.
`TInstance` - type of your fluent interface.

```
type Point = { x: number, y: number };
type WrappedPoint = {
  value: Point,
  add: (point: Point) => WrappedPoint,
  sub: (point: Point) => WrappedPoint,
  mul: (point: Point) => WrappedPoint,
  div: (point: Point) => WrappedPoint
}

let point = new fib.Builder<Point, WrappedPoint>()
  .chain("add", (b) => (a) => ({ x: a.x + b.x, y: a.y + b.y }))
  .chain("sub", (b) => (a) => ({ x: a.x - b.x, y: a.y - b.y }))
  .chain("mul", (b) => (a) => ({ x: a.x * b.x, y: a.y * b.y }))
  .chain("div", (b) => (a) => ({ x: a.x / b.x, y: a.y / b.y }))
  .value;
```


## Notes

### Builder has optional parameter
You can pass your own constructor into Builder to extend your constructor prototype.
```
function Url(value) { this.value = value; }
new fib.Builder(Url)
  .cascade('scheme', (scheme) => (url) => { url.scheme = scheme; })
  .cascade('address', (address) => (url) => { url.address = address; })
  .cascade('port', (port) => (url) => { url.port = port; }
  .unwrap('toUrl', () => (url) => { return url.scheme + '://' + url.address + ':' url.port; });
  
let localhost = new Url({ scheme: null, address: null, port: null })
  .scheme('http')
  .address('127.0.0.1')
  .port('80')
  .toUrl();
```


### Merge your static functions with fluent interface using object.assign
If you have an object with all your static functions, that you've used to create fluent interface, you can merge them using object.assign.
```
let pointHelpers = {
  add: (left, right) => ({ x: left.x + right.x, y: left.y + right.y });
  sub: (left, right) => ({ x: left.x - right.x, y: left.y - right.y });
  mul: (left, right) => ({ x: left.x * right.x, y: left.y * right.y });
  div: (left, right) => ({ x: left.x / right.x, y: left.y / right.y });
}

let pointFluent = new fib.Builder()
  .chain("add", (right) => (left) => pointHelpers.add(left, right))
  .chain("sub", (right) => (left) => pointHelpers.sub(left, right))
  .chain("mul", (right) => (left) => pointHelpers.mul(left, right))
  .chain("div", (right) => (left) => pointHelpers.div(left, right))
  .value;

let point = object.assign(pointFluent, pointHelpers);

let p1 = point({ x: 2, y: 3 }).add({ x: 4, y: 5 }).div({ x: 2, y: 2 }).value; // { x: 3, y: 4 }
let p2 = point.add({ x: 1, y: 2 }, { x: 3, y: 4 }); // { x: 4, y: 6 }
```
