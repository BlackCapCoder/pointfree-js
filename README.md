# pointfree-js

This is an implementation of pointfree notation in javascript.


### Usage

The library only exposes a single function named `pf`. The `pf` function
takes one or more context and returns a proxy of that context in which pointfree
notation magically works.

It is indented to be used with a `with` block- example:

```javascript
id  = x => x
add = x => y => x + y

map = f => xs => {
  let copy = [];
  for (let i in xs) copy[i] = f (xs[i]);
  return copy;
}

with (pf (global)) {
  add3List = id . map (add (1) . add (2)); // magic
}

console.log (add3List ([1,2,3])) // Prints [4,5,6]
```

As you can see, I was able to compose `add (1)` and `add (2)` into a new function
that first added `1`, then `2`, just by writing `add (1) . add (2)`. How convenient!

The `id` function didn't really do anything, but you can imagine it was something
a bit more exciting, like `sum`.


### Function arity

Pointfree does not care about the arity of functions. If you have a function
`add3 = x => (y,z) => x + y + z` you can call it as either `add3 (1) (2) (3)` or `add3 (1,2,3)`,
or even mix them: `add3 (1,2) (3)`.


### Scope

Unfortunately all functions that you want to partially apply or compose has to be in scope:

```javascript
with (pf (global)) {
  powMap1 = map (Math.pow (2)) // Does not work

  let pow = Math.pow
  powMap2 = map (pow (2)) // Also does not work

  pow = Math.pow
  powMap3 = map (pow (2)) // This works!

  let two = 2
  powMap4 = map (pow (two)) // This is also fine
}

with (pf (Math)) {
  pow2 = pow (2)
}

console.log (Math.pow2 (3)) // Prints 8
```

Fortunately, the `pf` function can take more than one scope as an argument:

```javascript
with (pf (global, Math)) {
  pow2 = pow (2)
}
```

The first argument will always be the scope we write to, so in the above
example, `pow2` will be a function in `global`, not `Math`.

