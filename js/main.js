const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.style.display = open ? '' : 'flex';
    nav.style.position = open ? '' : 'absolute';
    nav.style.right = open ? '' : '20px';
    nav.style.top = open ? '' : '65px';
    nav.style.background = open ? '' : '#fff';
    nav.style.padding = open ? '' : '16px';
    nav.style.borderRadius = open ? '' : '14px';
    nav.style.boxShadow = open ? '' : '0 10px 30px #14231f18';
    nav.style.flexDirection = open ? '' : 'column';
  });
}
