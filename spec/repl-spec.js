describe("lame", function() {
    it('has a lame test here to "fix" a bug in qasmine', function() {
        expect(true).toBe(true);
    });
});

describe("read()", function() {
    it('reads simple sexp', function() {
        expect(read('(alert "test")')).toEqual([ { s: 'alert' }, 'test' ]);
    });
    it('reads nested sexp', function() {
        expect(read('(alert (foo "bar"))')).toEqual([ { s: 'alert' }, [ { s: 'foo' }, 'bar' ] ]);
    });
});
