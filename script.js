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

  const revealPage = () => {
    if (!document.body.classList.contains('is-loading')) return;
    ronyLoader?.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    window.dispatchEvent(new Event('luscoReady'));
  };

  // Loader puramente estético, via Web Animations API (independe da regra global de
  // reduced-motion do CSS). Em qualquer falha a página é liberada mesmo assim.
  const playLoader = async () => {
    if (!ronyLoader || !loaderBar || ronyLoader.dataset.played === 'true') return revealPage();
    ronyLoader.dataset.played = 'true';
    try {
      // Garante que o navegador pinte o primeiro frame (barra em 0%) antes de animar.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      await loaderBar.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 1150, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
      ).finished;

      // Respiro curto como na referência antes do painel começar a sair.
      await new Promise(resolve => setTimeout(resolve, 140));

      await ronyLoader.animate(
        [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,-100%,0)' }],
        { duration: 820, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
      ).finished;
    } finally {
      revealPage();
    }
  };

  playLoader().catch(() => {});
  // Rede de segurança: o conteúdo nunca fica preso atrás do loader.
  setTimeout(revealPage, 6000);

  const techOut = document.querySelector('.tech-icons output');
  if (techOut && !matchMedia('(hover:hover)').matches) techOut.textContent = 'toque em um item';
  document.querySelectorAll('.tech-icons button').forEach(btn => {
    const show = () => { if (techOut) techOut.textContent = btn.dataset.label; };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('click', show); // Safari/iOS não foca botões no toque
  });

  const cursor = document.querySelector('.cursor');
  if (cursor && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    // Posição via transform num único rAF por frame: sem recálculo de layout a cada pointermove.
    let x = 0, y = 0, scale = 1, queued = false;
    const render = () => {
      queued = false;
      cursor.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
    window.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add('is-active');
      queue();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    document.querySelectorAll('a,button,.project-image').forEach(el => {
      el.addEventListener('mouseenter', () => { scale = 2.1; queue(); });
      el.addEventListener('mouseleave', () => { scale = 1; queue(); });
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
      // clearProps: remove o filter/transform residual ao fim, evitando camadas de filtro permanentes.
      {opacity:1,y:0,filter:'blur(0px)',stagger:.018,duration:.42,ease:'power2.out',clearProps:'filter,transform',scrollTrigger:{trigger:el,start:'top 88%',once:true}}
    );
  });

  const playHeroIntro = () => {
    // A transition CSS de transform (hover do .color-play) fazia o GSAP ler a matriz no meio
    // da transição e as palavras terminavam deslocadas ~120% para baixo, sobre o parágrafo.
    // Desliga a transition durante a entrada e limpa tudo ao final (o hover volta a funcionar).
    const heroWords = gsap.utils.toArray('.hero-title > span');
    gsap.set(heroWords,{transition:'none'});
    gsap.from(heroWords,{yPercent:120,opacity:0,stagger:.055,duration:.9,ease:'power4.out',delay:.15,
      clearProps:'transform,translate,rotate,scale,opacity,transition'});
    gsap.from('.hero-portrait',{y:90,opacity:0,scale:.97,duration:1.1,ease:'power3.out',delay:.35});
    gsap.from('.hero-note',{rotate:10,y:30,opacity:0,duration:.7,ease:'back.out(1.6)',delay:.9});
  };
  window.addEventListener('luscoReady', playHeroIntro, {once:true});

  document.querySelectorAll('.project').forEach((project,i) => {
    const image = project.querySelector('.project-image');
    const copy = project.querySelector('.project-copy');
    // clearProps: ao terminar, o CSS volta a controlar o transform. Sem isso o GSAP grava
    // o translate(-70px,50px) da caixa escura do desktop e ele vaza para o mobile (texto cortado).
    gsap.from(image,{y:100,opacity:0,rotate:i%2?2:-2,duration:1,ease:'power3.out',clearProps:'transform,translate,rotate,scale,opacity',scrollTrigger:{trigger:project,start:'top 86%',once:true}});
    gsap.from(copy,{y:55,opacity:0,duration:.8,delay:.12,ease:'power2.out',clearProps:'transform,translate,rotate,scale,opacity',scrollTrigger:{trigger:project,start:'top 84%',once:true}});
  });

  // Imagens lazy mudam a altura do documento depois do carregamento; recalcula os gatilhos.
  window.addEventListener('load', () => ScrollTrigger.refresh());

  gsap.to('.hero-portrait',{y:-70,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.tentacle--hero-a',{rotate:16,y:80,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1.4}});
  gsap.to('.tentacle--hero-b',{rotate:74,x:-80,ease:'none',scrollTrigger:{trigger:'.chapter--hero',start:'top top',end:'bottom top',scrub:1.2}});

  gsap.to('.tentacle--transition',{x:-140,y:-70,rotate:-5,ease:'none',scrollTrigger:{trigger:'.transition-story',start:'top bottom',end:'bottom top',scrub:1.2}});
  gsap.to('.tentacle--break',{x:-150,rotate:-20,ease:'none',scrollTrigger:{trigger:'.break-line',start:'top bottom',end:'bottom top',scrub:1.5}});
  gsap.to('.tentacle--human',{rotate:15,y:100,ease:'none',scrollTrigger:{trigger:'.human',start:'top bottom',end:'bottom top',scrub:1.4}});
})();


// Mobile navigation — isolated from the existing GSAP/loader logic.
(() => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    // Pausa a rolagem suave por trás do menu aberto.
    const scroll = window.LocomotiveScrollInstance;
    if (scroll && !document.body.classList.contains('is-loading')) open ? scroll.stop() : scroll.start();
  };
  const closeMenu = () => { if (isOpen()) setOpen(false); };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) { closeMenu(); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
})();
