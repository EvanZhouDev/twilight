// sum.test.js
import { expect, test } from "vitest";
import AST from "#parser/ast.js";
import { parseLine, parseSource } from "#parser/index.js";

test("Single Binder Abstraction", () => {
	const ast = parseLine("\\x.x");
	expect(ast).toStrictEqual(new AST.Abstraction(["x"], new AST.Variable("x")));
});

test("Unexpected Token Error", () => {
	expect(() => parseLine("\\\\x.x")).toThrowError(/Unexpected token/);
	expect(() => parseLine("\\x..x")).toThrowError(/Unexpected token/);
	expect(() => parseLine("\\x.(x")).toThrowError(/Unexpected token/);
	expect(() => parseLine("\\x.)x")).toThrowError(/Unexpected token/);
	expect(() => parseLine("(\\x.(x)).")).toThrowError(/Unexpected token/);
});

test("Multiple Binder Abstractions", () => {
	const ast = parseLine("\\x y.x");
	expect(ast).toStrictEqual(
		new AST.Abstraction(["x", "y"], new AST.Variable("x"))
	);
});

test("Parenthesized Application w/o Space", () => {
	const ast = parseLine("(\\x y.x)x");
	expect(ast).toStrictEqual(
		new AST.Application(
			new AST.Abstraction(["x", "y"], new AST.Variable("x")),
			new AST.Variable("x")
		)
	);
});
test("Parenthesized Application w/ Space", () => {
	const ast = parseLine("(\\x y.x) x");
	expect(ast).toStrictEqual(
		new AST.Application(
			new AST.Abstraction(["x", "y"], new AST.Variable("x")),
			new AST.Variable("x")
		)
	);
});

test("In-Abstraction Application", () => {
	const ast = parseLine("(\\x y.x y)");
	expect(ast).toStrictEqual(
		new AST.Abstraction(
			["x", "y"],
			new AST.Application(new AST.Variable("x"), new AST.Variable("y"))
		)
	);
});

test("Abstraction to Abstraction Application", () => {
	const ast = parseLine("(\\x y.x y)(\\x.x)");
	expect(ast).toStrictEqual(
		new AST.Application(
			new AST.Abstraction(
				["x", "y"],
				new AST.Application(new AST.Variable("x"), new AST.Variable("y"))
			),
			new AST.Abstraction(["x"], new AST.Variable("x"))
		)
	);
});

test("Assignment", () => {
	const ast = parseLine("var = \\x.x");
	expect(ast).toStrictEqual(
		new AST.Assignment("var", new AST.Abstraction(["x"], new AST.Variable("x")))
	);
});

test("Multi-Line Parse Test", () => {
	const ast = parseSource("var = \\x.x\n(\\x y.x y)(\\x.x)");
	expect(ast).toStrictEqual([
		new AST.Assignment(
			"var",
			new AST.Abstraction(["x"], new AST.Variable("x"))
		),
		new AST.Application(
			new AST.Abstraction(
				["x", "y"],
				new AST.Application(new AST.Variable("x"), new AST.Variable("y"))
			),
			new AST.Abstraction(["x"], new AST.Variable("x"))
		),
	]);
});
