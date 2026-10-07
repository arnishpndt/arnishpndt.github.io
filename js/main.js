(function () {
  "use strict";

  var head = document.getElementById("siteHead");
  var navBtn = document.getElementById("navBtn");
  var siteNav = document.getElementById("siteNav");

  if (head && navBtn && siteNav) {
    var closeNav = function () {
      head.classList.remove("nav-open");
      navBtn.setAttribute("aria-expanded", "false");
    };
    navBtn.addEventListener("click", function () {
      var open = head.classList.toggle("nav-open");
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) closeNav(); });
  }

  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var root = document.documentElement;
  var pickers = [];
  function setupPicker(btnId, menuId, key, fallback) {
    var btn = document.getElementById(btnId);
    var menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    var attr = "data-" + key;
    var items = menu.querySelectorAll("[data-set]");
    var sync = function () {
      var cur = root.getAttribute(attr) || fallback;
      items.forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-set") === cur ? "true" : "false"); });
    };
    var close = function () {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };
    pickers.push({ btn: btn, menu: menu, close: close });
    sync();
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      pickers.forEach(function (p) { p.close(); });
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    items.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-set");
        if (v === fallback) root.removeAttribute(attr);
        else root.setAttribute(attr, v);
        try { localStorage.setItem("ss-" + key, v); } catch (err) {}
        sync();
        close();
        btn.focus();
      });
    });
  }
  setupPicker("layoutBtn", "layoutMenu", "layout", "standard");
  setupPicker("themeBtn", "themeMenu", "theme", "classic");
  document.addEventListener("click", function (e) {
    pickers.forEach(function (p) { if (!p.menu.hidden && !p.menu.contains(e.target)) p.close(); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    pickers.forEach(function (p) { if (!p.menu.hidden) { p.close(); p.btn.focus(); } });
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var start = document.getElementById("quizStart");
  var steps = document.getElementById("quizSteps");
  var done = document.getElementById("quizDone");
  if (!start || !steps || !done) return;

  var fieldsets = steps.querySelectorAll(".quiz-step");
  var bar = document.getElementById("quizBar");
  var count = document.getElementById("quizCount");
  var back = document.getElementById("quizBack");
  var next = document.getElementById("quizNext");
  var stepError = document.getElementById("stepError");
  var startError = document.getElementById("startError");
  var current = 0;
  var firstName = "";

  function show(i) {
    current = i;
    fieldsets.forEach(function (fs, n) { fs.hidden = n !== i; });
    count.textContent = "Question " + (i + 1) + " of " + fieldsets.length;
    bar.style.width = ((i + 1) / fieldsets.length) * 100 + "%";
    back.disabled = i === 0;
    next.textContent = i === fieldsets.length - 1 ? "Book my free call" : "Next";
    stepError.textContent = "";
  }

  start.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = start.querySelector('[name="first_name"]');
    var email = start.querySelector('[name="email"]');
    if (!name.value.trim()) { startError.textContent = "Add your first name."; name.focus(); return; }
    if (!email.checkValidity() || !email.value.trim()) { startError.textContent = "Add a valid email."; email.focus(); return; }
    firstName = name.value.trim();
    start.hidden = true;
    steps.hidden = false;
    show(0);
    var firstInput = fieldsets[0].querySelector("input");
    if (firstInput) firstInput.focus();
  });

  next.addEventListener("click", function () {
    var fs = fieldsets[current];
    if (fs.hasAttribute("data-required") && !fs.querySelector("input:checked")) {
      stepError.textContent = "Pick at least one to keep going.";
      return;
    }
    if (current < fieldsets.length - 1) {
      show(current + 1);
      return;
    }
    steps.hidden = true;
    done.hidden = false;
    document.getElementById("doneTitle").textContent = "You\u2019re in, " + firstName + ".";
  });

  back.addEventListener("click", function () {
    if (current > 0) show(current - 1);
  });
})();
