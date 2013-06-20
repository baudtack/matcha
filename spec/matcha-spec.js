describe('lame', function() {
    it('has a lame test here to "fix" a bug in qasmine', function() {
        expect(true).toBe(true);
    });
});

describe('read()', function() {
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

describe('atomize()', function() {
    it('can atomize ints', function() {
        expect(atomize('10')).toBe(10);
        expect(atomize('100')).toBe(100);
        expect(atomize('42')).toBe(42);
    });

    it('can atomize floats', function() {
        expect(atomize('10.5')).toBe(10.5);
        expect(atomize('100.199')).toBe(100.199);
        expect(atomize('42.42')).toBe(42.42);
    });

    it('can atomize strings', function() {
        expect(atomize('"10.5"')).toBe('10.5');
        expect(atomize('"duck"')).toBe('duck');
        expect(atomize('"quack.5"')).toBe('quack.5');
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
        expect(evaluate(new Symbol('eval'))).toEqual(eval);
    });

    it('can evaluate numbers', function () {
        expect(evaluate(42)).toBe(42);
    });

    it('can evaluate define', function () {
        x = new Symbol('x');
        evaluate([new Symbol('define'), x, 42]);
        expect(GlobalEnv.lookup(x)).toBe(42);
    });

   it('can evaluate true if expressions', function() {
       expect(evaluate([new Symbol('if'),
                        [new Symbol('true')],
                        new Symbol('true'),
                        new Symbol('false')])).toBe(true);
   });

    it('can evaluate true if expressions with the == operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('=='), new Symbol('true'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate true if expressions with the = operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('='), new Symbol('true'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

   it('can evaluate false if expressions', function() {
       expect(evaluate([new Symbol('if'),
                        [new Symbol('false')],
                        new Symbol('true'),
                        new Symbol('false')],
                       new Env())).toBe(false);
   });

    it('can evaluate false if expressions with the == operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('=='), new Symbol('false'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate false if expressions with the = operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('='), new Symbol('false'), new Symbol('true')],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate true if expressions with the > operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>'), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });
    it('can evaluate false if expressions with the > operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>'), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate true if expressions with the < operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<'), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate false if expressions with the < operator', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<'), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate true if expressions with the >= operator with 2 and 1', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 2, 1],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate true if expressions with the >= operator with 2 and 2', function() {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 2, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate false if expressions with the >= operator with 1 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('>='), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate true if expressions with the <= operator with 1 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 1, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate true if expressions with the <= operator with 2 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 2, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate false if expressions with the <= operator with 3 and 2', function () {
        expect(evaluate([new Symbol('if'),
                         [new Symbol('<='), 3, 2],
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate true &&', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('true'),
                         new Symbol('true')])).toBe(true);
    });

    it('can evaluate false && no short curcuit', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('true'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate false && short ciruit', function () {
        expect(evaluate([new Symbol('&&'),
                         new Symbol('false'),
                         new Symbol('true')])).toBe(false);
    });

    it('can evaluate true || no short circuit', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('false'),
                         new Symbol('true')])).toBe(true);
    });

    it('can evaluate true || short circuit', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('true'),
                         new Symbol('false')])).toBe(true);
    });

    it('can evaluate false ||', function () {
        expect(evaluate([new Symbol('||'),
                         new Symbol('false'),
                         new Symbol('false')])).toBe(false);
    });

    it('can evaluate +', function() {
        expect(evaluate([new Symbol('+'), 41, 1])).toBe(42);
    });

    it('can evaluate + with 3 args', function() {
        expect(evaluate([new Symbol('+'), 40, 1, 1])).toBe(42);
    });

    it('can evaluate -', function() {
        expect(evaluate([new Symbol('-'), 43, 1])).toBe(42);
    });

    it('can evaluate - with 3 args', function() {
        expect(evaluate([new Symbol('-'), 44, 1, 1])).toBe(42);
    });

    it('can evaluate *', function() {
        expect(evaluate([new Symbol('*'), 42, 2])).toBe(84);
    });

    it('can evaluate * with 3 args', function() {
        expect(evaluate([new Symbol('*'), 42, 2, 2])).toBe(168);
    });

    it('can evaluate /', function() {
        expect(evaluate([new Symbol('/'), 84, 2])).toBe(42);
    });

    it('can evaluate / with 3 args', function() {
        expect(evaluate([new Symbol('/'), 168, 2, 2])).toBe(42);
    });

    it('can quote', function() {
        expect(evaluate([new Symbol('quote'), [10, 12]])).toEqual([10, 12]);
    });

    it('can evaluate lambda', function() {
        expect(evaluate([new Symbol('lambda'), [new Symbol('x')], [new Symbol('*'), new Symbol('x'), new Symbol('x')]])(2)).toBe(4);
    });

    it('can evaluate nested lambda', function() {
        expect(evaluate([new Symbol('lambda'), [new Symbol('x')], 
                         [new Symbol('lambda'), [new Symbol('y')],
                          [new Symbol('*'), new Symbol('x'), new Symbol('y')]]])(2)(5)).toBe(10);
    });

    it('can call a function', function() {
        evaluate([new Symbol('define'), new Symbol('square'), [new Symbol('lambda'), [new Symbol('x')], [new Symbol('*'), new Symbol('x'), new Symbol('x')]]]);
        expect(evaluate([new Symbol('square'), 2])).toBe(4);
    });

    it('can call a function twice', function() {
        evaluate([new Symbol('define'), new Symbol('square'), [new Symbol('lambda'), [new Symbol('x')], [new Symbol('*'), new Symbol('x'), new Symbol('x')]]]);
        expect(evaluate([new Symbol('square'), 2])).toBe(4);
        expect(evaluate([new Symbol('square'), 2])).toBe(4);
    });

    it('can call a recursive function', function() {
        evaluate([new Symbol('define'),
                  new Symbol('fib'),
                  [new Symbol('lambda'),
                   [new Symbol('x')],
                   [new Symbol('if'),
                    [new Symbol('<'), new Symbol('x'), 2],
                    new Symbol('x'),
                    [new Symbol('+'),
                     [new Symbol('fib'),
                      [new Symbol('-'),
                       new Symbol('x'),
                       1]],
                     [new Symbol('fib'),
                      [new Symbol('-'),
                       new Symbol('x'),
                       2]]]]]]);
        expect(evaluate([new Symbol('fib'), 5])).toBe(5);
    });


    it('can evaluate begin', function() {
        expect(evaluate([new Symbol('begin'), [new Symbol('define'), new Symbol('x'), 42], [new Symbol('*'), new Symbol('x'), 2]])).toBe(84);
    });

    it('can evaluate set!', function() {
        var e1 = new Env();
        var x = new Symbol('x');
        e1.set(x, 10);
        var e2 = new Env(e1);
        evaluate([new Symbol('set!'), x, 42], e2);
        expect(e1.lookup(x)).toBe(42);
    });
});


describe('evaluate() with read()', function() {
    it('can do lookups into javascript', function() {
        expect(evaluate(read('eval'))).toEqual(eval);
    });

    it('can evaluate numbers', function () {
        expect(evaluate(read('42'))).toBe(42);
    });

    it('can evaluate define', function () {
        evaluate(read('(define x 42)'));
        expect(GlobalEnv.lookup(x)).toBe(42);
    });

   it('can evaluate true if expressions', function() {
       expect(evaluate(read('(if (true) \
                                 true \
                                 false)'))).toBe(true);
   });

    it('can evaluate true if expressions with the == operator', function() {
        expect(evaluate(read('(if (== true true) \
                                  true \
                                  false)'))).toBe(true);
    });

    it('can evaluate true if expressions with the = operator', function() {
        expect(evaluate(read('(if (= true true) \
                                  true \
                                  false)'))).toBe(true);
    });

   it('can evaluate false if expressions', function() {
       expect(evaluate(read('(if (false) \
                                 true \
                                 false)'))).toBe(false);
   });

    it('can evaluate false if expressions with the == operator', function() {
        expect(evaluate(read('(if (== false true) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate false if expressions with the = operator', function() {
        expect(evaluate(read('(if (= false true) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate true if expressions with the > operator', function() {
        expect(evaluate(read('(if (> 2 1) \
                                  true \
                                  false)'))).toBe(true);
    });
    it('can evaluate false if expressions with the > operator', function() {
        expect(evaluate(read('(if (> 1 2) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate true if expressions with the < operator', function() {
        expect(evaluate(read('(if (< 1 2) \
                                  true \
                                  false)'))).toBe(true);
    });

    it('can evaluate false if expressions with the < operator', function() {
        expect(evaluate(read('(if (< 2 1) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate true if expressions with the >= operator with 2 and 1', function() {
        expect(evaluate(read('(if (>= 2 1) \
                                  true \
                                  false)'))).toBe(true);
    });

    it('can evaluate true if expressions with the >= operator with 2 and 2', function() {
        expect(evaluate(read('(if (>= 2 2) \
                                  true \
                                  false)'))).toBe(true);
    });
 
    it('can evaluate false if expressions with the >= operator with 1 and 2', function () {
        expect(evaluate(read('(if (>= 1 2) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate true if expressions with the <= operator with 1 and 2', function () {
        expect(evaluate(read('(if (<= 1 2) \
                                 true \
                                 false)'))).toBe(true);
    });

    it('can evaluate true if expressions with the <= operator with 2 and 2', function () {
        expect(evaluate(read('(if (<= 2 2) \
                                  true \
                                  false)'))).toBe(true);
    });

    it('can evaluate false if expressions with the <= operator with 3 and 2', function () {
        expect(evaluate(read('(if (<= 3 2) \
                                  true \
                                  false)'))).toBe(false);
    });

    it('can evaluate true &&', function () {
        expect(evaluate(read('(&& true true)'))).toBe(true);
    });

    it('can evaluate false && no short curcuit', function () {
        expect(evaluate(read('(&& true false)'))).toBe(false);
    });

    it('can evaluate false && short ciruit', function () {
        expect(evaluate(read('(&& false true)'))).toBe(false);
    });

    it('can evaluate true || no short circuit', function () {
        expect(evaluate(read('(|| false true)'))).toBe(true);
    });

    it('can evaluate true || short circuit', function () {
        expect(evaluate(read('(|| true false)'))).toBe(true);
    });

    it('can evaluate false ||', function () {
        expect(evaluate(read('(|| false false)'))).toBe(false);
    });

    it('can evaluate +', function() {
        expect(evaluate(read('(+ 41 1)'))).toBe(42);
    });

    it('can evaluate + with 3 args', function() {
        expect(evaluate(read('(+ 40 1 1)'))).toBe(42);
    });

    it('can evaluate -', function() {
        expect(evaluate(read('(- 43 1)'))).toBe(42);
    });

    it('can evaluate - with 3 args', function() {
        expect(evaluate(read('(- 44 1 1)'))).toBe(42);
    });

    it('can evaluate *', function() {
        expect(evaluate(read('(* 42 2)'))).toBe(84);
    });

    it('can evaluate * with 3 args', function() {
        expect(evaluate(read('(* 42 2 2)'))).toBe(168);
    });

    it('can evaluate /', function() {
        expect(evaluate(read('(/ 84 2)'))).toBe(42);
    });

    it('can evaluate / with 3 args', function() {
        expect(evaluate(read('(/ 168 2 2)'))).toBe(42);
    });

    it('can quote', function() {
        expect(evaluate(read('(quote (10 12))'))).toEqual([10, 12]);
    });

    it('can evaluate lambda', function() {
        expect(evaluate(read('(lambda (x) (* x x))'))(2)).toBe(4);
    });

    it('can evaluate nested lambda', function() {
        expect(evaluate(read('(lambda (x) \
                                 (lambda (y) \
                                   (* x y)))'))(2)(5)).toBe(10);
    });

    it('can call a function', function() {
        evaluate(read('(define square (lambda (x) (* x x)))'));
        expect(evaluate(read('(square 2)'))).toBe(4);
    });

    it('can call a function twice', function() {
        evaluate(read('(define square (lambda (x) (* x x)))'));
        expect(evaluate(read('(square 2)'))).toBe(4);
        expect(evaluate(read('(square 2)'))).toBe(4);
    });

    it('can call a recursive function', function() {
        evaluate(read('(define fib \
                          (lambda (x) \
                            (if (< x 2) \
                                x \
                                (+ (fib (- x 1)) \
                                   (fib (- x 2))))))'));
        expect(evaluate(read('(fib 5)'))).toBe(5);
    });


    it('can evaluate begin', function() {
        expect(evaluate(read('(begin \
                                 (define x 42) \
                                 (* x 2))'))).toBe(84);
    });

    it('can evaluate set!', function() {
        var e1 = new Env();
        var x = new Symbol('x');
        e1.set(x, 10);
        var e2 = new Env(e1);
        evaluate(read('(set! x 42)'), e2);
        expect(e1.lookup(x)).toBe(42);
    });

    it('can handle strings with spaces in them', function() {
        evaluate(read('(define x "ducks are nice")'));
        expect(evaluate(read('x'))).toBe("ducks are nice");
    });
 });
