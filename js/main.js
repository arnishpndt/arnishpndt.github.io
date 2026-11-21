(function () {
  "use strict";
  window.__ssMainLoaded = true;

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
    // Failsafe: if the observer never fires, reveal whatever is on screen anyway.
    var revealNear = function () {
      reveals.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add("in");
      });
    };
    window.addEventListener("scroll", revealNear, { passive: true });
    window.addEventListener("beforeprint", function () {
      reveals.forEach(function (el) { el.classList.add("in"); });
    });
    window.addEventListener("load", function () { setTimeout(revealNear, 300); });
    setTimeout(revealNear, 1200);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById("bookForm");
  var gate = document.getElementById("quizGate");
  var steps = document.getElementById("quizSteps");
  var done = document.getElementById("quizDone");
  if (!form || !gate || !steps || !done) return;

  var fieldsets = steps.querySelectorAll(".quiz-step");
  var bar = document.getElementById("quizBar");
  var count = document.getElementById("quizCount");
  var back = document.getElementById("quizBack");
  var next = document.getElementById("quizNext");
  var stepError = document.getElementById("stepError");
  var startError = document.getElementById("startError");
  var current = 0;
  var firstName = "";
  var unlocked = false;
  var transitioning = false;
  var advanceTimer = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncChrome(i) {
    count.textContent = "Question " + (i + 1) + " of " + fieldsets.length;
    bar.style.width = ((i + 1) / fieldsets.length) * 100 + "%";
    back.disabled = i === 0;
    next.textContent = i === fieldsets.length - 1 ? "Book my free call" : "Next";
    stepError.textContent = "";
  }

  function paint(i) {
    current = i;
    fieldsets.forEach(function (fs, n) {
      fs.hidden = n !== i;
      fs.classList.remove("is-in", "is-out");
      if (n === i) {
        void fs.offsetWidth;
        fs.classList.add("is-in");
      }
    });
    syncChrome(i);
    transitioning = false;
  }

  function goTo(i) {
    if (transitioning || i === current || i < 0 || i >= fieldsets.length) return;
    clearTimeout(advanceTimer);
    if (reduceMotion) {
      paint(i);
      return;
    }
    transitioning = true;
    var from = fieldsets[current];
    from.classList.remove("is-in");
    from.classList.add("is-out");
    setTimeout(function () {
      paint(i);
    }, 220);
  }

  function finishDone() {
    form.hidden = true;
    done.hidden = false;
    document.getElementById("doneTitle").textContent = "You\u2019re in, " + firstName + ".";
  }

  function goNext() {
    if (!unlocked || transitioning) return;
    var fs = fieldsets[current];
    if (fs.hasAttribute("data-required") && !fs.querySelector("input:checked")) {
      stepError.textContent = "Pick at least one to keep going.";
      return;
    }
    if (current < fieldsets.length - 1) {
      goTo(current + 1);
      return;
    }
    finishDone();
  }

  function unlockQuestions() {
    var name = form.querySelector('[name="first_name"]');
    var email = form.querySelector('[name="email"]');
    if (!name.value.trim()) { startError.textContent = "Add your first name."; name.focus(); return false; }
    if (!email.checkValidity() || !email.value.trim()) { startError.textContent = "Add a valid email."; email.focus(); return false; }
    firstName = name.value.trim();
    unlocked = true;
    startError.textContent = "";
    gate.hidden = true;
    steps.hidden = false;
    paint(0);
    return true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!unlocked) unlockQuestions();
  });

  next.addEventListener("click", function () {
    clearTimeout(advanceTimer);
    goNext();
  });

  back.addEventListener("click", function () {
    clearTimeout(advanceTimer);
    if (current > 0) goTo(current - 1);
  });

  // Single-choice questions advance automatically for a smoother flow.
  steps.addEventListener("change", function (e) {
    var input = e.target;
    if (!input || input.type !== "radio") return;
    clearTimeout(advanceTimer);
    stepError.textContent = "";
    advanceTimer = setTimeout(goNext, 320);
  });
})();
