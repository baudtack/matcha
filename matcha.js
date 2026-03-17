/*  matcha lisp - a lisp implementation in javascript
    Copyright (C) 2013-2026 David Kerschner

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

const Matcha = {
  Symbol: function Symbol(s) {
      this.s = s;
  },

  Env: function Env(outer) {
    this.outer = outer;
    this.local = [];
    this.lookup = function(symbol) {
        if (typeof this.local[symbol.s] === 'undefined') {
            if (typeof this.outer === 'undefined') {
                return eval(symbol.s);
            } else {
                return this.outer.lookup(symbol);
            }
        } else {
            return this.local[symbol.s];
        }
    }
    this.set = function(symbol, value) {
        this.local[symbol.s] = value;
    }
    this.find = function(symbol) {
        if (typeof this.local[symbol.s] === 'undefined') {
            if (typeof this.outer === 'undefined') {
                return undefined;
            } else {
                return this.outer.find(symbol);
            }
        } else {
            return this;
        }
    };
  },

  ops_with_multiple_args: (op) => {
    return function () {
        let args = Array.prototype.slice.call(arguments, 0);
        let collector = args.shift();
        for (let i = 0; i < args.length; i++) {
            collector = op(collector, args[i]);
        }
        return collector;
    };
  },

  GlobalEnv: null,

  tokenize: (s) => {
    let tokens = s.replace(/\(/g, ' ( ').replace(/\)/g, ' )').split(' ').filter(function (item) {
        return item != '';
    });

    for(let i = 0; i < tokens.length; i++) {
        let tok = tokens[i];
        if (typeof tok !== 'undefined') {
            if(tok[0] === '"' && tok[tok.length-1] !== '"') {
                let cont = true;
                let j = i;
                while(cont) {
                    j++;
                    tok +=  ' ' + tokens[j];
                    delete tokens[j];

                    if(tok[tok.length-1] === '"') {
                        cont = false;
                    }
                }
                tokens[i] = tok;
            }
        }
    }

    return tokens.filter(function(item) {
        if(typeof item !== undefined) {
            return item;
        }
    });
   }, 

  atomize: (item) => {
    if (item[0] === '"') {
        return item.substring(1, item.length - 1);
    } else if (isNaN(parseFloat(item)) === false) {
        return parseFloat(item);
    } else {
        return new Matcha.Symbol(item);
    }
  },

  parse: (tokens, tree) => {
    if (tokens.length === 0) {
        throw "End of file during parsing";
    }

    let token = tokens.shift();
    if (token === '(') {
        while (tokens[0] != ')') {
            tree.push( Matcha.parse(tokens, []));
        }
        tokens.shift();
        return tree;
    } else if (token === ')') {
        throw "Parse error";
    } else {
        return Matcha.atomize(token);
    }

  },

  read: (s) => {
    return Matcha.parse(Matcha.tokenize(s), []);
  },

  make_lambda: (env, arglist, body) => {
    return function() {
        let lambda_env = new Matcha.Env(env);
        let args = Array.prototype.slice.call(arguments, 0);
        for (let i = 0; i < args.length; i++) {
            lambda_env.set(arglist[i], args[i]);
        }
        return Matcha.evaluate(body, lambda_env);
    }
  },

  evaluate: (s, env) => {
    if(typeof env === 'undefined') env = Matcha.GlobalEnv;

    if (s instanceof Matcha.Symbol) {
        return env.lookup(s);
    } else if(!(s instanceof Array)) {
        return s;
    } else if(s.length === 1) {
        return Matcha.evaluate(s[0], env);
    } else if(s[0].s === 'quote') {
        return s[1];
    } else if(s[0].s === 'define') {
        s.shift();
        let symbol = s.shift();
        env.set(symbol, Matcha.evaluate(s, env));
    } else if(s[0].s === 'set!') {
        s.shift();
        let symbol = s.shift();
        let e = env.find(symbol);
        if(e === undefined) {
            throw 'symbol ' + symbol.s + ' undefined';
        }
        e.set(symbol, s.shift());

    } else if (s[0].s === 'if') {
        return Matcha.evaluate((Matcha.evaluate(s[1], env) ? s[2] : s[3]), env);
    } else if(s[0].s === 'lambda') {
        return Matcha.make_lambda(env, s[1], s[2]);
    }  else if(s[0].s === 'begin') {
        s.shift();
        let ret = null;
        for (let i = 0; i < s.length; i++) {
            ret = Matcha.evaluate(s[i], env);
        }
        return ret;
    } else {
        let proc = env.lookup(s[0]);
        let args = s.slice(1).map(function(x) { return Matcha.evaluate(x, env); });
        return proc.apply(null, args);
    }
  },
  eval: (s) => { return Matcha.evaluate(Matcha.read(s)); },
};

Matcha.GlobalEnv = new Matcha.Env();
Matcha.GlobalEnv.set(new Matcha.Symbol('='), function(x, y) { return x === y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('=='), Matcha.GlobalEnv.lookup(new Matcha.Symbol('=')));
Matcha.GlobalEnv.set(new Matcha.Symbol('==='), Matcha.GlobalEnv.lookup(new Matcha.Symbol('=')));
Matcha.GlobalEnv.set(new Matcha.Symbol('>'), function(x, y) { return x > y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('>='), function(x, y) { return x >= y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('<'), function(x, y) { return x < y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('<='), function(x, y) { return x <= y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('and'), function(x, y) { return x && y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('&&'), Matcha.GlobalEnv.lookup(new Matcha.Symbol('and')));
Matcha.GlobalEnv.set(new Matcha.Symbol('or'), function(x, y) { return x || y; });
Matcha.GlobalEnv.set(new Matcha.Symbol('||'), Matcha.GlobalEnv.lookup(new Matcha.Symbol('or')));
Matcha.GlobalEnv.set(new Matcha.Symbol('+'), Matcha.ops_with_multiple_args(function(x, y) { return x + y; }));
Matcha.GlobalEnv.set(new Matcha.Symbol('-'), Matcha.ops_with_multiple_args(function(x, y) { return x - y; }));
Matcha.GlobalEnv.set(new Matcha.Symbol('*'), Matcha.ops_with_multiple_args(function(x, y) { return x * y; }));
Matcha.GlobalEnv.set(new Matcha.Symbol('/'), Matcha.ops_with_multiple_args(function(x, y) { return x / y; }));

/*function console_repl() {
    //requires node.js with readline module
    let readline = require('readline');
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let cont = true;
    rl.setPrompt('> ');
    rl.prompt();
    rl.on('line', function(response) {
        if (response !== '(exit)') {
            console.log(Matcha.evaluate(Matcha.read(response)));
            rl.prompt();
        } else {
            cont = false;
            rl.close();
        }
    });
} */
