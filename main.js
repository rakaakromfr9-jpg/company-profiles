document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const welcomeView = document.getElementById('welcomeView');
  const dashboardView = document.getElementById('dashboardView');
  const discordLoginBtn = document.getElementById('discordLoginBtn');
  const demoLoginBtn = document.getElementById('demoLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const configDiscordBtn = document.getElementById('configDiscordBtn');
  const configModal = document.getElementById('configModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const clientIdInput = document.getElementById('clientIdInput');
  const redirectUriInput = document.getElementById('redirectUriInput');

  const userAvatarImg = document.getElementById('userAvatarImg');
  const userGlobalName = document.getElementById('userGlobalName');
  const userUsername = document.getElementById('userUsername');

  // Default Discord Config
  const defaultRedirectUri = window.location.origin + window.location.pathname;
  let discordClientId = localStorage.getItem('discord_client_id') || '';
  let discordRedirectUri = localStorage.getItem('discord_redirect_uri') || defaultRedirectUri;

  if (clientIdInput) clientIdInput.value = discordClientId;
  if (redirectUriInput) redirectUriInput.value = discordRedirectUri;

  // View Router Function
  function setView(viewName) {
    if (viewName === 'dashboard') {
      welcomeView.classList.remove('view-active');
      dashboardView.classList.add('view-active');
      window.scrollTo(0, 0);
    } else {
      dashboardView.classList.remove('view-active');
      welcomeView.classList.add('view-active');
      window.scrollTo(0, 0);
    }
  }

  // Render Logged In Discord User Header
  function renderUserHeader(user) {
    if (!user) return;
    if (userAvatarImg) {
      if (user.avatar) {
        userAvatarImg.src = user.avatar.startsWith('http')
          ? user.avatar
          : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
      } else {
        userAvatarImg.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
      }
    }
    if (userGlobalName) userGlobalName.textContent = user.global_name || user.username;
    if (userUsername) userUsername.textContent = `@${user.username}`;
  }

  // Parse Discord OAuth URL Hash
  function handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');

    if (accessToken) {
      // Clear URL hash
      history.replaceState(null, "", window.location.pathname + window.location.search);

      // Fetch user profile from Discord API
      fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `${tokenType || 'Bearer'} ${accessToken}` }
      })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.id) {
            localStorage.setItem('discord_user', JSON.stringify(userData));
            renderUserHeader(userData);
            setView('dashboard');
          }
        })
        .catch(err => {
          console.error('Failed to fetch Discord user:', err);
          alert('Failed to authorize with Discord API. Using demo session.');
          triggerDemoLogin();
        });
      return true;
    }
    return false;
  }

  // Check saved session
  function checkAuthSession() {
    const isHandlingOAuth = handleOAuthCallback();
    if (isHandlingOAuth) return;

    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        renderUserHeader(userObj);
        setView('dashboard');
      } catch (e) {
        localStorage.removeItem('discord_user');
        setView('welcome');
      }
    } else {
      setView('welcome');
    }
  }

  // Demo Login Handler
  function triggerDemoLogin() {
    const demoUser = {
      id: '884920193840192841',
      username: 'alex_fieldwork',
      global_name: 'Alex Rivera',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      email: 'alex@fieldwork.studio'
    };
    localStorage.setItem('discord_user', JSON.stringify(demoUser));
    renderUserHeader(demoUser);
    setView('dashboard');
  }

  // Event Listeners
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', triggerDemoLogin);
  }

  if (discordLoginBtn) {
    discordLoginBtn.addEventListener('click', () => {
      const clientId = localStorage.getItem('discord_client_id') || discordClientId;
      const redirectUri = localStorage.getItem('discord_redirect_uri') || defaultRedirectUri;

      if (!clientId) {
        // Open modal if Client ID is missing
        if (configModal) configModal.classList.add('modal-open');
        return;
      }

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20email`;
      window.location.href = authUrl;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('discord_user');
      setView('welcome');
    });
  }

  if (configDiscordBtn) {
    configDiscordBtn.addEventListener('click', () => {
      if (configModal) configModal.classList.add('modal-open');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (configModal) configModal.classList.remove('modal-open');
    });
  }

  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      const newClientId = clientIdInput.value.trim();
      const newRedirectUri = redirectUriInput.value.trim() || defaultRedirectUri;

      localStorage.setItem('discord_client_id', newClientId);
      localStorage.setItem('discord_redirect_uri', newRedirectUri);
      discordClientId = newClientId;
      discordRedirectUri = newRedirectUri;

      if (configModal) configModal.classList.remove('modal-open');

      if (newClientId) {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${newClientId}&redirect_uri=${encodeURIComponent(newRedirectUri)}&response_type=token&scope=identify%20email`;
        window.location.href = authUrl;
      }
    });
  }

  // --- DASHBOARD INTERACTIVE FEATURES ---
  const nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  }

  // client marquee
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    const clients = [
      "Amber Field", "Northbound Co.", "Halden Gallery", "Plainfield Finance",
      "Vess & Rowe", "Marlowe Labs", "Coastline Freight", "Iron Gate Studio",
      "Quill Insurance", "Basecamp Outdoors", "Fernhollow", "Redline Motors"
    ];
    marqueeTrack.innerHTML = [...clients, ...clients].map(c => `<span>${c}</span>`).join('');
  }

  // footer tickers
  const tickerA = document.getElementById('tickerA');
  const tickerB = document.getElementById('tickerB');
  if (tickerA && tickerB) {
    const statsA = ["12+ YEARS", "40 PROJECTS", "ZERO SCRUBS", "PORT ELM"];
    const statsB = ["HARLOW", "0 REPTILIANS", "3 DOGS", "6 COUNTRIES"];
    tickerA.innerHTML = [...statsA, ...statsA].map(s => `<span>${s}</span>`).join('');
    tickerB.innerHTML = [...statsB, ...statsB].map(s => `<span>${s}</span>`).join('');
  }

  // slider
  const slides = [...document.querySelectorAll('.slide')];
  const sliderNav = document.getElementById('sliderNav');
  if (slides.length > 0 && sliderNav) {
    sliderNav.innerHTML = '';
    slides.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      sliderNav.appendChild(dot);
    });
    const dots = [...sliderNav.children];
    let current = 0;
    function goTo(i) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = i;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    setInterval(() => goTo((current + 1) % slides.length), 6000);
  }

  // worked-with accordion
  const list = document.getElementById('workedList');
  if (list) {
    const worked = [
      { name: "Vess & Rowe", tags: "Research – Strategy", body: "A round of interviews and budgeting-app usability tests with their savings customers gave us a clear direction, and the resulting proposition tested well before a single screen was designed." },
      { name: "Marlowe Labs", tags: "Design", body: "Their shoe-care line needed an online store that felt as considered as the product itself, so we kept the interface quiet and let the packaging photography carry the page." },
      { name: "Coastline Freight", tags: "Research – Strategy – Design – Development", body: "We've maintained and grown their logistics platform for several years now, adding features in step with how the business itself has changed." },
      { name: "Iron Gate Studio", tags: "Strategy – Design – Development", body: "Their offer was strong but hard to find on the old site — we restructured the messaging hierarchy first, then rebuilt the front end around it, and inbound leads picked up within the quarter." },
      { name: "Fernhollow", tags: "Research – Strategy – Design – Development", body: "A wellness app built around breathing exercises, where the whole interface had to feel unhurried without ever feeling slow to use." },
      { name: "Quill Insurance", tags: "Research – Strategy – Design – Development", body: "We simplified their multi-step quote flow into something a first-time visitor could finish without help, which was the actual goal behind the redesign." }
    ];
    list.innerHTML = worked.map((w, i) => `
      <details class="worked-item">
        <summary>
          <span class="worked-idx">${String(i + 1).padStart(2, '0')}</span>
          <span class="worked-name">${w.name}</span>
          <span class="worked-tags">${w.tags}</span>
          <span class="cap-toggle">+</span>
        </summary>
        <div class="worked-body">${w.body}</div>
      </details>
    `).join('');
  }

  // Initialize Auth Check
  checkAuthSession();
});
