## Codebox Stacks

A `stack` is basically a `docker` image based on `ubuntu` including `codebox`'s source code and `node/npm` as the runtime.

Stacks allow to provide different environments with tools suited for different kinds of development, for example if you're writing :
  - `PHP` you will need an `Apache` server
  - `Dart` you will need the `dart runtime`
  - `Java` you will need the `JVM`

Using `dynobox` which supports swapping stacks, environments and tools are thus easily upgradable.

All stacks are build off the `base` stack, the `base` stack should not be used directly.
