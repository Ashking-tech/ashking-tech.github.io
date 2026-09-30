// anshul gawai — portfolio
// tiny, dependency-free: reveal-on-scroll, copy-email, current year

(function () {
  "use strict";

  // gate for scroll-reveal styles (page stays fully visible without JS)
  document.documentElement.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- reveal on scroll ----
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ---- copy email ----
  var copyBtn = document.querySelector(".copy-btn");
  if (copyBtn) {
    var label = copyBtn.querySelector(".copy-label");
    var resetTimer = null;
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy") || "";
      function done(ok) {
        copyBtn.classList.toggle("copied", ok);
        if (label) label.textContent = ok ? "Copied to clipboard" : "Copy failed — select the address";
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          copyBtn.classList.remove("copied");
          if (label) label.textContent = "Copy email";
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { done(true); },
          function () { done(legacyCopy(text)); }
        );
      } else {
        done(legacyCopy(text));
      }
    });
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  // ---- current year ----
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ---- scrollspy: highlight the nav link for the section in view ----
  // Deterministic: every callback re-elects from current visibility,
  // so batched entries can never leave a stale winner behind.
  (function () {
    var links = document.querySelectorAll(".nav-links a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    var ids = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      byId[id] = a;
      ids.push(id);
    });
    var visible = {};
    function elect() {
      var best = null, bestRatio = 0;
      ids.forEach(function (id) {
        var r = visible[id] || 0;
        if (r > bestRatio) { bestRatio = r; best = id; }
      });
      links.forEach(function (a) { a.classList.remove("active"); });
      if (best && byId[best]) byId[best].classList.add("active");
    }
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });
        elect();
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ids.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  })();

  // ---- hero dot-field: LED dots light up around the pointer ----
  (function () {
    var canvas = document.querySelector(".hero-field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var GAP = 26;          // dot spacing, px
    var RADIUS = 190;      // pointer influence radius
    var BASE = 0.07;       // resting dot opacity
    var PEAK = 0.6;        // max opacity near pointer

    var dots = [];
    var w = 0, h = 0;
    var mx = -9999, my = -9999;
    var running = false, inView = true;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var noHover = window.matchMedia("(hover: none)").matches;
    var sweepT = 0;
    // dot colour comes from the palette token, never a hardcoded hex
    var dotColor = "#f5f5f7";
    (function () {
      try {
        var v = getComputedStyle(document.documentElement).getPropertyValue("--fg");
        if (v && v.trim()) dotColor = v.trim();
      } catch (e) {}
    })();

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = GAP / 2; y < h; y += GAP) {
        for (var x = GAP / 2; x < w; x += GAP) {
          dots.push({ x: x, y: y, o: 0 });
        }
      }
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = dotColor;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var dx = d.x - mx, dy = d.y - my;
        var target = 1 - Math.sqrt(dx * dx + dy * dy) / RADIUS;
        if (target < 0) target = 0;
        d.o += (target - d.o) * 0.14;
        if (d.o > 0.012) {
          ctx.globalAlpha = BASE + d.o * PEAK;
          var s = 1.4 + d.o * 2.2;
          ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
        } else {
          ctx.globalAlpha = BASE;
          ctx.fillRect(d.x - 0.7, d.y - 0.7, 1.4, 1.4);
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (inView && !document.hidden) {
        if (noHover) {
          sweepT += 0.004;
          mx = w * (0.5 + 0.36 * Math.sin(sweepT * 1.3));
          my = h * (0.42 + 0.34 * Math.cos(sweepT));
        }
        draw();
      }
      if (running) requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      requestAnimationFrame(frame);
    }

    if (reduced) {
      resize();
      return;
    }

    var hero = canvas.parentElement;
    if (!noHover) {
      hero.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
      });
      hero.addEventListener("pointerleave", function () {
        mx = -9999; my = -9999;
      });
    }

    window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !running) start();
    });

    resize();
    start();
  })();

  // ---- hero: live github contribution matrix (commit history, cached 24h) ----
  (function () {
    var USER = "Ashking-tech";
    var grid = document.getElementById("gh-grid");
    var totalEl = document.getElementById("gh-total");
    var srcEl = document.getElementById("gh-src");
    if (!grid) return;

    var CACHE_KEY = "gh-matrix-v3-" + USER;
    var TTL = 24 * 60 * 60 * 1000;
    var days = null, lastMax = 0;

    function maxWeeks() { return window.innerWidth < 760 ? 26 : 53; }

    function render() {
      if (!days || !days.length) return;
      var max = maxWeeks();
      lastMax = max;
      var slice = days.slice(-max * 7);
      var pad = new Date(slice[0].date + "T12:00:00").getDay();
      var html = "";
      for (var p = 0; p < pad; p++) html += "<i></i>";
      for (var i = 0; i < slice.length; i++) {
        var d = slice[i];
        var cls = "gl" + Math.min(4, d.level || 0);
        if (i === slice.length - 1) cls += " ltoday";
        html += '<i class="' + cls + '" style="--d:' + Math.floor((i + pad) / 7) +
                '" title="' + d.count + ' commits \u00b7 ' + d.date + '"></i>';
      }
      grid.innerHTML = html;
    }

    function sumDays(d) {
      var t = 0;
      for (var i = 0; i < d.length; i++) t += d[i].count || 0;
      return t;
    }

    function show(data, status) {
      days = data;
      grid.classList.remove("is-loading");
      if (totalEl) totalEl.textContent = sumDays(data).toLocaleString("en-IN");
      if (srcEl) srcEl.textContent = status;
      render();
    }

    function hhmm(t) {
      try { return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
      catch (e) { return ""; }
    }

    function cacheLoad() {
      try {
        var raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var d = JSON.parse(raw);
        return (d && Array.isArray(d.days) && d.days.length) ? d : null;
      } catch (e) { return null; }
    }
    function cacheSave(data) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), days: data })); } catch (e) {}
    }

    // skeleton first: pulsing placeholders before any network
    (function skeleton() {
      var max = maxWeeks();
      var html = "";
      for (var s = 0; s < max * 7; s++) html += "<i></i>";
      grid.classList.add("is-loading");
      grid.innerHTML = html;
    })();

    // stale cache first: something on screen before any network
    var cached = cacheLoad();
    if (cached) show(cached.days, "Cached · " + hhmm(cached.t));

    // refresh only when cache is missing or older than TTL
    if (cached && Date.now() - cached.t < TTL) return;

    var DAY = 86400000;
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var counts = {}, order = [];
    for (var di = 0; di < 365; di++) {
      var key = new Date(today.getTime() - (364 - di) * DAY).toISOString().slice(0, 10);
      counts[key] = 0;
      order.push(key);
    }
    var since = new Date(today.getTime() - 365 * DAY).toISOString();
    var sinceMs = Date.parse(since);

    // count by author date; fall back to committer date for imported history
    function bump(commit) {
      if (!commit) return;
      var a = ((commit.author && commit.author.date) || "").slice(0, 10);
      if (a in counts) { counts[a]++; return; }
      var c = ((commit.committer && commit.committer.date) || "").slice(0, 10);
      if (c in counts) counts[c]++;
    }

    function fail(reason) {
      grid.classList.remove("is-loading");
      if (cached) show(cached.days, "Cached · " + hhmm(cached.t) + " · " + reason);
      else if (srcEl) srcEl.textContent = reason;
    }

    // pre-flight: rate_limit is free and tells us if the run can even succeed
    fetch("https://api.github.com/rate_limit")
      .then(function (r) { return r.json(); })
      .then(function (rl) {
        var remaining = rl.resources.core.remaining;
        if (remaining < 12) throw new Error("rate limited");
        return fetch("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed");
      })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (repos) {
        if (!Array.isArray(repos)) throw new Error("gh shape");
        // repos not pushed in the past year cannot contribute commits
        var active = repos.filter(function (repo) { return Date.parse(repo.pushed_at) >= sinceMs; });
        if (!active.length) throw new Error("no active repos");
        var meta = { total: active.length, failed: 0 };
        var list = active.slice(0, 30).map(function (repo) {
          return fetch("https://api.github.com/repos/" + repo.full_name +
                       "/commits?per_page=100&since=" + since)
            .then(function (r) {
              if (!r.ok) { meta.failed++; return []; }
              return r.json();
            })
            .then(function (commits) {
              if (Array.isArray(commits)) {
                for (var i = 0; i < commits.length; i++) bump(commits[i].commit);
              }
            })
            .catch(function () { meta.failed++; });
        });
        return Promise.all(list).then(function () { return meta; });
      })
      .then(function (meta) {
        var total = 0, nz = [];
        for (var i = 0; i < order.length; i++) {
          total += counts[order[i]];
          if (counts[order[i]] > 0) nz.push(counts[order[i]]);
        }
        nz.sort(function (a, b) { return a - b; });
        function q(p) { return nz.length ? nz[Math.min(nz.length - 1, Math.floor(p * nz.length))] : 1; }
        var t1 = q(0.5), t2 = q(0.75), t3 = q(0.92);
        var out = [];
        for (var j = 0; j < order.length; j++) {
          var c = counts[order[j]], level = 0;
          if (c > 0) level = c <= t1 ? 1 : c <= t2 ? 2 : c <= t3 ? 3 : 4;
          out.push({ date: order[j], count: c, level: level });
        }
        // integrity: a partial run must never replace a fuller cache
        if (meta.failed > 0 && cached && sumDays(cached.days) > total) {
          show(cached.days, "Cached · " + hhmm(cached.t) + " · partial refresh");
          return;
        }
        cacheSave(out);
        show(out, meta.failed > 0
          ? "Partial · " + (meta.total - meta.failed) + "/" + meta.total + " repos · retry later"
          : "Live · github.com · commit history");
      })
      .catch(function (err) {
        var msg = String((err && err.message) || "");
        fail(msg.indexOf("rate limited") >= 0 ? "Rate limited · try again later" : "GitHub offline — " + (msg || "unavailable"));
      });
  })();

  // ---- open source: PRs merged into other people's repos (cached 24h) ----
  (function () {
    var USER = "Ashking-tech";
    var list = document.getElementById("oss-list");
    var srcEl = document.getElementById("oss-src");
    if (!list) return;

    // v2: drops the Shreyascode40 PR, so v1 caches must not be read back
    var CACHE_KEY = "oss-prs-v2-" + USER;
    var TTL = 24 * 60 * 60 * 1000;
    var MAX = 8;

    // repos deliberately left off the page: not part of the work it presents
    var EXCLUDE = { "shreyascode40/lost-and-found-web": true };

    // last known good, shipped with the page: the section must never render
    // empty, and the unauthenticated search bucket is only 10 requests/min
    var SNAPSHOT = [
      { repo: "kubeflow/pipelines", number: 14440, title: "chore: fix typos across documentation and tutorials", url: "https://github.com/kubeflow/pipelines/pull/14440", date: "2026-09-28", assoc: "CONTRIBUTOR" },
      { repo: "is-a-dev/register", number: 40664, title: "Register ashking.is-a.dev", url: "https://github.com/is-a-dev/register/pull/40664", date: "2026-06-13", assoc: "NONE" }
    ];

    var ASSOC = { CONTRIBUTOR: "outside contributor", COLLABORATOR: "contributor", MEMBER: "member", OWNER: "owner" };

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function fmtDate(iso) {
      try {
        return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric"
        });
      } catch (e) { return iso; }
    }
    function hhmm(t) {
      try { return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
      catch (e) { return ""; }
    }

    function render(items) {
      if (!items || !items.length) return;
      var html = "";
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        var assoc = ASSOC[p.assoc] ? '<span class="oss-assoc">' + ASSOC[p.assoc] + "</span>" : "";
        html += '<div class="spec-row">' +
          '<dt>' + esc(p.repo) + "</dt>" +
          '<dd><a class="oss-row" href="' + esc(p.url) + '" target="_blank" rel="noreferrer">' +
          '<span class="oss-title">' + esc(p.title) + "</span>" +
          '<span class="oss-meta">' +
          '<span class="oss-num">#' + esc(p.number) + "</span>" +
          "<span>merged " + esc(fmtDate(p.date)) + "</span>" +
          assoc +
          '<span aria-hidden="true">↗</span>' +
          "</span>" +
          "</a></dd></div>";
      }
      list.classList.remove("is-loading");
      list.innerHTML = html;
    }

    function show(items, status) {
      render(items);
      if (srcEl) srcEl.textContent = status;
    }

    function cacheLoad() {
      try {
        var raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var d = JSON.parse(raw);
        return (d && Array.isArray(d.items) && d.items.length) ? d : null;
      } catch (e) { return null; }
    }
    function cacheSave(items) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items: items })); } catch (e) {}
    }

    // a merge into one of your own repo is not a contribution to open source
    function isShown(repo) {
      var key = repo.toLowerCase();
      return key.indexOf(USER.toLowerCase() + "/") !== 0 && !EXCLUDE[key];
    }

    // painted immediately so the section is never blank
    var cached = cacheLoad();
    list.classList.add("is-loading");
    if (cached) show(cached.items, "Cached · " + hhmm(cached.t));

    function fail(reason) {
      list.classList.remove("is-loading");
      if (cached) show(cached.items, "Cached · " + hhmm(cached.t) + " · " + reason);
      else show(SNAPSHOT, "Snapshot · " + reason);
    }

    if (cached && Date.now() - cached.t < TTL) return;

    fetch("https://api.github.com/rate_limit")
      .then(function (r) { return r.json(); })
      .then(function (rl) {
        // search is its own bucket: 10/min, so core headroom says nothing here
        var search = rl.resources && rl.resources.search;
        if (!search || search.remaining < 1) throw new Error("rate limited");
        return fetch("https://api.github.com/search/issues?q=author:" + USER +
                     "+type:pr+is:merged&sort=updated&per_page=" + (MAX * 3));
      })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        if (!data || !Array.isArray(data.items)) throw new Error("shape");
        var items = [];
        for (var i = 0; i < data.items.length && items.length < MAX; i++) {
          var it = data.items[i];
          var repo = String(it.repository_url || "").split("/repos/")[1];
          if (!repo || !isShown(repo)) continue;
          items.push({
            repo: repo,
            number: it.number,
            title: it.title,
            url: it.html_url,
            // closed_at is the merge instant for a merged pull request
            date: String(it.closed_at || it.updated_at || "").slice(0, 10),
            assoc: it.author_association || ""
          });
        }
        // integrity: an empty or shrinking run must never replace a fuller cache
        if (!items.length) { if (!cached) show(SNAPSHOT, "Snapshot · nothing merged yet"); return; }
        if (cached && cached.items.length > items.length) {
          show(cached.items, "Cached · " + hhmm(cached.t) + " · partial refresh");
          return;
        }
        cacheSave(items);
        show(items, "Live · github.com · " + items.length + " merged pull request" + (items.length === 1 ? "" : "s"));
      })
      .catch(function (err) {
        var msg = String((err && err.message) || "");
        if (msg.indexOf("rate limited") >= 0) fail("rate limited");
        else if (msg.indexOf("http ") === 0) fail(msg);
        else fail("unreachable");
      });
  })();

})();
