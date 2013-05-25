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

describe('Env()', function() {
    it('can set()', function() {
        e = new Env();
        e.set(new Symbol('x'), 42);
        expect(e.local['x']).toBe(42);
    });

    it('can lookup()', function() {
        e = new Env();
        e.set(new Symbol('x'), 42);
        expect(e.lookup(new Symbol('x'))).toBe(42);

    });
});

describe('evaluate()', function() {
    it('can do lookups into javascript', function() {
        expect(evaluate(new Symbol('eval'), new Env())).toEqual(eval);
    });

    it('can evaluate numbers', function () {
        expect(evaluate(42)).toBe(42);
    });

    it('can evaluate define', function () {
        e = new Env();
        x = new Symbol('x');
        evaluate([new Symbol('define'), x, 42], e);
        expect(e.lookup(x)).toBe(42);
    });

   it("can evaluate true if expressions", function() {
       expect(evaluate([new Symbol('if'),
                        [new Symbol('true')],
                        new Symbol('true'),
                        new Symbol('false')],
                       new Env())).toBe(true);
   });

    it("can evaluate true if expressions with the == operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('=='), new Symbol('true'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it("can evaluate true if expressions with the = operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('='), new Symbol('true'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

   it("can evaluate false if expressions", function() {
       expect(evaluate([new Symbol('if'),
                        [new Symbol('false')],
                        new Symbol('true'),
                        new Symbol('false')],
                       new Env())).toBe(false);
   });

    it("can evaluate false if expressions with the == operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('=='), new Symbol('false'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it("can evaluate false if expressions with the = operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('='), new Symbol('false'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it("can evaluate true if expressions with the > operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>'), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });
    it("can evaluate false if expressions with the > operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>'), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it("can evaluate true if expressions with the < operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<'), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it("can evaluate false if expressions with the < operator", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<'), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it("can evaluate true if expressions with the >= operator with 2 and 1", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it("can evaluate true if expressions with the >= operator with 2 and 2", function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 2, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it('can evaluate false if expressions with the >= operator with 1 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it('can evaluate true if expressions with the <= operator with 1 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it('can evaluate true if expressions with the <= operator with 2 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 2, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it('can evaluate false if expressions with the <= operator with 3 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 3, 2],
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it('can evaluate true &&', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('true'),
                         new Symbol('true')],
                        new Env())).toBe(true);
    });

    it('can evaluate false && no short curcuit', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it('can evaluate false && short ciruit', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('false'),
                         new Symbol('true')],
                        new Env())).toBe(false);
    });

    it('can evaluate true || no short circuit', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('false'),
                         new Symbol('true')],
                        new Env())).toBe(true);
    });

    it('can evaluate true || short circuit', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('true'),
                         new Symbol('false')],
                        new Env())).toBe(true);
    });

    it('can evaluate false ||', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('false'),
                         new Symbol('false')],
                        new Env())).toBe(false);
    });

    it("can evaluate +", function() {
        expect(evaluate([new Symbol('+'), 41, 1], new Env())).toBe(42);
    });

    it("can evaluate -", function() {
        expect(evaluate([new Symbol('-'), 43, 1], new Env())).toBe(42);
    });

    it("can evaluate *", function() {
        expect(evaluate([new Symbol('*'), 42, 2], new Env())).toBe(84);
    });

    it("can evaluate /", function() {
        expect(evaluate([new Symbol('/'), 84, 2], new Env())).toBe(42);
    });

    it("can quote", function() {
        expect(evaluate([new Symbol('quote'), [10, 12]], new Env())).toEqual([10, 12]);
    });

    it("can evaluate lambda", function() {
        expect(evaluate([new Symbol('lambda'), [new Symbol('x')], [new Symbol('*'), new Symbol('x'), new Symbol('x')]], new Env())(2)).toBe(4);
    });

    it("can evaluate nested lambda", function() {
        expect(evaluate([new Symbol('lambda'), [new Symbol('x')], 
                         [new Symbol('lambda'), [new Symbol('y')],
                          [new Symbol('*'), new Symbol('x'), new Symbol('y')]]], new Env())(2)(5)).toBe(10);
    });

    it("can call a function", function() {
        var e = new Env();
        e.set(new Symbol('square'), [new Symbol('lambda'), [new Symbol('x')], [new Symbol('*'), new Symbol('x'), new Symbol('x')]]);
        expect(evaluate([new Symbol('square'), 2], e)).toBe(4);
    });

    it("can evaluate begin", function() {
        expect(evaluate([new Symbol('begin'), [new Symbol('define'), new Symbol('x'), 42], [new Symbol('*'), new Symbol('x'), 2]], new Env())).toBe(84);
    });
});
