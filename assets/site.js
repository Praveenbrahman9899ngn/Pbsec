/* ============================================================
   PB Sec — shared site behaviour
   Every block is guarded so this file can be loaded on any page.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ---------------------------------------------------------
     1. Sticky header shadow
     --------------------------------------------------------- */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------- */
  var menuBtn = $('#menuBtn');
  var navLinks = $('#navLinks');

  if (menuBtn && navLinks) {
    var closeNav = function () {
      navLinks.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { closeNav(); }
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) { closeNav(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeNav(); }
    });
  }

  /* ---------------------------------------------------------
     3. Scroll-spy for in-page nav (home page only)
     --------------------------------------------------------- */
  if (document.body.getAttribute('data-page') === 'home' && navLinks) {
    var sections = ['services', 'approach', 'posture', 'why', 'faq']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var navAnchors = $$('a', navLinks);

    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------------------------------------------------------
     4. Reveal on scroll
     --------------------------------------------------------- */
  var revealEls = $$('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------------------------------------------------------
     5. FAQ accordion
     --------------------------------------------------------- */
  var faqItems = $$('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(function (item) {
      var btn = $('.faq-q', item);
      var panel = $('.faq-a', item);
      if (!btn || !panel) { return; }

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        faqItems.forEach(function (other) {
          other.classList.remove('is-open');
          var ob = $('.faq-q', other), op = $('.faq-a', other);
          if (ob) { ob.setAttribute('aria-expanded', 'false'); }
          if (op) { op.style.maxHeight = ''; }
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });

    // keep open panels correctly sized when the viewport changes
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        faqItems.forEach(function (item) {
          if (!item.classList.contains('is-open')) { return; }
          var panel = $('.faq-a', item);
          if (panel) { panel.style.maxHeight = panel.scrollHeight + 'px'; }
        });
      }, 150);
    });
  }

  /* ---------------------------------------------------------
     6. Posture check (home page only)
     --------------------------------------------------------- */
  var quiz = $('#quiz');
  if (quiz) {
    var questions = $$('.q', quiz);
    var resultPanel = $('#quizResult');
    var navBar = $('#quizNav');
    var backBtn = $('#quizBack');
    var bar = $('#quizBar');
    var restart = $('#quizRestart');
    var current = 0;
    var answers = [];
    var answerValues = [];
    var finished = false;
    var progress = $('#quizProgress');
    var TOTAL = questions.length;
    var MAX_SCORE = TOTAL * 2;

    var updateProgress = function (completed) {
      if (bar) { bar.style.width = Math.round((completed / TOTAL) * 100) + '%'; }
      if (progress) {
        progress.setAttribute('aria-valuenow', completed);
        progress.setAttribute('aria-valuetext', completed + ' of ' + TOTAL + ' questions completed');
      }
    };

    /* Focus never scrolls on its own. Only bring the heading into view when
       needed; a tall mobile result must not pull the user back to its top. */
    var focusPanel = function (heading) {
      if (!heading) { return; }
      heading.focus({ preventScroll: true });
      var rect = heading.getBoundingClientRect();
      var top = header ? header.getBoundingClientRect().bottom + 16 : 16;
      if (rect.top < top || rect.bottom > window.innerHeight - 20) {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        quiz.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' });
      }
    };

    var syncSelections = function () {
      questions.forEach(function (q, i) {
        $$('.opt', q).forEach(function (opt) {
          var selected = opt.getAttribute('data-answer') === answerValues[i];
          opt.classList.toggle('is-selected', selected);
          opt.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
      });
    };

    var showQuestion = function (i, userDriven) {
      finished = false;
      questions.forEach(function (q, idx) {
        q.classList.toggle('is-active', idx === i);
        q.hidden = idx !== i;
      });
      syncSelections();
      if (resultPanel) { resultPanel.classList.remove('is-active'); resultPanel.hidden = true; }
      if (navBar) { navBar.style.display = ''; }
      if (backBtn) { backBtn.disabled = (i === 0); }
      updateProgress(i);
      if (userDriven) { focusPanel($('h3', questions[i])); }
    };

    var finish = function () {
      finished = true;
      var score = answers.reduce(function (a, b) { return a + b; }, 0);
      var unknownCount = answerValues.filter(function (value) { return value === 'unsure'; }).length;
      var gapCount = answerValues.filter(function (value) { return value === 'no' || value === 'partly'; }).length;
      var hasZero = answers.some(function (answer) { return answer === 0; });
      var scoreNum = $('#scoreNum');
      var scoreRing = $('#scoreRing');
      var band = $('#scoreBand');
      var title = $('#scoreTitle');
      var lead = $('#scoreLead');
      var unknown = $('#scoreUnknown');
      var recs = $('#scoreRecs');

      if (scoreNum) { scoreNum.textContent = score; }
      if (scoreRing) { scoreRing.style.setProperty('--deg', Math.round((score / MAX_SCORE) * 360) + 'deg'); }

      var data;
      if (unknownCount === TOTAL) {
        data = { cls: 'mid', label: 'Needs confirmation', title: 'Start by checking with your IT person',
          lead: 'There is not enough information to describe your company\'s security yet.' };
      } else if (score >= 10 && !hasZero) {
        data = { cls: 'ok', label: 'Basics in place', title: 'Keep building on your good habits',
          lead: 'Your answers suggest most of these six basics are in place. Keep checking them as your company grows.' };
      } else if (score >= 5) {
        data = { cls: 'mid', label: 'Some gaps to review', title: 'You have a useful starting point',
          lead: 'Some basics are in place. Start with the areas you marked No, Partly or Not sure.' };
      } else {
        data = { cls: 'low', label: 'Start with the basics', title: 'Take it one step at a time',
          lead: 'Several basics are missing, incomplete or unconfirmed in your answers. Work through the next steps with your IT person.' };
      }

      // Known gaps first, unknowns next, then partial coverage. Equal-priority
      // items keep question order; this is guidance, not a technical risk ranking.
      var priorities = { no: 0, unsure: 1, partly: 2 };
      var gaps = questions.map(function (q, i) {
        return { value: answerValues[i], topic: q.getAttribute('data-topic'), action: q.getAttribute('data-action'), index: i };
      }).filter(function (item) { return item.value !== 'yes'; }).sort(function (a, b) {
        return priorities[a.value] - priorities[b.value] || a.index - b.index;
      });
      var recommendations = gaps.slice(0, 3).map(function (item) {
        return item.value === 'unsure'
          ? 'Confirm with your IT person: ' + item.topic + '. Check what is already in place before deciding whether any changes are needed.'
          : item.action;
      });
      if (!gaps.length) {
        recommendations = [
          'Keep reviewing work accounts and remove access that is no longer needed.',
          'Schedule regular backup recovery tests and practise your emergency plan.',
          'Repeat this check when your team, devices or apps change.'
        ];
      }

      if (band) { band.className = 'band ' + data.cls; band.textContent = data.label; }
      if (title) { title.textContent = data.title; }
      if (lead) {
        lead.textContent = data.lead + (gaps.length
          ? ' Your answers show ' + gapCount + (gapCount === 1 ? ' area to improve' : ' areas to improve') +
            ' and ' + unknownCount + (unknownCount === 1 ? ' area to confirm.' : ' areas to confirm.') +
            (gaps.length > 3 ? ' Start with these three, then review the remaining ' + (gaps.length - 3) + '.' : '')
          : ' All six answers were Yes.');
      }
      if (unknown) {
        unknown.hidden = unknownCount === 0;
        unknown.textContent = unknownCount + (unknownCount === 1 ? ' answer is' : ' answers are') +
          ' unconfirmed, not confirmed failures. Not sure counts as zero points until checked with your IT person.';
      }
      if (recs) {
        recs.replaceChildren();
        recommendations.forEach(function (text) {
          var li = document.createElement('li');
          li.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
          var span = document.createElement('span');
          span.textContent = text;
          li.appendChild(span);
          recs.appendChild(li);
        });
      }

      syncSelections();
      questions.forEach(function (q) { q.classList.remove('is-active'); q.hidden = true; });
      if (navBar) { navBar.style.display = 'none'; }
      if (resultPanel) { resultPanel.hidden = false; resultPanel.classList.add('is-active'); }
      updateProgress(TOTAL);
      focusPanel(title);
    };

    quiz.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('.opt') : null;
      if (!opt || finished || !questions[current] || !questions[current].contains(opt)) { return; }
      var value = opt.getAttribute('data-answer');
      var scores = { yes: 2, partly: 1, no: 0, unsure: 0 };
      if (!Object.prototype.hasOwnProperty.call(scores, value)) { return; }
      answers[current] = scores[value];
      answerValues[current] = value;
      // Re-answer subsequent questions after going back; never score stale answers.
      answers.length = current + 1;
      answerValues.length = current + 1;
      if (current < TOTAL - 1) {
        current++;
        showQuestion(current, true);
      } else {
        finish();
      }
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (!finished && current > 0) { current--; showQuestion(current, true); }
      });
    }

    if (restart) {
      restart.addEventListener('click', function () {
        current = 0; answers = []; answerValues = [];
        var scoreNum = $('#scoreNum'), scoreRing = $('#scoreRing'), unknown = $('#scoreUnknown');
        if (scoreNum) { scoreNum.textContent = '0'; }
        if (scoreRing) { scoreRing.style.setProperty('--deg', '0deg'); }
        if (unknown) { unknown.hidden = true; }
        showQuestion(0, true);
      });
    }

    var maxLabel = $('#scoreMax');
    if (maxLabel) { maxLabel.textContent = MAX_SCORE; }
    /* Initial render deliberately does not focus or scroll. */
    showQuestion(0, false);
  }

  /* ---------------------------------------------------------
     7. Contact / enquiry form
     --------------------------------------------------------- */
  var form = $('#contactForm');
  if (form) {
    var status = $('#formStatus');

    var setStatus = function (msg, kind) {
      if (!status) { return; }
      status.textContent = msg;
      status.className = 'form-status is-on ' + kind;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var els = form.elements;
      var name = els.fName.value.trim();
      var email = els.fEmail.value.trim();
      var company = els.fCompany.value.trim();
      var topicFields = $$('input.topic-input:checked', form);
      var topic = topicFields.map(function (field) { return field.value; }).join(', ');
      var message = els.fMessage.value.trim();

      if (!name) { setStatus('Please add your name.', 'err'); els.fName.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setStatus('That email address looks incomplete.', 'err'); els.fEmail.focus(); return;
      }
      if (!topicFields.length) {
        setStatus('Please select at least one service.', 'err');
        var firstTopic = $('input.topic-input', form);
        if (firstTopic) { firstTopic.focus(); }
        return;
      }
      if (!message) {
        setStatus('Please tell us a little about what you need.', 'err');
        els.fMessage.focus(); return;
      }

      if (els.topicValue) { els.topicValue.value = topic; }
      if (els._next) { els._next.value = window.location.origin + '/'; }
      setStatus('Sending your enquiry…', 'ok');
      form.submit();
    });
  }

  /* ---------------------------------------------------------
     8. Insights category filter
     --------------------------------------------------------- */
  var filterBar = $('#insightFilter');
  if (filterBar) {
    var posts = $$('[data-category]');
    var empty = $('#insightEmpty');

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-filter]') : null;
      if (!btn) { return; }
      var want = btn.getAttribute('data-filter');

      $$('[data-filter]', filterBar).forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      var shown = 0;
      posts.forEach(function (post) {
        var match = (want === 'all' || post.getAttribute('data-category') === want);
        post.hidden = !match;
        if (match) { shown++; }
      });

      if (empty) { empty.hidden = shown !== 0; }
    });
  }

  /* ---------------------------------------------------------
     9. Footer year
     --------------------------------------------------------- */
  var year = $('#year');
  if (year) { year.textContent = new Date().getFullYear(); }
})();
