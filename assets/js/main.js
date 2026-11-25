/* ConectaMed RD · JavaScript principal
   1 Componentes (navbar/footer) · 2 Menú · 3 Pestañas · 4 Buscador
   5 Necesidades de industrias · 6 Perfil profesional */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var store = {
    get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* 1. Componentes reutilizables */
  function loadComponents() {
    var jobs = $$("[data-include]").map(function (el) {
      return fetch(el.getAttribute("data-include"))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) { el.innerHTML = html; })
        .catch(function () {
          el.innerHTML = '<p class="note" style="margin:1rem">Abre el proyecto con un servidor local (por ejemplo la extensión Live Server de VS Code) o súbelo a GitHub Pages para ver el menú y el pie de página.</p>';
        });
    });
    return Promise.all(jobs);
  }

  /* 2. Navbar: página activa, menú móvil, sombra, año */
  function initChrome() {
    var page = document.body.getAttribute("data-page");
    $$("[data-nav]").forEach(function (a) { if (a.getAttribute("data-nav") === page) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); } });
    var btn = $(".menu-toggle"), nav = $("#main-nav");
    if (btn && nav) btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open); btn.textContent = open ? "✕" : "☰";
    });
    var header = $(".site-header");
    if (header) addEventListener("scroll", function () { header.classList.toggle("is-scrolled", scrollY > 8); }, { passive: true });
    $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
  }

  /* 3. Pestañas: <div data-tabs> con botones [data-tab="id"] y paneles [data-panel="id"] */
  function initTabs() {
    $$("[data-tabs]").forEach(function (box) {
      var tabs = $$("[data-tab]", box), panels = $$("[data-panel]", box);
      function activate(id) {
        tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-tab") === id); });
        panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === id); });
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { activate(t.getAttribute("data-tab")); }); });
      /* Botones que abren una pestaña: <button data-goto-tab="perfil"> */
      $$("[data-goto-tab]", box).forEach(function (b) {
        b.addEventListener("click", function () { activate(b.getAttribute("data-goto-tab")); box.scrollIntoView({ behavior: "smooth", block: "start" }); });
      });
      var h = location.hash.slice(1);
      if (h && tabs.some(function (t) { return t.getAttribute("data-tab") === h; })) activate(h);
    });
  }

  /* 4. Buscador: input[data-filter="#contenedor"] filtra los [data-item] */
  function initFilter() {
    $$("[data-filter]").forEach(function (input) {
      var items = $$("[data-item]", $(input.getAttribute("data-filter")));
      input.addEventListener("input", function () {
        var q = input.value.toLowerCase().trim();
        items.forEach(function (it) { it.style.display = it.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none"; });
      });
    });
  }

  /* 5. Necesidades de industrias (se guardan en el navegador; se conecta a una base de datos después) */
  function initNeeds() {
    var form = $("#needs-form"); if (!form) return;
    var KEY = "conectamed_needs", body = $("#needs-body"), msg = $("#needs-msg"), dlg = $("#needs-dialog");
    var seed = [{ f: "15/11/2025", t: "Talento Humano", d: "10 técnicos en producción", r: "", s: "En revisión" }];
    var list = store.get(KEY, seed), open = -1;
    function draw() {
      if (!list.length) { body.innerHTML = '<tr><td colspan="5">Aún no has registrado necesidades.</td></tr>'; return; }
      body.innerHTML = list.map(function (n, i) {
        var row = "<tr><td>" + esc(n.f) + "</td><td>" + esc(n.t) + "</td><td>" + esc(n.d) + '</td><td><span class="badge">' + esc(n.s) +
          '</span></td><td><button class="link-btn" data-detail="' + i + '" type="button" aria-expanded="' + (open === i) + '">Ver detalle</button></td></tr>';
        if (open === i) row += '<tr class="detail-row"><td colspan="5"><b>Requisitos:</b> ' + esc(n.r || "Sin requisitos adicionales") +
          ' &nbsp; <button class="link-btn" data-del="' + i + '" type="button">Eliminar</button></td></tr>';
        return row;
      }).join("");
    }
    body.addEventListener("click", function (e) {
      var d = e.target.getAttribute("data-detail"), x = e.target.getAttribute("data-del");
      if (d !== null) { open = open === +d ? -1 : +d; draw(); }
      if (x !== null) { list.splice(+x, 1); open = -1; store.set(KEY, list); draw(); }
    });
    var openBtn = $("#open-needs");
    if (openBtn) openBtn.addEventListener("click", function () { msg.textContent = ""; if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); form.desc.focus(); });
    $("#cancel-needs").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = form.desc.value.trim();
      if (!d) { msg.textContent = "Describe la necesidad para poder publicarla."; form.desc.focus(); return; }
      list.unshift({ f: new Date().toLocaleDateString("es-DO"), t: form.tipo.value, d: d, r: form.req.value.trim(), s: "En revisión" });
      store.set(KEY, list); form.reset(); open = -1; draw(); dlg.close();
    });
    draw();
  }

  /* 6. Perfil profesional */
  function initProfile() {
    var form = $("#profile-form"); if (!form) return;
    var KEY = "conectamed_profile", saved = store.get(KEY, {});
    Object.keys(saved).forEach(function (k) { if (form.elements[k]) form.elements[k].value = saved[k]; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {}; $$("input,select,textarea", form).forEach(function (f) { if (f.name) data[f.name] = f.value; });
      store.set(KEY, data); $("#profile-msg").textContent = "Perfil actualizado.";
    });
  }

  /* Login de demostración */
  function initLogin() {
    var form = $("#login-form"); if (!form) return;
    var msg = $("#login-msg"), pw = $("#clave");
    $("[data-toggle-pw]").addEventListener("click", function (e) {
      var show = pw.type === "password"; pw.type = show ? "text" : "password";
      e.target.textContent = show ? "Ocultar" : "Mostrar"; e.target.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    });
    $("#forgot").addEventListener("click", function () { msg.textContent = "La recuperación de contraseña se activará cuando se conecte el sistema de usuarios."; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.correo.value.trim() || !pw.value) { msg.textContent = "Escribe tu correo y tu contraseña para continuar."; return; }
      msg.textContent = "El inicio de sesión se activará cuando se conecte el sistema de usuarios.";
    });
  }

  /* 7. Transición de página: salida suave + barra de progreso antes de navegar */
  function initTransitions() {
    var bar = document.createElement("div"); bar.className = "page-progress"; document.body.appendChild(bar);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () { location.href = url.href; }, reduce ? 0 : 300);
    });
    addEventListener("pageshow", function (e) { if (e.persisted) document.body.classList.remove("is-leaving"); });
  }

  var started = false;
  function start() {
    if (started) return; started = true;
    initTabs(); initFilter(); initNeeds(); initProfile(); initLogin(); initTransitions();
  }
  loadComponents().then(initChrome);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
