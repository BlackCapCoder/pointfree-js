pf = (function () {
  const dot = f => g => x => f (g (x));

  const collector = (prev, ctx, f) => {
    let args = [];

    let prox = new Proxy (f, {
      has:   (_, p) => p in ctx,
      apply: (_, __, as) => {
        if (as.length < 1) {
          let atmp = [];

          for (let a of args) {
            atmp.push (a.IS_COLLECTOR ? a () : a);
            if (atmp.length < f.length) continue;
            f = f.apply (ctx, atmp);
            atmp = [];
          }

          if (atmp.length > 0) {
            let _args;
            let push = (f => x => { _args = [x]; return f.apply (ctx, atmp.concat (_args)) }) (f);

            for (let i = atmp.length; i < f.length - 1; i++) {
              push = x => { _args.push (x); return push; }
            }

            f = push;
          }

          return prev === undefined ? f : dot (prev ()) (f);
        } else {
          args = args.concat (as);
          return prox;
        }
      },
      get: (_, p) => {
        if (p === "IS_COLLECTOR") return true;
        if (!(p in ctx)) return;
        let x = ctx[p];
        return x instanceof Function ? collector (prox, ctx, x) : x;
      }
    })

    return prox;
  }

  let scope = ss => new Proxy ({}, {
    has: (_, p) => {
      for (let o of ss) if (p in o) return true;
      return false;
    },
    get: (_, p) => {
      for (let o of ss) if (p in o) return o[p];
    },
    set: (_, p, v) => ss[0][p] = v
  });

  return (...ctx) => new Proxy (scope (ctx), {
    has: (_, __) => true,
    get: (t, p) => {
      if (!(p in t)) return;
      let x = t[p];
      return x instanceof Function ? collector (undefined, t, x) : x;
    },
    set: (t, p, v) => t[p] = v !== undefined && v.IS_COLLECTOR ? v () : v
  });
}) ();

