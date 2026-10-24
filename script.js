(() => {
  const palette = ['#ff5c39','#ff8a00','#e7bd12','#75c629','#18b85a','#17b6b1','#2587e8','#3f62e6','#6f45e8','#9b43dc','#d93cb1','#ef4775'];
  document.querySelectorAll('.color-play > span').forEach((word, i) => {
    word.addEventListener('mouseenter', () => {
      const current = word.style.color;
      let c = palette[Math.floor(Math.random()*palette.length)];
      if (c === current) c = palette[(i+2)%palette.length];
      word.style.color = c;
    });
    word.addEventListener('mouseleave', () => {
      word.style.color = word.classList.contains('accent') ? 'var(--purple)' : '';
    });
  });


  const ronyLoader = document.getElementById('ronyLoader');
  const loaderBar = ronyLoader?.querySelector('.rony-loader__bar span');

  // Loader puramente estético. Usamos Web Animations API em vez de CSS keyframes/transition
  // para que a sequência continue suave mesmo quando o sistema está com
  // prefers-reduced-motion ativado (a regra global do site reduz transições CSS a 0.001ms).
  const playLoader = async () => {
    if (!ronyLoader || !loaderBar || ronyLoader.dataset.played === 'true') return;
    ronyLoader.dataset.played = 'true';

    // Garante que o navegador pinte o primeiro frame (barra em 0%) antes de animar.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const barAnimation = loaderBar.animate(
      [
        { transform: 'scaleX(0)' },
        { transform: 'scaleX(1)' }
      ],
      {
        duration: 1150,
        easing: 'cubic-bezier(.76,0,.24,1)',
        fill: 'forwards'
      }
    );
    await barAnimation.finished;

    // Respiro curto como na referência antes do painel começar a sair.
    await new Promise(resolve => setTimeout(resolve, 140));

    const wipeAnimation = ronyLoader.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(0,-100%,0)' }
      ],
      {
        duration: 820,
        easing: 'cubic-bezier(.76,0,.24,1)',
        fill: 'forwards'
      }
    );
    await wipeAnimation.finished;

    ronyLoader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    window.dispatchEvent(new Event('luscoReady'));
  };

  playLoader();

  const techOut = document.querySelector('.tech-icons output');
  document.querySelectorAll('.tech-icons button').forEach(btn => {
    btn.addEventListener('mouseenter', () => techOut.textContent = btn.dataset.label);
    btn.addEventListener('focus', () => techOut.textContent = btn.dataset.label);
  });

  if (matchMedia('(pointer:fine)').matches) {
    const cursor = document.querySelector('.cursor');
    window.addEventListener('pointermove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    document.querySelectorAll('a,button,.project-image').forEach(el => {
      el.addEventListener('mouseenter',()=>cursor.style.transform='translate(-50%,-50%) scale(2.1)');
      el.addEventListener('mouseleave',()=>cursor.style.transform='translate(-50%,-50%) scale(1)');
    });
  }

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Editorial reveals: split each headline into word spans and animate rhythmically.
  document.querySelectorAll('.split-reveal').forEach(el => {
    const nodes = [];
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) frag.appendChild(document.createTextNode(part));
          else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            frag.appendChild(span); nodes.push(span);
          }
        });
        el.replaceChild(frag,node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add('word'); nodes.push(node);
      }
    });
    gsap.from(nodes,{yPercent:110,opacity:0,rotate:2,stagger:.045,duration:.75,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 82%',once:true}});
  });

  // Text reveal dos parágrafos corridos — preserva os reveals editoriais dos títulos.
  const bodyCopySelectors = [
    '.hero-deck',
    '.origin-side p',
    '.transition-copy p',
    '.now-statement > p:last-child',
    '.why-copy > p:last-child',
    '.work-intro > p:last-child',
    '.project-desc',
    '.method-item p',
    '.tech-small',
    '.human-copy > p:not(.chapter-mark)',
    '.contact-row p'
  ];
  document.querySelectorAll(bodyCopySelectors.join(',')).forEach((el) => {
    if (el.classList.contains('split-reveal') || el.dataset.bodyReveal === 'ready') return;
    el.dataset.bodyReveal = 'ready';
    const words = [];
    const text = el.textContent;
    el.textContent = '';
    text.split(/(\s+)/).forEach(part => {
      if (!part.trim()) {
        el.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.className = 'body-reveal-word';
        span.textContent = part;
        el.appendChild(span);
        words.push(span);
      }
    });
    gsap.fromTo(words,
      {opacity:.18,y:8,filter:'blur(2px)'},
      {opacity:1,y:0,filter:'blur(0px)',stagger:.018,duration:.42,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}
    );
  });

  const playHeroIntro = () => {
    gsap.from('.hero-title span',{yPercent:120,opacity:0,stagger:.055,duration:.9,ease:'power4.out',delay:.15});
    gsap.from('.hero-portrait',{y:90,opacity:0,scale:.97,duration:1.1,ease:'power3.out',delay:.35});
    gsap.from('.hero-note',{rotate:10,y:30,opacity:0,duration:.7,ease:'back.out(1.6)',delay:.9});
  };
  window.addEventListener('luscoReady', playHeroIntro, {once:true});
  gsap.to('.hero-portrait',{y:-70,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.tentacle--hero-a',{rotate:16,y:80,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1.4}});
  gsap.to('.tentacle--hero-b',{rotate:74,x:-80,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1.2}});

  document.querySelectorAll('.project').forEach((project,i) => {
    const image = project.querySelector('.project-image');
    const copy = project.querySelector('.project-copy');
    gsap.from(image,{y:100,opacity:0,rotate:i%2?2:-2,duration:1,ease:'power3.out',scrollTrigger:{trigger:project,start:'top 86%',once:true}});
    gsap.from(copy,{y:55,opacity:0,duration:.8,delay:.12,ease:'power2.out',scrollTrigger:{trigger:project,start:'top 84%',once:true}});
  });

  gsap.to('.tentacle--transition',{x:-140,y:-70,rotate:-5,ease:'none',scrollTrigger:{trigger:'.transition-story',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.to('.tentacle--break',{x:-150,rotate:-20,ease:'none',scrollTrigger:{trigger:'.break-line',start:'top bottom',end:'bottom top',scrub:1.5}});
  gsap.to('.tentacle--human',{rotate:15,y:100,ease:'none',scrollTrigger:{trigger:'.human',start:'top bottom',end:'bottom top',scrub:1.4}});

  ScrollTrigger.create({
    trigger:'.method',start:'top top',end:'bottom bottom',
    onEnter:()=>document.body.classList.add('in-method'),
    onLeaveBack:()=>document.body.classList.remove('in-method')
  });
})();


// Mobile navigation — isolated from the existing GSAP/loader logic.
(() => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
})();
