# Lusco — social + mobile

Base: versão Lusco V1 com loader corrigido.

Alterações desta versão:
- Instagram: https://www.instagram.com/joaoluscadsgn/
- WhatsApp: +55 61 99377-1036, incluindo CTA flutuante.
- Menu mobile com navegação e links sociais.
- Responsividade revista para 360–980 px.
- Cases em mobile usam proporção 16:10 para evitar deformação dos previews.
- Hero, retratos, tentáculos, método, tecnologias, contato e footer ajustados para mobile.
- Favicon SVG criado com o "L" da marca Lusco.
- Container `#app` adicionado para o Locomotive Scroll.
- Bloco do Locomotive Scroll preservado no final do HTML conforme padrão definido.

Nenhuma copy principal foi alterada.

## Auditoria técnica (out/2026)

Sem mudança de identidade visual, copy ou layout. Principais pontos:
- Retratos servidos em WebP responsivo (`joao-studio-*.webp`, `joao-studio-2-*.webp`): ~2,8 MB → ~190 KB. Os PNG originais continuam em `assets/` (não são mais referenciados).
- Correção: palavras do título do hero terminavam deslocadas para baixo (conflito entre a `transition` CSS do hover e o GSAP), cobrindo o parágrafo.
- Correção: `scroll-behavior:smooth` + Lenis (Locomotive v5) suavizavam o scroll duas vezes. Locomotive fixado em `5.0.0-beta.21` (antes `@beta`).
- Loader nunca bloqueia a página (sem JS, falha de animação ou timeout de 6 s).
- Animações GSAP, parallax e scroll suave rodam sempre completos, inclusive com `prefers-reduced-motion` ativo (decisão do autor).
- SEO: canonical, Open Graph (`assets/og-image.jpg`), JSON-LD (WebSite + Person) e `sitemap.xml`.
- A11y: skip link, Esc fecha o menu mobile, áreas de toque maiores, botões de tecnologia funcionam no toque.
- CLS: hero aguarda as fontes (sob o loader) e citação da seção 03 não ultrapassa mais a viewport em 980–1400 px.

## Sistema tipográfico (out/2026)

Uma regra por família, tokens em `:root` no topo de `styles.css`:
- **Archivo Black (display)**, sempre peso 400, entrelinha .95, tracking -.055em, caixa alta.
  Três níveis iguais no site todo: `--fs-h1` (hero) > `--fs-h2` (todo título de seção e frase-manifesto) > `--fs-h3` (cases e etapas do método).
  Entrelinha .95: abaixo disso acentos (Ã Ó Ê) e cedilha encostam na linha vizinha.
- **Inter (texto corrido)**: `--fs-lead` 20px (parágrafo que acompanha um título), `--fs-body` 16px (descrições, notas), `--fs-body-s` 14px (hero).
- **DM Mono (rótulos/UI)**: rótulos, botões, menu, ticker, numeração, notas. Nunca em parágrafos.
- Mobile (≤600px): H1/H2/H3 calculados para a palavra mais longa caber inteira na coluna (nenhuma palavra é partida).
- Um único bloco `≤980px` e um único `≤600px`; a tipografia responde trocando tokens.
- Cases na ordem: OTTOS, MOBI, Fhabiolla Mercaldo, Espaço Essencial, Catarina Romano.
