document.addEventListener('DOMContentLoaded', () => {
  // View Elements
  const welcomeView = document.getElementById('welcomeView');
  const dashboardView = document.getElementById('dashboardView');

  // Auth Buttons & Modals
  const discordLoginBtn = document.getElementById('discordLoginBtn');
  const nicknameInputInline = document.getElementById('nicknameInputInline');
  const nicknameSubmitBtn = document.getElementById('nicknameSubmitBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const configDiscordBtn = document.getElementById('configDiscordBtn');
  
  // Modals
  const configModal = document.getElementById('configModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const clientIdInput = document.getElementById('clientIdInput');
  const redirectUriInput = document.getElementById('redirectUriInput');

  // Dashboard Profile Elements
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userGlobalName = document.getElementById('userGlobalName');
  const userUsername = document.getElementById('userUsername');
  const authBadge = document.querySelector('.auth-badge');

  // Config State
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

  // Render Logged-In User Profile in Header
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
    if (userUsername) userUsername.textContent = user.username.startsWith('@') ? user.username : `@${user.username}`;
    
    if (authBadge) {
      if (user.auth_type === 'nickname') {
        authBadge.textContent = 'Signed in via Nickname';
      } else {
        authBadge.textContent = 'Verified via Discord OAuth2';
      }
    }
  }

  // Parse Discord OAuth URL Hash
  function handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');

    if (accessToken) {
      history.replaceState(null, "", window.location.pathname + window.location.search);

      fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `${tokenType || 'Bearer'} ${accessToken}` }
      })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.id) {
            userData.auth_type = 'oauth2';
            localStorage.setItem('discord_user', JSON.stringify(userData));
            renderUserHeader(userData);
            setView('dashboard');
          }
        })
        .catch(err => {
          console.error('Discord API authorization failed:', err);
          alert('Could not verify OAuth2 token with Discord. You can log in using your Discord Nickname.');
        });
      return true;
    }
    return false;
  }

  // Check saved session on page load
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

  // --- NICKNAME LOGIN HANDLER ---
  function handleNicknameSubmit() {
    const rawName = nicknameInputInline ? nicknameInputInline.value.trim() : '';
    if (!rawName) {
      alert('Please enter your Discord nickname.');
      if (nicknameInputInline) nicknameInputInline.focus();
      return;
    }

    const randomAvatarIndex = Math.floor(Math.random() * 5);
    const userObj = {
      id: 'nick_' + Date.now().toString(36),
      username: rawName.toLowerCase().replace(/\s+/g, '_'),
      global_name: rawName,
      avatar: `https://cdn.discordapp.com/embed/avatars/${randomAvatarIndex}.png`,
      auth_type: 'nickname'
    };

    localStorage.setItem('discord_user', JSON.stringify(userObj));
    renderUserHeader(userObj);
    setView('dashboard');
  }

  // --- EVENT LISTENERS ---

  // Option 1: Direct Discord OAuth Login
  if (discordLoginBtn) {
    discordLoginBtn.addEventListener('click', () => {
      const clientId = localStorage.getItem('discord_client_id') || discordClientId;
      const redirectUri = localStorage.getItem('discord_redirect_uri') || defaultRedirectUri;

      if (!clientId) {
        if (configModal) configModal.classList.add('modal-open');
        return;
      }

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20email`;
      window.location.href = authUrl;
    });
  }

  // Option 2: Continue with nickname
  if (nicknameSubmitBtn) {
    nicknameSubmitBtn.addEventListener('click', handleNicknameSubmit);
  }

  if (nicknameInputInline) {
    nicknameInputInline.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleNicknameSubmit();
      }
    });
  }

  // Sign Out
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('discord_user');
      setView('welcome');
    });
  }

  // Config Modal Handlers
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

  // Client Marquee
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    const clients = [
      "Amber Field", "Northbound Co.", "Halden Gallery", "Plainfield Finance",
      "Vess & Rowe", "Marlowe Labs", "Coastline Freight", "Iron Gate Studio",
      "Quill Insurance", "Basecamp Outdoors", "Fernhollow", "Redline Motors"
    ];
    marqueeTrack.innerHTML = [...clients, ...clients].map(c => `<span>${c}</span>`).join('');
  }

  // Footer Tickers
  const tickerA = document.getElementById('tickerA');
  const tickerB = document.getElementById('tickerB');
  if (tickerA && tickerB) {
    const statsA = ["12+ YEARS", "40 PROJECTS", "ZERO SCRUBS", "PORT ELM"];
    const statsB = ["HARLOW", "0 REPTILIANS", "3 DOGS", "6 COUNTRIES"];
    tickerA.innerHTML = [...statsA, ...statsA].map(s => `<span>${s}</span>`).join('');
    tickerB.innerHTML = [...statsB, ...statsB].map(s => `<span>${s}</span>`).join('');
  }

  // Featured Work Slider
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

  // Worked-with Accordion
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

  // Initialize Session Check
  checkAuthSession();
});
