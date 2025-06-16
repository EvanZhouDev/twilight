# Zhou-DeBruijn Parsing

## Abstract

Zhou-DeBruijn Parsing is an approach to parsing lambda calculus that emphasizes unqiue parsing consistent with mathematical notation while enabling optimized normalization of expressions. During parsing, abstractions are directly initialized with the ability to store multiple binders to be consistent with the mathematical shorthand and also baked with DeBruijn indicies, all done during parsing. This allows simplification through semi-standard DeBruijn notation.

## Formal Definition

```
<expression> ::= <abstraction>
               | <application>
               | <variable>

<variable> ::= <identifier>

<abstraction> ::= "λ" <binders> "." <expression> ")"

<application> ::= "(" <expression> <expression> ")"
```

### Variables

Variables are any series of characters not reserved for other expressions. They consist of their `name`, the series of characters, as well as their `idx`, developed through finding the last instance of the name of the variable in the context stack.

### Abstractions

Abstractions start with a `λ`, followed by a space-seperated list of binders, then a `.`, and finally an expression. The binders are pushed into the context stack.

### Application

Applications consist of 2 adjacent expressions.

## Beta Reduction

For a $n$-binder abstraction

### Shift:

```math
\uparrow_c^i (n) =  \begin{array}{cc}
  \Big \{
    \begin{array}{cc}
      n & \text{if } n < c \\
      n+i & \text{otherwise}
    \end{array}
\end{array}
```

```math
\uparrow_c^i (\lambda^{\circ n}.e) =  \lambda.(\uparrow_{c+n}^{i+1} e)
```

```math
\uparrow_c^i (e_1 \space e_2) =  (\uparrow_c^i e_1)(\uparrow_c^i e_2)
```

### Substitution

```math
n\{e/m\} = \begin{array}{cc}
  \Big \{
    \begin{array}{cc}
      e & \text{if } n = m \\
      n & \text{otherwise}
    \end{array}
\end{array}
```

```math
(\lambda^{\circ n}.e_1)\{e/m\} =  \lambda.e_1\{(\uparrow_{n-1}^n e)/m+n\}
```

```math
(e_1 \space e_2)\{e/m\} =  (e_1\{e/m\})(e_2\{e/m\})
```

### Beta Reduction

```math
\beta \frac{}{
    (\lambda^{\circ n}.e_1)e_2 = \begin{array}{cc}
    \Big \{
        \begin{array}{cc}
        \uparrow_0^{-1} (e_1 \{\uparrow_0^1e_2 / 0\}) & \text{if } n = 1 \\
        (\lambda^{\circ n-1}.(\uparrow_{n-1}^{-1} (e_1 \{\uparrow_0^ne_2 / n-1\}))) & \text{otherwise}
        \end{array}
    \end{array}
}
```
