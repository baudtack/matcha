/*  matcha lisp - a lisp implementation in javascript
    Copyright (C) 2013 David Kerschner

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

function Symbol(s) {
    this.s = s;
}

function Env(outer) {
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
}


function ops_with_multiple_args(op) {
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var collector = args.shift();
        for (var i = 0; i < args.length; i++) {
            collector = op(collector, args[i]);
        }
        return collector;
    };
}

var GlobalEnv = new Env();
GlobalEnv.set(new Symbol('='), function(x, y) { return x === y; });
GlobalEnv.set(new Symbol('=='), GlobalEnv.lookup(new Symbol('=')));
GlobalEnv.set(new Symbol('==='), GlobalEnv.lookup(new Symbol('=')));
GlobalEnv.set(new Symbol('>'), function(x, y) { return x > y; });
GlobalEnv.set(new Symbol('>='), function(x, y) { return x >= y; });
GlobalEnv.set(new Symbol('<'), function(x, y) { return x < y; });
GlobalEnv.set(new Symbol('<='), function(x, y) { return x <= y; });
GlobalEnv.set(new Symbol('and'), function(x, y) { return x && y; });
GlobalEnv.set(new Symbol('&&'), GlobalEnv.lookup(new Symbol('and')));
GlobalEnv.set(new Symbol('or'), function(x, y) { return x || y; });
GlobalEnv.set(new Symbol('||'), GlobalEnv.lookup(new Symbol('or')));
GlobalEnv.set(new Symbol('+'), ops_with_multiple_args(function(x, y) { return x + y; }));
GlobalEnv.set(new Symbol('-'), ops_with_multiple_args(function(x, y) { return x - y; }));
GlobalEnv.set(new Symbol('*'), ops_with_multiple_args(function(x, y) { return x * y; }));
GlobalEnv.set(new Symbol('/'), ops_with_multiple_args(function(x, y) { return x / y; }));


function tokenize(s) {
    var tokens = s.replace(/\(/g, ' ( ').replace(/\)/g, ' )').split(' ').filter(function (item) {
        return item != '';
    });

    for(var i = 0; i < tokens.length; i++) {
        tok = tokens[i];
        if (typeof tok !== 'undefined') {
            if(tok[0] === '"' && tok[tok.length-1] !== '"') {
                cont = true;
                j = i;
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
}

function atomize(item) {
    if (item[0] === '"') {
        return item.substring(1, item.length - 1);
    } else if (isNaN(parseFloat(item)) === false) {
        return parseFloat(item);
    } else {
        return new Symbol(item);
    }
}

function parse(tokens, tree) {
    if (tokens.length === 0) {
        throw "End of file during parsing";
    }

    token = tokens.shift();
    if (token === '(') {
        while (tokens[0] != ')') {
            tree.push(parse(tokens, []));
        }
        tokens.shift();
        return tree;
    } else if (token === ')') {
        throw "Parse error";
    } else {
        return atomize(token);
    }

}

function read(s) {
    return parse(tokenize(s), []);
}

function make_lambda(env, arglist, body) {
    return function() {
        var lambda_env = new Env(env);
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0; i < args.length; i++) {
            lambda_env.set(arglist[i], args[i]);
        }
        return evaluate(body, lambda_env);
    }
}

function evaluate(s, env) {
    if(typeof env === 'undefined') env = GlobalEnv;

    if (s instanceof Symbol) {
        return env.lookup(s);
    } else if(!(s instanceof Array)) {
        return s;
    } else if(s.length === 1) {
        return evaluate(s[0], env);
    } else if(s[0].s === 'quote') {
        return s[1];
    } else if(s[0].s === 'define') {
        s.shift();
        symbol = s.shift();
        env.set(symbol, evaluate(s, env));
    } else if(s[0].s === 'set!') {
        s.shift();
        symbol = s.shift();
        e = env.find(symbol);
        if(e === undefined) {
            throw 'symbol ' + symbol.s + ' undefined';
        }
        e.set(symbol, s.shift());

    } else if (s[0].s === 'if') {
        return evaluate((evaluate(s[1], env) ? s[2] : s[3]), env);
    } else if(s[0].s === 'lambda') {
        return make_lambda(env, s[1], s[2]);
    }  else if(s[0].s === 'begin') {
        s.shift();
        var ret = null;
        for (var i = 0; i < s.length; i++) {
            ret = evaluate(s[i], env);
        }
        return ret;
    } else {
        var proc = env.lookup(s[0]);
        var args = s.slice(1).map(function(x) { return evaluate(x, env); });
        return proc.apply(null, args);
    }
}

function console_repl() {
    //requires node.js with readline module
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    var cont = true;
    rl.setPrompt('> ');
    rl.prompt();
    rl.on('line', function(response) {
        if (response !== '(exit)') {
            console.log(evaluate(read(response)));
            rl.prompt();
        } else {
            cont = false;
            rl.close();
        }
    });
}
