Must Knows for Formatters:

1. Expressions are passed in as an AST tree, and must be returned as a String form. You must call `.toString()` on the expression to get the string representation.
2. All calls of toString() must have `this` passed into them, so that Twilight knows which formatter to use. Otherwise, it will use the DefaultFormatter.
3. A formatter may choose to extend the DefaultFormatter, and override the methods, or be completely custom. Note that
4. You may attach a Constructor, or any number of fields to store data (Note allowing you to access/modify these fields in before recursively accessing child nodes is why .toString(this) must be called on the Formatter level)
5. Applications are (for now) not accessible, as they have specifically defined rules that ensure the application order is correct and minimal
