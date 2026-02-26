/* ========== Theme Toggle ========== */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('blog-theme') || 'light';
if (savedTheme === 'dark') html.setAttribute('data-theme', 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('blog-theme', isDark ? 'light' : 'dark');
});

/* ========== Search Toggle ========== */
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');

searchToggle.addEventListener('click', () => {
  const isOpen = searchBar.classList.toggle('open');
  if (isOpen) {
    setTimeout(() => searchInput.focus(), 300);
  }
});

// Close search on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchBar.classList.contains('open')) {
    searchBar.classList.remove('open');
  }
});

/* ========== Mobile Menu ========== */
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

menuToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  // Animate hamburger icon
  const spans = menuToggle.querySelectorAll('span');
  const isOpen = mobileNav.classList.contains('open');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

/* ========== Tag Filter ========== */
const tags = document.querySelectorAll('.tag');
const posts = document.querySelectorAll('.post-card');

tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');

    const selected = tag.dataset.tag;

    posts.forEach(post => {
      if (selected === 'all' || post.dataset.tag === selected) {
        post.classList.remove('hidden');
        // Reset animation
        post.style.animation = 'none';
        requestAnimationFrame(() => {
          post.style.animation = '';
        });
      } else {
        post.classList.add('hidden');
      }
    });
  });
});

/* ========== Search Filter ========== */
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();

  posts.forEach(post => {
    const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
    const excerpt = post.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';

    if (!query || title.includes(query) || excerpt.includes(query)) {
      post.classList.remove('hidden');
    } else {
      post.classList.add('hidden');
    }
  });
});

/* ========== Pagination (demo) ========== */
const pageBtns = document.querySelectorAll('.page-btn:not(.next)');
pageBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pageBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Scroll to posts section
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ========== Subscribe form ========== */
function handleSubscribe(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn = e.target.querySelector('button');
  const email = input.value;

  btn.textContent = '订阅中...';
  btn.disabled = true;

  // Simulate async request
  setTimeout(() => {
    input.value = '';
    btn.textContent = '✓ 订阅成功！';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.textContent = '订阅';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1000);
}

/* ========== Scroll header shadow ========== */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)';
  } else {
    header.style.boxShadow = '';
  }
}, { passive: true });

/* ========== Intersection Observer for card animations ========== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.sidebar-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  observer.observe(card);
});
