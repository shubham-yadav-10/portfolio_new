/* =============================================
   ROUTING & APP CONTROLLER
   ============================================= */
(function(){
  'use strict';

  // === CONFIGURATION ===
  const ROUTES = {
    '/': 'home',
    '/about': 'about',
    '/projects': 'projects',
    '/projects/chittrbox': 'chittrbox',
    '/projects/django-notes': 'django-notes',
    '/projects/devsecops-platform': 'devsecops-platform',
    '/skills': 'skills',
    '/certifications': 'certifications',
    '/contact': 'contact'
  };

  const NAV_MAP = {
    'home': '/',
    'about': '/about',
    'projects': '/projects',
    'chittrbox': '/projects',
    'django-notes': '/projects',
    'devsecops-platform': '/projects',
    'skills': '/skills',
    'certifications': '/certifications',
    'contact': '/contact'
  };

  const PAGE_TITLES = {
    'home': 'Shubham Yadav — DevOps Engineer | Cloud & Kubernetes',
    'about': 'About — Shubham Yadav | DevOps Engineer',
    'projects': 'Projects — Shubham Yadav | DevOps Engineer',
    'chittrbox': 'Chittrbox — Shubham Yadav | DevOps Engineer',
    'django-notes': 'Django Notes App — Shubham Yadav | DevOps Engineer',
    'devsecops-platform': 'DevSecOps Platform — Shubham Yadav | DevOps Engineer',
    'skills': 'Skills — Shubham Yadav | DevOps Engineer',
    'certifications': 'Certifications — Shubham Yadav | DevOps Engineer',
    'contact': 'Contact — Shubham Yadav | DevOps Engineer',
    '404': '404 — Shubham Yadav | DevOps Engineer'
  };

  // === STATE ===
  let currentPage = null;
  let isTransitioning = false;

  // === DOM REFS ===
  const app = document.getElementById('app');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const loadingScreen = document.getElementById('loading-screen');

  // === LOADING SCREEN ===
  function hideLoader(){
    setTimeout(function(){
      loadingScreen.classList.add('hidden');
    }, 1500);
  }

  // === ROUTER ===
  function getRoute(){
    let hash = window.location.hash || '#/';
    if(hash === '#' || hash === '') hash = '#/';
    return hash.substring(1); // remove #
  }

  function resolveRoute(path){
    // Normalize
    path = path.replace(/\/+$/,'') || '/';
    if(ROUTES[path]) return ROUTES[path];
    return '404';
  }

  function navigateTo(path, pushState){
    if(isTransitioning) return;
    const pageId = resolveRoute(path);
    if(pageId === currentPage) return;

    isTransitioning = true;

    // Page exit transition
    app.classList.add('page-exit');

    setTimeout(function(){
      // Hide all pages
      document.querySelectorAll('.page').forEach(function(p){
        p.classList.remove('active');
      });

      // Show target page
      const target = document.getElementById('page-' + pageId);
      if(target){
        target.classList.add('active');
      } else {
        document.getElementById('page-404').classList.add('active');
      }

      // Update title
      document.title = PAGE_TITLES[pageId] || PAGE_TITLES['404'];

      // Update nav active states
      updateNav(pageId);

      // Scroll to top
      window.scrollTo(0, 0);

      currentPage = pageId;

      // Page enter transition
      app.classList.remove('page-exit');
      isTransitioning = false;

      // Trigger scroll reveals for newly active page
      observeReveals();
    }, 250);
  }

  function updateNav(pageId){
    const navKey = NAV_MAP[pageId] || '/';

    // Desktop nav
    document.querySelectorAll('.desktop-nav a').forEach(function(a){
      a.classList.remove('active');
      if(a.getAttribute('href') === '#' + navKey){
        a.classList.add('active');
      }
    });

    // Mobile nav
    document.querySelectorAll('#mobile-menu a[data-nav]').forEach(function(a){
      a.classList.remove('active');
      if(a.getAttribute('href') === '#' + navKey){
        a.classList.add('active');
      }
    });
  }

  // === HASH CHANGE HANDLER ===
  function onHashChange(){
    const path = getRoute();
    navigateTo(path);
  }

  window.addEventListener('hashchange', onHashChange);

  // === MOBILE MENU ===
  function openMobileMenu(){
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu(){
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function(){
    if(mobileMenu.classList.contains('open')){
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      closeMobileMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mobileMenu.classList.contains('open')){
      closeMobileMenu();
    }
  });

  // === SCROLL REVEAL (Intersection Observer) ===
  let observer = null;

  function observeReveals(){
    if(observer) observer.disconnect();

    // Check for reduced motion
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const reveals = document.querySelectorAll('.page.active .reveal:not(.visible)');
    if(!reveals.length) return;

    observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el){ observer.observe(el); });
  }

  // === CONTACT FORM ===
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      let valid = true;
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      // Reset errors
      form.querySelectorAll('.form-group').forEach(function(fg){
        fg.classList.remove('error');
      });

      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const subject = document.getElementById('cf-subject').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if(!name){
        document.getElementById('fg-name').classList.add('error');
        valid = false;
      }
      if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        document.getElementById('fg-email').classList.add('error');
        valid = false;
      }
      if(!subject){
        document.getElementById('fg-subject').classList.add('error');
        valid = false;
      }
      if(!message || message.length < 20){
        document.getElementById('fg-message').classList.add('error');
        valid = false;
      }

      if(!valid) return;

      // Show sending state
      const submitBtn = document.getElementById('cf-submit');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // Since no backend exists, use mailto
      setTimeout(function(){
        const mailtoLink = 'mailto:shubham34343s@gmail.com?subject=' +
          encodeURIComponent(subject + ' — from ' + name) +
          '&body=' + encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message);

        window.location.href = mailtoLink;

        formStatus.className = 'form-status success';
        formStatus.textContent = 'Your email client should open. If not, please email shubham34343s@gmail.com directly.';
        submitBtn.textContent = 'Send Message →';
        submitBtn.disabled = false;
        form.reset();
      }, 800);
    });
  }

  // === INIT ===
  function init(){
    hideLoader();

    // Set initial route
    const path = getRoute();
    const pageId = resolveRoute(path);

    document.querySelectorAll('.page').forEach(function(p){
      p.classList.remove('active');
    });

    const target = document.getElementById('page-' + pageId);
    if(target){
      target.classList.add('active');
    } else {
      document.getElementById('page-404').classList.add('active');
    }

    document.title = PAGE_TITLES[pageId] || PAGE_TITLES['404'];
    updateNav(pageId);
    currentPage = pageId;

    // Initial reveal
    setTimeout(observeReveals, 100);
  }

  // Run on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
