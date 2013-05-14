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
    it('reads complex sexp', function() {
        expect(read('(define factorial (lambda(n) (if (= n 0) 1 (* n (factorial (- n 1))))))')).toEqual(
                           [ { s: 'define' },
                             { s: 'factorial' },
                             [ { s: 'lambda' },
                               [ { s: 'n' } ],
                               [ { s: 'if' },
                                 [ { s: '=' },
                                   { s: 'n' },
                                   0
                                 ],
                                 1,
                                 [ { s: '*' },
                                   { s: 'n' },
                                   [ { s: 'factorial' },
                                     [ { s: '-' },
                                       { s: 'n' },
                                       1
                                     ]
                                   ]
                                 ]
                               ]
                             ]
                           ]);
    });
});
