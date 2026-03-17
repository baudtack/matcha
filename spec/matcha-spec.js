describe('new Matcha.Symbol()', function() {
  it('creates a new object', function() {
    expect(new Matcha.Symbol('x')).toEqual(new Matcha.Symbol('x'));
  });

  it('assigns the argument to the s property', function() {
    let val = 'x';
    let symb = new Matcha.Symbol(val);
    expect(symb.s).toEqual(val);
  });
});

describe('Matcha.read()', function() {
  it('reads simple sexp', function() {
    expect(Matcha.read('(alert "test")')).toEqual([new Matcha.Symbol('alert'), 'test']);
  });

  it('reads nested sexp', function() {
    expect(Matcha.read('(alert (foo "bar"))')).toEqual([new Matcha.Symbol('alert'), [new Matcha.Symbol('foo'), 'bar']]);
  });

  it('reads complex sexp', function() {
    expect(Matcha.read('(define factorial (lambda(n) (if (= n 0) 1 (* n (factorial (- n 1))))))')).toEqual(
                           [new Matcha.Symbol('define'),
                             new Matcha.Symbol('factorial'),
                             [new Matcha.Symbol('lambda'),
                               [new Matcha.Symbol('n')],
                               [new Matcha.Symbol('if'),
                                 [new Matcha.Symbol('='),
                                   new Matcha.Symbol('n'),
                                   0
                                 ],
                                 1,
                                 [new Matcha.Symbol('*'),
                                   new Matcha.Symbol('n'),
                                   [new Matcha.Symbol('factorial'),
                                     [new Matcha.Symbol('-'),
                                       new Matcha.Symbol('n'),
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
    expect(Matcha.atomize('10')).toBe(10);
    expect(Matcha.atomize('100')).toBe(100);
    expect(Matcha.atomize('42')).toBe(42);
  });

  it('can atomize floats', function() {
    expect(Matcha.atomize('10.5')).toBe(10.5);
    expect(Matcha.atomize('100.199')).toBe(100.199);
    expect(Matcha.atomize('42.42')).toBe(42.42);
  });

  it('can atomize strings', function() {
    expect(Matcha.atomize('"10.5"')).toBe('10.5');
    expect(Matcha.atomize('"duck"')).toBe('duck');
    expect(Matcha.atomize('"quack.5"')).toBe('quack.5');
  });
});

describe('Env()', function() {
  it('can set()', function() {
    e = new Matcha.Env();
    e.set(new Matcha.Symbol('x'), 42);
    expect(e.local['x']).toBe(42);
  });

  it('can lookup()', function() {
    e = new Matcha.Env();
    e.set(new Matcha.Symbol('x'), 42);
    expect(e.lookup(new Matcha.Symbol('x'))).toBe(42);

  });
});

describe('Matcha.evaluate()', function() {
  it('can do lookups into javascript', function() {
    expect(Matcha.evaluate(new Matcha.Symbol('eval'))).toEqual(eval);
  });

  it('can evaluate numbers', function() {
    expect(Matcha.evaluate(42)).toBe(42);
  });

  it('can evaluate define', function() {
    x = new Matcha.Symbol('x');
    Matcha.evaluate([new Matcha.Symbol('define'), x, 42]);
    expect(Matcha.GlobalEnv.lookup(x)).toBe(42);
  });

  it('can evaluate true if expressions', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                        [new Matcha.Symbol('true')],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate true if expressions with the == operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                                [new Matcha.Symbol('=='),
                                 new Matcha.Symbol('true'),
                                 new Matcha.Symbol('true')],
                                new Matcha.Symbol('true'),
                                new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate true if expressions with the = operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('='), new Matcha.Symbol('true'), new Matcha.Symbol('true')],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate false if expressions', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                        [new Matcha.Symbol('false')],
                        new Matcha.Symbol('true'),
                        new Matcha.Symbol('false')],
      new Matcha.Env())).toBe(false);
  });

  it('can evaluate false if expressions with the == operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('=='), new Matcha.Symbol('false'), new Matcha.Symbol('true')],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate false if expressions with the = operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('='), new Matcha.Symbol('false'), new Matcha.Symbol('true')],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate true if expressions with the > operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('>'), 2, 1],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });
  it('can evaluate false if expressions with the > operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('>'), 1, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate true if expressions with the < operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('<'), 1, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate false if expressions with the < operator', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('<'), 2, 1],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate true if expressions with the >= operator with 2 and 1', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('>='), 2, 1],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate true if expressions with the >= operator with 2 and 2', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('>='), 2, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate false if expressions with the >= operator with 1 and 2', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('>='), 1, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate true if expressions with the <= operator with 1 and 2', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('<='), 1, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate true if expressions with the <= operator with 2 and 2', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('<='), 2, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate false if expressions with the <= operator with 3 and 2', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('if'),
                         [new Matcha.Symbol('<='), 3, 2],
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate true &&', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('&&'),
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('true')])).toBe(true);
  });

  it('can evaluate false && no short curcuit', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('&&'),
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate false && short ciruit', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('&&'),
                         new Matcha.Symbol('false'),
                         new Matcha.Symbol('true')])).toBe(false);
  });

  it('can evaluate true || no short circuit', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('||'),
                         new Matcha.Symbol('false'),
                         new Matcha.Symbol('true')])).toBe(true);
  });

  it('can evaluate true || short circuit', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('||'),
                         new Matcha.Symbol('true'),
                         new Matcha.Symbol('false')])).toBe(true);
  });

  it('can evaluate false ||', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('||'),
                         new Matcha.Symbol('false'),
                         new Matcha.Symbol('false')])).toBe(false);
  });

  it('can evaluate +', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('+'), 41, 1])).toBe(42);
  });

  it('can evaluate + with 3 args', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('+'), 40, 1, 1])).toBe(42);
  });

  it('can evaluate -', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('-'), 43, 1])).toBe(42);
  });

  it('can evaluate - with 3 args', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('-'), 44, 1, 1])).toBe(42);
  });

  it('can evaluate *', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('*'), 42, 2])).toBe(84);
  });

  it('can evaluate * with 3 args', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('*'), 42, 2, 2])).toBe(168);
  });

  it('can evaluate /', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('/'), 84, 2])).toBe(42);
  });

  it('can evaluate / with 3 args', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('/'), 168, 2, 2])).toBe(42);
  });

  it('can quote', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('quote'), [10, 12]])).toEqual([10, 12]);
  });

  it('can evaluate lambda', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('lambda'), [new Matcha.Symbol('x')], [new Matcha.Symbol('*'), new Matcha.Symbol('x'), new Matcha.Symbol('x')]])(2)).toBe(4);
  });

  it('can evaluate nested lambda', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('lambda'), [new Matcha.Symbol('x')],
                         [new Matcha.Symbol('lambda'), [new Matcha.Symbol('y')],
                          [new Matcha.Symbol('*'), new Matcha.Symbol('x'), new Matcha.Symbol('y')]]])(2)(5)).toBe(10);
  });

  it('can call a function', function() {
    Matcha.evaluate([new Matcha.Symbol('define'), new Matcha.Symbol('square'), [new Matcha.Symbol('lambda'), [new Matcha.Symbol('x')], [new Matcha.Symbol('*'), new Matcha.Symbol('x'), new Matcha.Symbol('x')]]]);
    expect(Matcha.evaluate([new Matcha.Symbol('square'), 2])).toBe(4);
  });

  it('can call a function twice', function() {
    Matcha.evaluate([new Matcha.Symbol('define'), new Matcha.Symbol('square'), [new Matcha.Symbol('lambda'), [new Matcha.Symbol('x')], [new Matcha.Symbol('*'), new Matcha.Symbol('x'), new Matcha.Symbol('x')]]]);
    expect(Matcha.evaluate([new Matcha.Symbol('square'), 2])).toBe(4);
    expect(Matcha.evaluate([new Matcha.Symbol('square'), 2])).toBe(4);
  });

  it('can call a recursive function', function() {
    Matcha.evaluate([new Matcha.Symbol('define'),
                  new Matcha.Symbol('fib'),
                  [new Matcha.Symbol('lambda'),
                   [new Matcha.Symbol('x')],
                   [new Matcha.Symbol('if'),
                    [new Matcha.Symbol('<'), new Matcha.Symbol('x'), 2],
                    new Matcha.Symbol('x'),
                    [new Matcha.Symbol('+'),
                     [new Matcha.Symbol('fib'),
                      [new Matcha.Symbol('-'),
                       new Matcha.Symbol('x'),
                       1]],
                     [new Matcha.Symbol('fib'),
                      [new Matcha.Symbol('-'),
                       new Matcha.Symbol('x'),
                       2]]]]]]);
    expect(Matcha.evaluate([new Matcha.Symbol('fib'), 5])).toBe(5);
  });


  it('can evaluate begin', function() {
    expect(Matcha.evaluate([new Matcha.Symbol('begin'), [new Matcha.Symbol('define'), new Matcha.Symbol('x'), 42], [new Matcha.Symbol('*'), new Matcha.Symbol('x'), 2]])).toBe(84);
  });

  it('can evaluate set!', function() {
    let e1 = new Matcha.Env();
    let x = new Matcha.Symbol('x');
    e1.set(x, 10);
    let e2 = new Matcha.Env(e1);
    Matcha.evaluate([new Matcha.Symbol('set!'), x, 42], e2);
    expect(e1.lookup(x)).toBe(42);
  });
});


describe('eval()', function() {
  it('can do lookups into javascript', function() {
    expect(Matcha.eval('eval')).toEqual(eval);
  });

  it('can evaluate numbers', function() {
    expect(Matcha.eval('42')).toBe(42);
  });

  it('can evaluate define', function() {
    let x = new Matcha.Symbol('x');
    Matcha.eval('(define x 42)');
    expect(Matcha.GlobalEnv.lookup(x)).toBe(42);
  });

  it('can evaluate true if expressions', function() {
    expect(Matcha.eval('(if (true) \
                                 true \
                                 false)')).toBe(true);
  });

  it('can evaluate true if expressions with the == operator', function() {
    expect(Matcha.eval('(if (== true true) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate true if expressions with the = operator', function() {
    expect(Matcha.eval('(if (= true true) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate false if expressions', function() {
    expect(Matcha.eval('(if (false) \
                                 true \
                                 false)')).toBe(false);
  });

  it('can evaluate false if expressions with the == operator', function() {
    expect(Matcha.eval('(if (== false true) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate false if expressions with the = operator', function() {
    expect(Matcha.eval('(if (= false true) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate true if expressions with the > operator', function() {
    expect(Matcha.eval('(if (> 2 1) \
                                  true \
                                  false)')).toBe(true);
  });
  it('can evaluate false if expressions with the > operator', function() {
    expect(Matcha.eval('(if (> 1 2) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate true if expressions with the < operator', function() {
    expect(Matcha.eval('(if (< 1 2) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate false if expressions with the < operator', function() {
    expect(Matcha.eval('(if (< 2 1) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate true if expressions with the >= operator with 2 and 1', function() {
    expect(Matcha.eval('(if (>= 2 1) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate true if expressions with the >= operator with 2 and 2', function() {
    expect(Matcha.eval('(if (>= 2 2) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate false if expressions with the >= operator with 1 and 2', function() {
    expect(Matcha.eval('(if (>= 1 2) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate true if expressions with the <= operator with 1 and 2', function() {
    expect(Matcha.eval('(if (<= 1 2) \
                                 true \
                                 false)')).toBe(true);
  });

  it('can evaluate true if expressions with the <= operator with 2 and 2', function() {
    expect(Matcha.eval('(if (<= 2 2) \
                                  true \
                                  false)')).toBe(true);
  });

  it('can evaluate false if expressions with the <= operator with 3 and 2', function() {
    expect(Matcha.eval('(if (<= 3 2) \
                                  true \
                                  false)')).toBe(false);
  });

  it('can evaluate true &&', function() {
    expect(Matcha.eval('(&& true true)')).toBe(true);
  });

  it('can evaluate false && no short curcuit', function() {
    expect(Matcha.eval('(&& true false)')).toBe(false);
  });

  it('can evaluate false && short ciruit', function() {
    expect(Matcha.eval('(&& false true)')).toBe(false);
  });

  it('can evaluate true || no short circuit', function() {
    expect(Matcha.eval('(|| false true)')).toBe(true);
  });

  it('can evaluate true || short circuit', function() {
    expect(Matcha.eval('(|| true false)')).toBe(true);
  });

  it('can evaluate false ||', function() {
    expect(Matcha.eval('(|| false false)')).toBe(false);
  });

  it('can evaluate +', function() {
    expect(Matcha.eval('(+ 41 1)')).toBe(42);
  });

  it('can evaluate + with 3 args', function() {
    expect(Matcha.eval('(+ 40 1 1)')).toBe(42);
  });

  it('can evaluate -', function() {
    expect(Matcha.eval('(- 43 1)')).toBe(42);
  });

  it('can evaluate - with 3 args', function() {
    expect(Matcha.eval('(- 44 1 1)')).toBe(42);
  });

  it('can evaluate *', function() {
    expect(Matcha.eval('(* 42 2)')).toBe(84);
  });

  it('can evaluate * with 3 args', function() {
    expect(Matcha.eval('(* 42 2 2)')).toBe(168);
  });

  it('can evaluate /', function() {
    expect(Matcha.eval('(/ 84 2)')).toBe(42);
  });

  it('can evaluate / with 3 args', function() {
    expect(Matcha.eval('(/ 168 2 2)')).toBe(42);
  });

  it('can quote', function() {
    expect(Matcha.eval('(quote (10 12))')).toEqual([10, 12]);
  });

  it('can evaluate lambda', function() {
    expect(Matcha.eval('(lambda (x) (* x x))')(2)).toBe(4);
  });

  it('can evaluate nested lambda', function() {
    expect(Matcha.eval('(lambda (x) \
                                 (lambda (y) \
                                   (* x y)))')(2)(5)).toBe(10);
  });

  it('can call a function', function() {
    Matcha.eval('(define square (lambda (x) (* x x)))');
    expect(Matcha.eval('(square 2)')).toBe(4);
  });

  it('can call a function twice', function() {
    Matcha.eval('(define square (lambda (x) (* x x)))');
    expect(Matcha.eval('(square 2)')).toBe(4);
    expect(Matcha.eval('(square 2)')).toBe(4);
  });

  it('can call a recursive function', function() {
    Matcha.eval('(define fib \
                          (lambda (x) \
                            (if (< x 2) \
                                x \
                                (+ (fib (- x 1)) \
                                   (fib (- x 2))))))');
    expect(Matcha.eval('(fib 5)')).toBe(5);
  });


  it('can evaluate begin', function() {
    expect(Matcha.eval('(begin \
                                 (define x 42) \
                                 (* x 2))')).toBe(84);
  });

  it('can evaluate set!', function() {
    let e1 = new Matcha.Env();
    let x = new Matcha.Symbol('x');
    e1.set(x, 10);
    let e2 = new Matcha.Env(e1);
    Matcha.evaluate(Matcha.read('(set! x 42)'), e2);
    expect(e1.lookup(x)).toBe(42);
  });

  it('can handle strings with spaces in them', function() {
    Matcha.eval('(define x "ducks are nice")');
    expect(Matcha.eval('x')).toBe("ducks are nice");
  });

  it('can evaluate begin with lambdas', function() {
    Matcha.eval('(define foo (begin (define x (lambda (y) (+ y 2))) (x 40)))');
    expect(Matcha.eval('foo')).toBe(42);
  });
});