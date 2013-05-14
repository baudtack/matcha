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

function tokenize(s) {
    return s.replace(/\(/g, ' ( ').replace(/\)/g, ' )').split(' ').filter(function (item) {
        return item != '';
        });
}

function atomize(item) {
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
