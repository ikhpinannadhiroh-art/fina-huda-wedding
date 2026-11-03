
(() => {
  const cfg = window.WEDDING_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR-PROJECT') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR_');
  const db = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const guest = params.get('to') || '';
  const guestName = guest.replace(/[<>]/g,'').trim().slice(0,100);

  if ($('coverGuest') && guestName) $('coverGuest').textContent = `Kepada Yth. ${guestName}`;
  if ($('rsvpName') && guestName) $('rsvpName').value = guestName;
  if ($('wishName') && guestName) $('wishName').value = guestName;

  const toast = msg => {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  };

  // AUTO SCROLL UNDANGAN
  let autoScrollActive = false;
  let autoScrollStarted = false;
  let animationFrame = null;
  let pauseTimer = null;
  let finishCurrentAction = null;

  function stopAutoScroll() {
    if (!autoScrollActive) return;

    autoScrollActive = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (pauseTimer !== null) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }

    if (finishCurrentAction) {
      finishCurrentAction();
      finishCurrentAction = null;
    }
  }

  // Auto-scroll berhenti saat tamu menggulir sendiri
  window.addEventListener('wheel', stopAutoScroll, { passive: true });
  window.addEventListener('touchmove', stopAutoScroll, { passive: true });

  window.addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
      stopAutoScroll();
    }
  });

  function wait(ms) {
    return new Promise(resolve => {
      finishCurrentAction = resolve;
      pauseTimer = setTimeout(() => {
        pauseTimer = null;
        finishCurrentAction = null;
        resolve();
      }, ms);
    });
  }

  function scrollSlowlyTo(targetY) {
    return new Promise(resolve => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = Math.max(1000, Math.abs(distance) / 35 * 1000);
      const startTime = performance.now();

      finishCurrentAction = resolve;

      function step(now) {
        if (!autoScrollActive) {
          animationFrame = null;
          finishCurrentAction = null;
          resolve();
          return;
        }

        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          animationFrame = null;
          finishCurrentAction = null;
          resolve();
        }
      }

      animationFrame = requestAnimationFrame(step);
    });
  }

  async function startAutoScroll() {
    if (autoScrollStarted) return;

    autoScrollStarted = true;
    autoScrollActive = true;

    await wait(800);
    if (!autoScrollActive) return;

    const sections = Array.from(
      document.querySelectorAll('#invitation section')
    );

    for (const section of sections) {
      if (!autoScrollActive) return;

      const targetY = Math.max(
        0,
        section.getBoundingClientRect().top + window.scrollY - 15
      );

      await scrollSlowlyTo(targetY);
      if (!autoScrollActive) return;

      
      if (!autoScrollActive) return;
    }

    if (!autoScrollActive) return;

    const bottom = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    await scrollSlowlyTo(bottom);
    if (!autoScrollActive) return;

    
    autoScrollActive = false;
  }

  $('openInvitation')?.addEventListener('click', async () => {
    $('cover').classList.add('hidden');
    $('invitation').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });

    $('invitation').querySelectorAll('section').forEach((el, i) => {
      el.style.animationDelay = `${Math.min(i * .05, .35)}s`;
      el.classList.add('fade-in');
    });

    const audio = $('bgMusic');
    if (audio && audio.getAttribute('src')) {
      audio.play().then(() => musicLabel(true)).catch(() => musicLabel(false));
    }

    if (db) loadWishes();
    else if ($('wishList')) {
      $('wishList').innerHTML = '<p class="form-note">Ucapan akan ditampilkan setelah database diaktifkan.</p>';
    }

    startAutoScroll();
  });

  function musicLabel(on) {
    const b = $('musicToggle');
    if (b) b.innerHTML = on ? '♫ <span>Jeda Musik</span>' : '♫ <span>Putar Musik</span>';
  }

  $('musicToggle')?.addEventListener('click', () => {
    const a = $('bgMusic');
    if (!a) return;

    if (a.paused) {
      a.play().then(() => musicLabel(true)).catch(() => toast('Tambahkan file musik terlebih dahulu.'));
    } else {
      a.pause();
      musicLabel(false);
    }
  });

  document.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        toast('Nomor berhasil disalin.');
      } catch (e) {
        toast('Gagal menyalin. Silakan salin manual.');
      }
    });
  });

  const target = new Date('2027-01-11T09:00:00+07:00').getTime();

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const vals = [
      Math.floor(diff / 86400000),
      Math.floor(diff / 3600000) % 24,
      Math.floor(diff / 60000) % 60,
      Math.floor(diff / 1000) % 60
    ];

    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => {
      if ($(id)) $(id).textContent = String(vals[i]).padStart(i === 0 ? 3 : 2, '0');
    });
  }

  tick();
  setInterval(tick, 1000);

  $('rsvpForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('rsvpMessage');

    if (!db) {
      msg.textContent = 'Database belum dihubungkan. Lengkapi konfigurasi Supabase terlebih dahulu.';
      return;
    }

    const payload = {
      guest_name: $('rsvpName').value.trim(),
      phone: $('rsvpPhone').value.trim(),
      attendance: $('rsvpStatus').value,
      guest_count: Number($('rsvpCount').value),
      guest_label: guestName || null
    };

    const { error } = await db.from('rsvps').insert(payload);

    msg.textContent = error
      ? 'Belum berhasil dikirim. Silakan coba kembali.'
      : 'Terima kasih, konfirmasi kehadiran Anda telah diterima.';

    if (!error) e.target.reset();
  });

  $('wishForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('wishStatus');

    if (!db) {
      msg.textContent = 'Database belum dihubungkan. Lengkapi konfigurasi Supabase terlebih dahulu.';
      return;
    }

    const { error } = await db.from('wishes').insert({
      guest_name: $('wishName').value.trim(),
      message: $('wishMessage').value.trim(),
      approved: false
    });

    msg.textContent = error
      ? 'Ucapan belum berhasil dikirim. Silakan coba kembali.'
      : 'Terima kasih atas doa dan ucapan baik Anda.';

    if (!error) {
      e.target.reset();
      if (guestName) $('wishName').value = guestName;
      loadWishes();
    }
  });

  async function loadWishes() {
    if (!db || !$('wishList')) return;

    const { data, error } = await db.from('wishes')
      .select('guest_name,message,created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return;

    $('wishList').innerHTML = '';

    (data || []).forEach(w => {
      const item = document.createElement('article');
      item.className = 'wish-item';

      const name = document.createElement('b');
      name.textContent = w.guest_name;

      const p = document.createElement('p');
      p.textContent = w.message;

      item.append(name, p);
      $('wishList').append(item);
    });

    if (!data?.length) {
      $('wishList').innerHTML = '<p class="form-note">Jadilah yang pertama mengirimkan ucapan dan doa.</p>';
    }
  }
})();
