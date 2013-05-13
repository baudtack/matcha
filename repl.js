function Symbol(s) {
    this.s = s;
}


function tokenize(s) {
    return s.replace('(', '( ').replace(')', ' )').split(' ');
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

        while (tokens[0] != ')'){
            tree.push(parse(tokens, tree));
        }
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


console.log(read('(alert (foo "test"))'));

