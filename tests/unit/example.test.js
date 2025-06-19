function add(a, b) {
    return a + b;
}
test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
});
