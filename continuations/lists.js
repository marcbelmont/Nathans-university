
///////////////////////////
// Nth element of a list //
///////////////////////////

function index(list, i) {
  var element = list.shift();
  if (i == 0)
    return element;
  return index(list, i - 1);
}

function indexCPS(list, i, cont) {
  var element = list.shift();
  if (i == 0)
    return cont(element);
  var newCont = function(x) {
    return cont(x);
  }
  return indexCPS(list, i - 1, newCont);
}

function indexThunk(list, i, cont) {
  var element = list.shift();
  if (i == 0)
    return thunk(cont, [element]);
  var newCont = function(x) {
    return thunk(cont, [x]);
  }
  return thunk(indexThunk, [list, i - 1, newCont]);
}

/////////////
// Helpers //
/////////////

var thunk = function (f, lst) {
  return { tag: "thunk", func: f, args: lst };
};

var thunkValue = function (x) {
  return { tag: "value", val: x };
};

var trampoline = function (thk) {
  while (true) {
    if (thk.tag === "value") {
      return thk.val;
    }
    if (thk.tag === "thunk") {
      thk = thk.func.apply(null, thk.args);
    }
  }
};

function buildList(size) {
  var list = [];
  for (var i = 0; i < size; i++)
    list.push(i);
  return list;
}

////////////////////
// Run some tests //
////////////////////

var size = 100000;

try {
  var res = index(buildList(size), size - 1);
  console.log(res);
} catch(e) {
  console.log(e.type);
}

try {
  var res = indexCPS(buildList(size), size - 1, function(x) { return x; });
  console.log(res);
} catch(e) {
  console.log(e.type);
}

try {
  var res = trampoline(indexThunk(buildList(size), size - 1, thunkValue));
  console.log(res);
} catch(e) {
  console.log(e.type);
}

