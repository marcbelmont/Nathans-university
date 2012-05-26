var evalScheem = function (expr, env) {
  // Numbers evaluate to themselves
  if (typeof expr === 'number') {
    return expr;
  }
  // Variables
  if (typeof expr === 'string') {
    return lookup(env, expr);
  }
  // Look at head of list for operation
  switch (expr[0]) {

    // Arithmetic operators (variadic)
  case '+':
    var res = 0;
    for (var i = 1; i < expr.length; i++)
      res += evalScheem(expr[i], env);
    return res;
  case '-':
    var res = evalScheem(expr[1], env);
    for (var i = 2; i < expr.length; i++)
      res -= evalScheem(expr[i], env);
    return res;
  case '*':
    var res = 1;
    for (var i = 1; i < expr.length; i++)
      res *= evalScheem(expr[i], env);
    return res;
  case '/':
    var res = evalScheem(expr[1], env);
    for (var i = 2; i < expr.length; i++)
      res /= evalScheem(expr[i], env);
    return res;

    // Keywords
  case 'quote':
    return expr[1];
  case 'begin':
    var r = 0;
    for (var i = 1; i < expr.length; i++)
      r = evalScheem(expr[i], env);
    return r;

    // Variables
  case 'define':
    if (expr.length != 3) throw 'requires 2 arguments';
    if (!('bindings' in env))
      env.bindings = {};
    env.bindings[expr[1]] = evalScheem(expr[2], env);
    return 0;
  case 'set!':
    lookup(env, expr[1]);
    update(env, expr[1], evalScheem(expr[2], env));
    return 0;

    // Comparison
  case '<':
    return (evalScheem(expr[1], env) < evalScheem(expr[2], env)) ? '#t' : '#f';
  case '>':
    return (evalScheem(expr[1], env) > evalScheem(expr[2], env)) ? '#t' : '#f';
  case '<=':
    return (evalScheem(expr[1], env) <= evalScheem(expr[2], env)) ? '#t' : '#f';
  case '>=':
    return (evalScheem(expr[1], env) >= evalScheem(expr[2], env)) ? '#t' : '#f';
  case '=':
    var eq =
      (evalScheem(expr[1], env) ===
       evalScheem(expr[2], env));
    if (eq) return '#t';
    return '#f';

    // Control flow
  case 'if':
    if (evalScheem(expr[1], env) == '#t')
      return evalScheem(expr[2], env);
    return evalScheem(expr[3], env);

    // List manipulation
  case 'cons':
    return [evalScheem(expr[1], env)].concat(
      evalScheem(expr[2], env));
  case 'car':
    if (expr.length != 2) throw 'check arguments';
    var res = evalScheem(expr[1]);
    if (typeof res != 'object') throw 'not a list';
    return res[0];
  case 'cdr':
    if (expr.length != 2) throw 'check arguments';
    return evalScheem(expr[1]).slice(1);
  }
};

if (typeof module !== 'undefined') {
  var PEG = require('pegjs');
  var fs = require('fs');
  var parseScheem = PEG.buildParser(fs.readFileSync(
    'scheem.peg', 'utf-8')).parse;
}

function evalScheemString(string, env) {
  return evalScheem(parseScheem(string), env);
}

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}


/////////////
// Helpers //
/////////////

var update = function (env, v, val) {
  if (v in env.bindings)
    env.bindings[v] = val;
  else
    update(env.outer, v, val);
};

var lookup = function (env, v) {
  if (v in env.bindings)
    return env.bindings[v];
  if ('outer' in env && env.outer)
    return lookup(env.outer, v);
  throw 'not defined';
};