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

  var themeBtn = document.getElementById("themeBtn");
  var themeMenu = document.getElementById("themeMenu");
  if (themeBtn && themeMenu) {
    var root = document.documentElement;
    var items = themeMenu.querySelectorAll("[data-theme-set]");
    var sync = function () {
      var cur = root.getAttribute("data-theme") || "classic";
      items.forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-theme-set") === cur ? "true" : "false"); });
    };
    var closeMenu = function () {
      themeMenu.hidden = true;
      themeBtn.setAttribute("aria-expanded", "false");
    };
    sync();
    themeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = themeMenu.hidden;
      themeMenu.hidden = !open;
      themeBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    items.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-theme-set");
        if (t === "classic") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", t);
        try { localStorage.setItem("ss-theme", t); } catch (err) {}
        sync();
        closeMenu();
        themeBtn.focus();
      });
    });
    document.addEventListener("click", function (e) { if (!themeMenu.hidden && !themeMenu.contains(e.target)) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !themeMenu.hidden) { closeMenu(); themeBtn.focus(); } });
  }

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
