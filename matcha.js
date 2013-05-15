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
        if (typeof this.local[symbol.s] == 'undefined') {
            if (typeof this.outer == 'undefined') {
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
}

function tokenize(s) {
    return s.replace(/\(/g, ' ( ').replace(/\)/g, ' )').split(' ').filter(function (item) {
        return item != '';
        });
}

function atomize(item) {
    //need to add float support
    ip = parseInt(item)
    if (isNaN(ip) == false) {
        return ip;
    } else if (item[0] == '"') {
        return item.substring(1, item.length - 1);
    } else {
        return new Symbol(item);
    }
}

function parse(tokens, tree) {
    if (tokens.length == 0) {
        throw "End of file during parsing";
    }

    token = tokens.shift();
    if (token == '(') {
        while (tokens[0] != ')') {
            tree.push(parse(tokens, []));
        }
        tokens.shift();
        return tree;
    } else if (token == ')') {
        throw "Parse error";
    } else {
        return atomize(token);
    }

}

function read(s) {
    return parse(tokenize(s), []);
}

var BinaryOps = {};
BinaryOps['='] = '==';
BinaryOps['=='] = '==';
BinaryOps['==='] = '===';
BinaryOps['>'] = '>';
BinaryOps['>='] = '>=';
BinaryOps['<'] = '<';
BinaryOps['<='] = '<=';
BinaryOps['&&'] = '&&';
BinaryOps['and'] = '&&';
BinaryOps['||'] = '||';
BinaryOps['or'] = '||';
BinaryOps['+'] = '+';
BinaryOps['-'] = '-';
BinaryOps['*'] = '*';
BinaryOps['/'] = '/';


function evaluate(s, env) {
    if (s instanceof Symbol) {
        return env.lookup(s);
    } else if(!(s instanceof Array)) {
        return s;
    } else if(s.length == 1) {
        return evaluate(s[0], env);
    } else if(s[0].s == 'define') {
        s.shift();
        symbol = s.shift();
        env.set(symbol, evaluate(s, env));
    } else if (s[0].s == 'if') {
        return evaluate( (evaluate(s[1], env) ? s[2] : s[3]), env);
    } else if(typeof BinaryOps[s[0].s] != 'undefined') {
        return eval(evaluate(s[1], env) + BinaryOps[s[0].s] + evaluate(s[2], env));
    }
}