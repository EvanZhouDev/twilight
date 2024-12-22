const deepEqual = <T>(x: T, y: T): boolean => {
    const ok = Object.keys;
    const tx = typeof x;
    const ty = typeof y;
    return x && y && tx === "object" && tx === ty
        ? ok(x).length === ok(y).length &&
                ok(x).every((key) => deepEqual(x[key as keyof T], y[key as keyof T]))
        : x === y;
};

export default deepEqual;
