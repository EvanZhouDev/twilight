![Twilight Banner](./assets/banner.png)

## Getting Started

Welcome to Twilight!

### Installation:

Install `twilight-lang` with your your favorite JS package manager.

```bash
npm i -g twilight-lang
```

Now, verify that it works by running `twilight -v`, which should give you the version number.

### The Math Behind Twilight

Twilight isn't just easy to use. It's also powered by a completely new method of parsing that natively supports multi-binder expressions, allowing a speedup compared to standard methods of parsing. Learn more about [this parsing method here](https://github.com/EvanZhouDev/twilight/tree/main/lang/runtime).

### Syntax Quickstart

Twilight's syntax is heavily math based, so it should seem familiar. Here's a quick overview of all the features, in the language itself.

```
# Comments start with a hashtag.

# Abstractions start with a "\" or "λ", followed by a space-seperated list of binders, then a ".", and finally, the body.
\x.x # This will get normalized, and printed
\myVar otherVar.myVar # Variable names can be anything

# To apply two variables, separate them with a space...
\x.x x
# or use parenthesis as such:
(\x.x)(\y.y) # \y.y
(\w y x.y(w y x))(\s z.z) # \s z.z

# You can also store things in constants... they can be named anything!
T = \x y.x
F = \x y.y
¬ = \x.x F T
Z = λn.n F ¬ F

# You can use them as normal expressions
Z 0 # \x y.x ≣ T

# And Twilight will also identify any constants used in the output!
```

You can also call `import` at the **top of the file**, like this:

```
import numerals # automatically binds any integers to church numerals

# Import constants from another files
import ./my/other/file.twi
```

### Getting to know Twilight

Start by creating an `index.twi`. This guide will quickly show you every expression type avaiable, from standard Lambda Calculus, to some additional syntax sugars.

Twilight was designed to be strongly based off of mathematical notation. As such, I will be presenting the mathematical parallels of Twilight syntax for each expression type.

#### Abstractions

As the basis of lambda calculus, expressions follow this syntax: `λ<binders>.<body>`. Note that you can also write it as `\<binders>.<body>`, for ease of typing.

The identity function, $\lambda x.x$, can therefore be written as `λx.x`, nearly exactly how it is written mathematically. Note that you can use any non-space seperated string as a variable name, so `λmyVar.myVar` is also completely valid.

Multi-binder abstractions are built into Twilight, so the `true` function $\lambda x y.x$ can be written as `λx y.x` (note the use of space to denote separate binders). Mathematically, this is equivalent to $\lambda x.\lambda y.x$, and can thus also be represented as `λx.λy.x`.

Putting an abstraction on a new line in a Twilight file will result in it being normalized, and printed.

#### Applications

You can apply an expression onto another by directly following it with another expression, in parenthesis. `(<expr1>) (<expr2>)`. If an expression is self-contained, you do not need parenthesis around it, and a space can suffice. For example, `<expr1> <expr2>`.

Take the example of the successor function $\lambda w y x.y (w y x)$. We can write this in Twilight in nearly exactly the same way: `λw y x.y(w y x)`. Notice how you do not need a space when applying `(w y x)` to `y`. Twilight also knows `(w y x)` is `((w y) x)`.

Putting an application on a new line in a Twilight file will result in it being normalized, and printed.

#### Assignments and Constants

Sometimes, it's effective to store an expression in a constant to use later. In order to do this, simply follow this syntax: `<name> = <expr>`.

For example, let's store the successor function.

```
S = λw y x.y (w y x)
```

To use, it simply use S as you would an expression: `S (λs z.z)`.

Twilight does not normalize things stored in variables (in case you wish to store any fixed-point combinator), but if you do attempt to print the constant by placing it on a new line, it will be normalized.

> Note that these constants are expanded instantly, and cannot be recursively declared, to adhere to standard lambda calculus.

Additionally, when Twilight outputs something, it will also try to relink the output to any variables it finds. For example, if you define `S` and put the abstration `λw y x.y (w y x)` on a new line (or anything else alpha equivalent), Twilight will tell you that it is equal to `S`.

This feature also works for Church Numerals, out-of-the box (no imports required).

#### Comments

Start comments with the hashtag (`#`) character. Everything on that line, following the hastag will be ignored by Twilight. For example:

```
S = λw y x.y (w y x) # this function adds 1 to a numeral!
```

#### Importing the Standard Library

Twilight provides a Standard Library, so you do not have to type boilerplate over and over again. In order to import something, follow this syntax: `import <package1> <package2> ...`.

Most packages are essentially equivalent to declaring certain constants for you, so they also have the ability to be relinked on output as shown above.

Here's a quick overview of Twilight's Standard Library packages:

- `booleans`: `T` and `F`, declared as `\x y.x` and `x y.y` respectively
- `numerals`: Any number is automatically bound to it's Church Numeral equivalent.

For example, I can import and use numerals and booleans like this:

```
import numerals booleans

S = λw y x.y (w y x)

S 0 # \s z.s z ≣ 1

not = λx.x F T

not F # \x y.x ≣ T
```

#### Importing Other Files

If an import ends in `.twi`, Twilight will attempt to import that file. All variables declared in that file will be added to the environment of your current file. Standard Library imports will also carry over.
