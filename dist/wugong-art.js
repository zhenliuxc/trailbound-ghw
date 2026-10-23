// Generated Wugong art bridge. Reuses existing mini-game, reward and journal controllers.
"use strict";
(() => {
  // .build/typescript/runtime/dom.js
  function createDom(document2) {
    function get(id2) {
      const element = document2.getElementById(id2);
      if (!element)
        throw new Error(`Missing game element: ${id2}`);
      return element;
    }
    function html(tag, text2, parent, className) {
      const element = document2.createElement(tag);
      if (text2)
        element.textContent = text2;
      if (className)
        element.setAttribute("class", className);
      parent?.appendChild(element);
      return element;
    }
    function text(id2, value) {
      const element = get(id2);
      if (element.textContent !== value)
        element.textContent = value;
    }
    return { document: document2, get, html, text };
  }
  var EventBindings = class {
    cleanups = [];
    listen(target, type, listener) {
      const handler = listener;
      target.addEventListener(type, handler);
      this.cleanups.push(() => target.removeEventListener?.(type, handler));
    }
    destroy() {
      for (const cleanup of this.cleanups.splice(0))
        cleanup();
    }
  };

  // .build/typescript/runtime/scene-manager.js
  function createSceneManager(options) {
    const sessions = [];
    let serial = 0;
    let background = false;
    function enter(name, returnStatus = options.status()) {
      const session = { id: ++serial, name, returnStatus };
      sessions.push(session);
      options.pause();
      return session;
    }
    function leave(session, resume = true) {
      if (!session)
        return;
      const index = sessions.indexOf(session);
      if (index < 0)
        return;
      const wasTop = index === sessions.length - 1;
      sessions.splice(index, 1);
      if (wasTop && sessions.length === 0 && resume && session.returnStatus === "walking" && !background && !options.hidden())
        options.resume();
    }
    return {
      enter,
      leave,
      get active() {
        return sessions.at(-1)?.name ?? "journey";
      },
      get background() {
        return background;
      },
      isTop(session) {
        return !!session && sessions.at(-1) === session;
      },
      canAnimate(hasMini) {
        if (background || options.hidden())
          return false;
        const active = sessions.at(-1)?.name;
        return active === "minigame" ? hasMini : !active && options.status() === "walking";
      },
      suspend() {
        background = true;
        for (const session of sessions)
          session.returnStatus = "paused";
        options.pause();
      },
      foreground() {
        background = false;
      },
      reset() {
        sessions.splice(0);
      }
    };
  }

  // .build/typescript/runtime/journal-controller.js
  function createJournalController(options) {
    const { dom: dom2, catalog: D, data, scenes: scenes2 } = options;
    const { get: $2, html } = dom2;
    const bindings = new EventBindings();
    const pictures = /* @__PURE__ */ new Map();
    let records = D.loadMoments(options.storage);
    let tripMoments = [];
    let route = "all";
    let pageSize = data.PAGE_SIZE;
    let session = null;
    let trigger = null;
    let bodyOverflow = "";
    let entries = [];
    let index = 0;
    let flip = null;
    let swipe = null;
    function tagImage(parent, file, label, reading, moment) {
      const key = file + "|" + label;
      const cached = reading && pictures.get(key);
      if (cached) {
        parent.appendChild(cached);
        return cached;
      }
      const badge2 = html("span", null, parent, "journal-badge-art journal-tag-art");
      badge2.setAttribute("role", "img");
      badge2.setAttribute("aria-label", label + " · 手绘收藏标签");
      const status = html("span", "画作展开中", badge2, "journal-art-status");
      const image = html("img", null, badge2, "journal-tag-image");
      status.setAttribute("aria-hidden", "true");
      image.setAttribute("alt", "");
      image.setAttribute("loading", reading ? "eager" : "lazy");
      image.setAttribute("decoding", "async");
      image.style.opacity = "0";
      if (reading)
        pictures.set(key, badge2);
      const reveal = () => {
        status.hidden = true;
        image.style.opacity = "1";
      };
      let presented = false;
      image.onload = () => {
        if (!presented && options.presentArt) {
          presented = true;
          const file2 = options.presentArt(image, moment);
          if (file2) {
            image.src = file2;
            return;
          }
        }
        if (reading && image.decode)
          image.decode().then(reveal, reveal);
        else
          reveal();
      };
      image.onerror = () => {
        status.textContent = "画作暂未加载";
        image.hidden = true;
        badge2.setAttribute("aria-label", label + " · 画作暂未加载，文字回忆仍可阅读");
      };
      image.setAttribute("src", file);
      return badge2;
    }
    function badge(parent, moment, reading = false) {
      if (moment.edition === 3 && !D.hasTag(moment)) {
        const note = html("span", null, parent, "journal-memory-label");
        const svg = dom2.document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 72 44");
        svg.setAttribute("aria-hidden", "true");
        const path = dom2.document.createElementNS("http://www.w3.org/2000/svg", "path");
        for (const [key, value] of Object.entries({ d: "M8 34L25 12L37 28L47 18L65 34M20 34H54M26 38H47", fill: "none", stroke: "currentColor", "stroke-width": "1.3", "stroke-linecap": "round", "stroke-linejoin": "round" }))
          path.setAttribute(key, value);
        svg.appendChild(path);
        note.appendChild(svg);
        html("span", "沿途记事", note);
        html("small", "未获得标签", note);
        return note;
      }
      const file = D.tagArt(moment);
      if (file)
        return tagImage(parent, file, moment.tag || moment.title, reading, moment);
      const entryIndex = Math.max(0, D.CATALOG.findIndex((entry) => entry.id === moment.id));
      const i = entryIndex % 9;
      const node = html("span", null, parent, "journal-badge-art");
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", moment.title + "的山野徽章");
      node.style.backgroundImage = `url('badges/${["moments-v1", "moments-expansion-v1", "moments-westlake-v2"][Math.floor(entryIndex / 9)]}.webp')`;
      node.style.backgroundPosition = `${i % 3 * 50}% ${Math.floor(i / 3) * 50}%`;
      return node;
    }
    function render(append = false) {
      const list = $2("journal-list");
      const book = data.page(records, route, pageSize);
      $2("journal-count").textContent = `${book.totalAll}个瞬间`;
      $2("trip-count").textContent = `本次记下${options.tripCount()}个瞬间`;
      const routeName = options.routes.find((r) => r.id === route)?.name || "全部路线";
      $2("journal-filter-count").textContent = book.total ? `${routeName} · ${book.total}段回忆${book.remaining ? `，已展示${book.entries.length}段` : ""}` : `${routeName} · 等待新的回忆`;
      $2("journal-more").hidden = book.remaining === 0;
      $2("journal-more").textContent = `再翻${Math.min(data.PAGE_SIZE, book.remaining)}段回忆 ↓`;
      const offset = append ? list.children.length : 0;
      if (!append)
        list.replaceChildren();
      if (!book.total) {
        const empty = html("li", null, list, "journal-empty");
        html("strong", "这一页，留给下一次相遇", empty);
        html("p", "一阵风、一片落叶，或一段安静的水声。沿途收下的手绘和回忆，会一起留在这里。", empty);
        return;
      }
      for (const moment of book.entries.slice(offset)) {
        const li = html("li", null, list, "journal-entry found");
        li.setAttribute("data-route", moment.route);
        li.setAttribute("data-moment", moment.key);
        li.setAttribute("data-kind", D.hasTag(moment) ? "tag" : "note");
        const button = html("button", null, li, "journal-wall-button");
        for (const [key, value] of Object.entries({ type: "button", "aria-haspopup": "dialog", "aria-controls": "journal-detail", "aria-expanded": "false", "aria-label": "翻看" + moment.title + " · " + moment.place }))
          button.setAttribute(key, value);
        badge(button, moment);
        html("strong", moment.title, button, "journal-wall-title");
        html("small", moment.place.split(" · ")[0], button, "journal-wall-place");
        html("span", "翻看回忆 ↗", button, "journal-wall-hint").setAttribute("aria-hidden", "true");
        button.addEventListener("click", () => open(moment, button));
      }
    }
    function renderDetail(direction = 0) {
      const moment = entries[index];
      if (!moment)
        return;
      const page = $2("journal-detail-page");
      flip?.cancel();
      flip = null;
      page.replaceChildren();
      page.scrollTop = 0;
      if (D.hasTag(moment)) {
        const art = html("div", null, page, "journal-illustration");
        badge(art, moment, true);
        html("span", "一幅手绘，留住这一刻", art, "journal-art-caption");
      }
      const copy2 = html("div", null, page, "journal-copy");
      html("p", moment.place, copy2, "journal-location");
      html("h3", moment.title, copy2, "journal-entry-title").id = "journal-detail-title";
      html("p", moment.memory, copy2, "journal-memory");
      const meta = html("div", null, copy2, "journal-entry-meta");
      if (typeof moment.createdAt === "number" && Number.isFinite(moment.createdAt)) {
        const date = new Date(moment.createdAt);
        const time = html("time", date.toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }), meta, "journal-time");
        time.setAttribute("datetime", date.toISOString());
      } else
        html("span", "从旧手帐留下", meta, "journal-time");
      if (!D.hasTag(moment))
        html("span", "沿途记事", meta, "journal-entry-kind");
      const weather = moment.weather && options.weather[moment.weather];
      if (weather)
        html("span", weather.name, meta, "journal-entry-weather");
      const proof = moment.edition === 3 ? options.evidence(moment.id) : null;
      const observation = proof ? null : options.observation(moment.id);
      const note = proof || observation;
      const source = proof || observation && options.source(observation.source);
      if (note && source) {
        const detail = html("details", null, copy2, "journal-place-note");
        html("summary", "关于这片山野", detail);
        html("p", note.fact, detail);
        const link = html("a", source.name + " ↗", detail, "journal-source");
        link.setAttribute("href", source.url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
      $2("journal-detail-route").textContent = options.routes.find((r) => r.id === moment.route)?.name || moment.place;
      $2("journal-detail-position").textContent = `${index + 1} / ${entries.length}`;
      $2("journal-detail-announcement").textContent = `第${index + 1}段，共${entries.length}段：${moment.title}`;
      const previous = entries[index - 1], next = entries[index + 1];
      const controls = [["journal-detail-prev", previous, "上一枚"], ["journal-detail-next", next, "下一枚"]];
      for (const [id2, entry, label] of controls) {
        $2(id2).setAttribute("aria-disabled", String(!entry));
        $2(id2).setAttribute("aria-label", entry ? label + "：" + entry.title : label === "上一枚" ? "已是第一枚" : "已是最后一枚");
      }
      $2("journal-detail-hint").textContent = entries.length === 1 ? "这一刻，值得留住" : !previous ? "从这一枚，慢慢翻看" : !next ? "已翻到最后一枚" : "左右翻看沿途回忆";
      const keep = /* @__PURE__ */ new Set();
      for (const entry of [previous, moment, next]) {
        if (!entry || !D.hasTag(entry))
          continue;
        const file = D.tagArt(entry);
        if (!file)
          continue;
        const label = entry.tag || entry.title, key = file + "|" + label;
        keep.add(key);
        if (!pictures.has(key))
          tagImage(html("div"), file, label, true, entry);
      }
      for (const key of pictures.keys())
        if (!keep.has(key))
          pictures.delete(key);
      if (direction && !options.reduced && page.animate)
        flip = page.animate([{ opacity: 0.35, transform: `translateX(${direction * 16}px)` }, { opacity: 1, transform: "translateX(0)" }], { duration: 220, easing: "ease-out" });
    }
    function open(moment, button) {
      if (session || options.rewardOpen())
        return;
      entries = data.page(records, route, D.MAX_MOMENTS).entries;
      index = entries.findIndex((entry) => entry.route === moment.route && entry.id === moment.id);
      if (index < 0)
        return;
      renderDetail();
      $2("journal-detail").setAttribute("aria-modal", "true");
      $2("journal-detail").showModal();
      session = scenes2.enter("journal");
      trigger = button;
      button.setAttribute("aria-expanded", "true");
      bodyOverflow = dom2.document.body.style.overflow || "";
      dom2.document.body.style.overflow = "hidden";
      options.pauseInteraction();
      options.stopLoop();
      options.refresh();
      $2("journal-detail-close").focus({ preventScroll: true });
    }
    function closed(resume = true) {
      if (!session)
        return;
      const closing2 = session;
      session = null;
      dom2.document.body.style.overflow = bodyOverflow;
      swipe = null;
      flip?.cancel();
      flip = null;
      trigger?.setAttribute("aria-expanded", "false");
      scenes2.leave(closing2, resume);
      options.refresh();
      if (trigger?.isConnected)
        trigger.focus({ preventScroll: true });
      trigger = null;
      entries = [];
      pictures.clear();
      $2("journal-detail-page").replaceChildren();
    }
    function close(resume = true) {
      closed(resume);
      $2("journal-detail").close();
    }
    function turn(direction) {
      const next = index + direction;
      if (!session || next < 0 || next >= entries.length)
        return;
      index = next;
      renderDetail(direction);
    }
    function remember(moment) {
      if (!D.hasTag(moment))
        return;
      tripMoments.push(moment);
      const result = data.remember(records, moment);
      if (result.status === "full")
        $2("journal-storage").textContent = "手帐已满，原回忆已保留。这个新片刻仍可在本次旅程结尾查看。";
      else if (result.status !== "unchanged") {
        records = result.moments;
        $2("journal-storage").textContent = D.saveMoments(options.storage, records) ? "回忆自动保存在这个浏览器，相同的片刻只留一页。" : "这个浏览器无法保存手帐，本次打开页面期间仍可以记下瞬间。";
      }
      const message = result.status === "unchanged" ? "再次遇见，手帐中已留存" : result.status === "upgraded" ? "手帐已补上手绘" : "刚刚收下标签";
      $2("discovery-status").textContent = `${message}「${moment.title}」 · ${moment.place}`;
      render();
      options.onRemember(moment);
    }
    function renderEnding() {
      const section = $2("ending-journal"), list = $2("ending-badges"), detail = $2("ending-detail");
      const collected2 = tripMoments.filter((moment) => D.hasTag(moment));
      section.hidden = !collected2.length;
      list.replaceChildren();
      detail.textContent = "";
      for (const moment of collected2) {
        const button = html("button", null, list, "ending-badge-button");
        button.setAttribute("type", "button");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "ending-detail");
        button.setAttribute("aria-label", "翻看" + moment.title);
        badge(button, moment);
        html("small", moment.title, button);
        button.addEventListener("click", () => {
          const expanded = button.getAttribute("aria-expanded") === "true";
          for (const b of Array.from(list.children))
            b.setAttribute("aria-expanded", "false");
          button.setAttribute("aria-expanded", String(!expanded));
          detail.textContent = expanded ? "" : moment.place + " · " + moment.memory;
        });
      }
    }
    function bind() {
      const dialog = $2("journal-detail");
      bindings.listen($2("journal-detail-close"), "click", () => close());
      bindings.listen($2("journal-detail-prev"), "click", () => turn(-1));
      bindings.listen($2("journal-detail-next"), "click", () => turn(1));
      bindings.listen(dialog, "close", () => closed());
      bindings.listen(dialog, "keydown", (event) => {
        event.stopPropagation();
        const target = event.target;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName))
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          turn(event.key === "ArrowLeft" ? -1 : 1);
        }
      });
      const page = $2("journal-detail-page");
      bindings.listen(page, "pointerdown", (event) => {
        swipe = null;
        if (event.pointerType !== "touch" || !event.isPrimary || event.target.closest?.("button,a,summary,details"))
          return;
        swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, scroll: page.scrollTop };
      });
      bindings.listen(page, "pointerup", (event) => {
        const start = swipe;
        swipe = null;
        if (!start || start.id !== event.pointerId || event.timeStamp - start.time > 650 || Math.abs(page.scrollTop - start.scroll) > 8)
          return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.7)
          turn(dx < 0 ? 1 : -1);
      });
      bindings.listen(page, "pointercancel", () => {
        swipe = null;
      });
      for (const r of options.routes)
        html("option", r.name, $2("journal-route")).setAttribute("value", r.id);
      bindings.listen($2("journal-route"), "change", () => {
        const selected = $2("journal-route").value;
        route = options.routes.find((r) => r.id === selected)?.id || "all";
        pageSize = data.PAGE_SIZE;
        render();
      });
      bindings.listen($2("journal-more"), "click", () => {
        const previous = $2("journal-list").children.length;
        pageSize += data.PAGE_SIZE;
        render(true);
        $2("journal-list").children[previous]?.querySelector("button")?.focus();
      });
    }
    bind();
    return {
      get open() {
        return session !== null;
      },
      get records() {
        return records;
      },
      render,
      renderEnding,
      remember,
      close,
      reload() {
        records = D.loadMoments(options.storage);
        render();
      },
      resetTrip() {
        tripMoments = [];
      },
      recent(routeId2) {
        return records.filter((moment) => moment.route === routeId2).slice(-3).map((moment) => moment.id);
      },
      destroy() {
        close(false);
        bindings.destroy();
      }
    };
  }

  // .build/typescript/runtime/mini-game-view.js
  function createMiniGameView({ dom: dom2, api, platform: games2, sound }) {
    const { get: $2, text, html } = dom2;
    let actionKey = null;
    const artReady = (refs) => !!refs.art && refs.contentState === "ready";
    function storyTools(s, refs, flow) {
      const controls = flow.controls;
      $2("wugong-tools").hidden = !controls;
      if (!controls)
        return;
      text("wugong-speaker", controls.speaker);
      text("wugong-line", controls.line);
      const loading = refs.contentState === "loading", failed = refs.contentState === "error";
      if ((s.game === "clouds" || s.stage === "camera") && (loading || failed))
        text("wugong-line", failed ? "画作暂未加载，请点「重新试一次」重新展开。" : "画作正在展开，稍等片刻就能操作。");
      for (const [id2, action] of [["wugong-primary", controls.primary], ["wugong-secondary", controls.secondary]]) {
        const button = $2(id2);
        button.hidden = !action;
        if (action) {
          text(id2, action.label);
          button.setAttribute("data-action", action.action);
          button.disabled = !!action.disabled || action.action === "shutter" && (loading || failed);
        }
      }
      $2("wugong-zoom").hidden = !controls.zoom;
      $2("wugong-zoom-in").disabled = (s.camera?.zoom ?? 1) >= 1.44;
      $2("wugong-zoom-out").disabled = (s.camera?.zoom ?? 1) <= 0.86;
    }
    function artTools(s, refs) {
      if (!games2)
        return;
      const flow = games2.artFlow(s), waiting = !artReady(refs);
      $2("micro-panel").setAttribute("data-phase", flow.phase);
      $2("art-tools").hidden = false;
      text("art-kicker", flow.kicker);
      text("art-count", flow.counter);
      text("art-title", s.play.complete ? "这一幅，慢慢完整了" : flow.title);
      text("art-cue", waiting ? refs.contentState === "error" ? "画作暂未加载，请点「重新试一次」重新展开。" : "水彩画作正在展开，准备好就能操作。" : flow.cue);
      const key = flow.controls.map((c) => c.action).join("|");
      if (key !== actionKey) {
        $2("art-actions").replaceChildren();
        for (const control of flow.controls) {
          const button = html("button", control.label, $2("art-actions"));
          button.type = "button";
          button.setAttribute("data-action", control.action);
        }
        actionKey = key;
      }
      for (const control of flow.controls) {
        const button = $2("art-actions").querySelector('[data-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const hints = { puzzle: "1–6 选片 · 方向键选格 · Enter 放下", match: "方向键选格 · Enter 选中／交换 · R 重试", sling: "方向键调整 · 按住空格蓄力、松开发射 · R 重试" };
      text("art-key-hint", s.game && s.game in hints ? hints[s.game] : "");
      $2("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
    }
    function wugong(s, refs) {
      if (!games2)
        return;
      const flow = games2.wugongFlow(s), panel = $2("micro-panel");
      panel.setAttribute("data-phase", flow.phase);
      panel.setAttribute("data-story-stage", s.stage || "");
      text("wind-stage-name", flow.stage);
      text("wind-count", flow.counter || flow.count + " / " + flow.total + " " + flow.unit);
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = flow.hold * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(!!s.near));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      if (flow.story)
        storyTools(s, refs, flow);
      const title = flow.story ? flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "soar" ? s.game === "clouds" ? "草脊，浮出云海" : "下次山里见" : "" : flow.phase === "invite" ? flow.title : flow.phase === "caught" ? "这一处，留住了" : flow.phase === "soar" ? "把一段石语留在心里" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", flow.kicker);
      text("wind-chapter-copy", flow.phase === "invite" ? flow.invitation : flow.phase === "memory" ? "正在展开你的手绘纪念" : s.game === "greet" ? "相遇很短，笑容留在了画里。" : s.game === "clouds" ? "雾散在山坳，云仍留在谷中。" : "石头留在原处，回忆带在身边。");
    }
    function wind(s, refs) {
      if (!games2)
        return;
      const flow = games2.flow(s), gates = s.gates || 0, stage = games2.windNames[Math.min(2, gates)];
      $2("micro-panel").setAttribute("data-phase", flow.phase);
      text("wind-stage-name", stage);
      text("wind-count", flow.counter);
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = flow.energy * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(!!s.windNear));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < gates));
      const title = flow.phase === "invite" ? "借一阵草甸的风" : flow.phase === "caught" ? flow.cue : flow.phase === "soar" ? "把风借给远方" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      text("wind-chapter-title", title);
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-kicker", flow.phase === "invite" ? "武功山 · 山野小事" : flow.phase === "caught" ? stage : "草浪来信");
      text("wind-chapter-copy", flow.phase === "invite" ? "让草浪告诉你，风往哪里去。" : flow.phase === "caught" ? gates === 1 ? "侧风会带动纸鸢，顺着风带继续飞。" : "山脊已在身后，缓缓放线，借远处的气流。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : "纸鸢越过山脊，云海在眼前展开。");
      if (refs.contentState !== "ready")
        text("wind-cue", refs.contentState === "error" ? "纸鸢画作暂未加载，点「重新试一次」重新展开。" : "水彩纸鸢正在展开，准备好就能起飞。");
    }
    function water(s) {
      if (!games2)
        return;
      const flow = games2.waterFlow(s), rain = s.game === "rain";
      $2("micro-panel").setAttribute("data-phase", flow.phase === "settle" ? "soar" : flow.phase);
      text("wind-stage-name", rain ? "把雨接成一首歌" : ["初入浅溪", "绕过青石", "漂向下游"][Math.min(2, s.gates || 0)]);
      text("wind-count", flow.count + " / " + flow.total + (rain ? " 滴雨" : " 处水口"));
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = s.play.progress * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(flow.pulse > 0));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      const title = flow.phase === "invite" ? rain ? "听一筒竹林的雨" : "陪一片叶子顺流而下" : flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "settle" ? rain ? "八滴雨，一段回声" : "把溪声寄向远方" : "";
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", rain ? "莫干山 · 竹雨成曲" : "九溪 · 一叶顺流");
      text("wind-chapter-copy", flow.phase === "invite" ? rain ? "看叶尖蓄水，让竹筒等在雨滴下面。" : "水纹有方向，轻轻拨水，绕过青石。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : rain ? "雨滴在竹筒里，留下最后一圈涟漪。" : "落叶慢慢漂远，溪水还在轻轻流。");
    }
    function update(s, refs) {
      if (refs.mogan || refs.tiger) {
      } else if (s.game && games2?.artAssets[s.game])
        artTools(s, refs);
      else if (s.game && games2?.wugongAssets[s.game])
        wugong(s, refs);
      else if (s.game === "wind")
        wind(s, refs);
      else if (s.game)
        water(s);
      if (s.game) {
        $2("mini-retry").disabled = s.play.complete;
        text("mini-sound", sound() ? "声音 · 开" : "声音 · 点击开启");
        $2("mini-sound").setAttribute("aria-pressed", String(sound()));
      }
      const progress = Math.round(s.play.progress * 100);
      $2("micro-progress").setAttribute("aria-valuenow", String(progress));
      $2("micro-progress-fill").style.width = progress + "%";
      const status = refs.art && !artReady(refs) ? $2("art-cue").textContent || "" : s.game === "clouds" && refs.contentState !== "ready" ? refs.contentState === "error" ? "云海暂未加载，请点「重新试一次」。" : "云海正在展开…" : api.status(s) + (s.game === "clouds" ? " · " + (s.gates || 0) + " / 3" : "");
      text("micro-result", status);
    }
    return { update, reset() {
      actionKey = null;
    }, artReady };
  }

  // .build/typescript/runtime/mini-game-controller.js
  function createMiniGameController(options) {
    const { dom: dom2, scenes: scenes2, platform: games2, catalog: D } = options, { get: $2, text } = dom2;
    const bindings = new EventBindings();
    const registered = /* @__PURE__ */ new Map();
    let api = options.api;
    let current = null;
    let currentEntry = null;
    let refs = null;
    let session = null;
    let pendingPoint = null;
    let pointer = null;
    let soundSerial = 0;
    let genericCompletionSound = false;
    const view = createMiniGameView({ dom: dom2, api: { ...options.api, status: (state) => api.status(state) }, platform: games2, sound: options.sound });
    const surface = $2("micro-surface");
    function interactive() {
      return !!current && scenes2.isTop(session) && !scenes2.background && !dom2.document.hidden;
    }
    function paint() {
      if (current && refs)
        api.paint(refs, current, options.reduced);
    }
    function updateStatus() {
      if (!current || !refs)
        return;
      view.update(current, refs);
      api.present?.(current, refs);
      if (current.game) {
        if (current.game === "wind" && games2)
          options.audio.wind?.(games2.flow(current).energy, current.play.complete);
        for (const event of current.events || [])
          if (event.serial > soundSerial) {
            options.audio.mini?.(current.game, event.type, { x: event.x, index: event.index ?? (current.caught || current.gates) });
            soundSerial = event.serial;
          }
      }
    }
    function clearPointer() {
      pendingPoint = null;
      const previous = pointer;
      pointer = null;
      if (previous)
        try {
          if (surface.hasPointerCapture?.(previous.id))
            surface.releasePointerCapture(previous.id);
        } catch {
        }
    }
    function pause() {
      clearPointer();
      if (current)
        current = api.release(current);
    }
    function inputReady(input = {}) {
      if (!interactive() || !current || !refs)
        return false;
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready")
        return false;
      if (refs.art && !view.artReady(refs))
        return false;
      if ((current.game === "wind" || current.game === "clouds") && refs.contentState !== "ready")
        return false;
      if (refs.story && refs.contentState !== "ready" && (input.action === "shutter" || input.assist && current.game === "greet" && current.stage === "camera"))
        return false;
      return true;
    }
    function perform(input = {}) {
      if (!inputReady(input) || !current)
        return;
      const next = api.act(current, input);
      if (next === current)
        return;
      current = next;
      if (!current.game) {
        paint();
        options.audio.interact?.(current.kind, { x: current.x, icon: D.item(current.id).icon, playType: current.play.type });
      }
      updateStatus();
      options.refresh();
    }
    function begin(entry, returnStatus) {
      if (current)
        finish2(false, false);
      options.stopLoop();
      session = scenes2.enter("minigame", returnStatus);
      api = registered.get(entry.id) || options.api;
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      currentEntry = entry;
      soundSerial = 0;
      genericCompletionSound = false;
      pendingPoint = null;
      view.reset();
      $2("mini-retry").disabled = false;
      $2("micro-art").replaceChildren();
      refs = api.draw(options.svg, $2("micro-art"), entry);
      refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || refs.tiger || current.game === "wind");
      if (refs.waitsForArt)
        refs.contentState = "loading";
      surface.setAttribute("aria-busy", String(refs.waitsForArt));
      paint();
      $2("wugong-tools").hidden = true;
      $2("art-tools").hidden = true;
      $2("mogan-tools").hidden = !refs.mogan;
      $2("tiger-tools").hidden = !refs.tiger;
      $2("micro-panel").setAttribute("data-tiger", String(!!refs.tiger));
      $2("micro-panel").setAttribute("data-mogan", String(!!refs.mogan));
      $2("micro-panel").setAttribute("data-art-game", String(!!refs.art));
      $2("micro-panel").setAttribute("data-game", current.game || "");
      $2("wind-hud").hidden = !current.game || !!refs.art || !!refs.mogan || !!refs.tiger;
      const labels = { wind: "武功山 · 借风", clouds: "武功山 · 拨云见山", altar: "武功山 · 金顶石语", greet: "武功山 · 风口相遇", creek: "九溪 · 推叶", rain: "莫干山 · 接雨" };
      $2("mini-place-label").textContent = current.game && current.game in labels ? labels[current.game] : "";
      $2("mini-controls").hidden = !current.game;
      options.cache?.request(entry.artV5 || entry.artV4 || entry.badge, "high");
      text("micro-place", entry.place + " · " + entry.condition);
      text("micro-title", entry.name);
      text("micro-instruction", api.instruction(entry));
      const keyHints = { puzzle: "1–6 选片，方向键选格，Enter 放下。", match: "方向键选卡，Enter 选中或交换。", sling: "方向键调整，按住空格蓄力、松开发射。", greet: "方向键取景，＋／－调整远近，空格拍照。", clouds: "方向键选择云朵，空格或 Enter 吹散。" };
      const keyHint = current.game && current.game in keyHints ? keyHints[current.game] : "";
      surface.setAttribute("aria-label", (dom2.get("micro-instruction").textContent || "") + (keyHint ? " 键盘辅助：" + keyHint : ""));
      updateStatus();
      $2("micro-panel").hidden = false;
      options.refresh();
      const assets = api.assets?.(entry) || current.game && (games2?.artAssets[current.game] || games2?.wugongAssets[current.game] || games2?.waterAssets[current.game]);
      const scene = assets && assets.scene || "scenes/" + entry.route + "-v1.webp";
      const actor = entry.id === "meadow-bird" ? "sprites/wugong-swallow-kite-v1.webp" : assets && assets.actor;
      const front = entry.id === "meadow-bird" ? "sprites/wugong-meadow-grass-v1.webp" : current.game === "creek" ? assets && assets.stone : assets && assets.front;
      const sceneAsset = options.cache?.request(scene, "high") || null;
      const actorAsset = actor ? options.cache?.request(actor, "high") || null : null;
      const frontAsset = front ? options.cache?.request(front, "high") || null : null;
      const hintAsset = assets && assets.hint ? options.cache?.request(assets.hint, "high") || null : null;
      const openingRefs = refs;
      if (openingRefs.waitsForArt && !api.mount) {
        openingRefs.contentState = sceneAsset ? "loading" : "error";
        const assetsToWait = [sceneAsset, actorAsset, frontAsset].filter((asset) => !!asset);
        Promise.all(assetsToWait.map((asset) => asset.promise)).then((items) => {
          if (openingRefs.disposed || refs !== openingRefs)
            return;
          openingRefs.contentState = sceneAsset && items.every((item) => item.state === "ready") && (!actor || actorAsset) && (!front || frontAsset) ? "ready" : "error";
          surface.setAttribute("aria-busy", "false");
          updateStatus();
        });
      }
      if (api.mount) {
        const adapter = api;
        Promise.resolve().then(() => {
          if (!openingRefs.disposed && refs === openingRefs)
            return adapter.mount?.(openingRefs, { pixi: options.pixi, host: surface, cache: options.cache, entry });
        }).catch(() => {
          if (openingRefs.disposed || refs !== openingRefs)
            return;
          openingRefs.contentState = "error";
          surface.setAttribute("aria-busy", "false");
          paint();
          updateStatus();
        });
      } else
        games2?.mount(openingRefs, options.pixi, surface, sceneAsset, actorAsset, frontAsset, hintAsset);
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function finish2(record = true, resume = true) {
      if (!current || !currentEntry || !refs || !session)
        return;
      const finished = current, closingRefs = refs, closing2 = session, entry = currentEntry;
      pause();
      current = null;
      currentEntry = null;
      refs = null;
      session = null;
      try {
        if (api.dispose)
          api.dispose(closingRefs);
        else
          games2?.dispose(closingRefs);
      } catch {
      }
      closingRefs.disposed = true;
      $2("micro-panel").hidden = true;
      options.stopLoop();
      let rewardShown = false;
      if (record && finished.play.complete === true)
        rewardShown = options.onFinished({ state: finished, entry, outcome: api.outcome(finished, entry), returnStatus: closing2.returnStatus });
      scenes2.leave(closing2, resume && !rewardShown);
      options.onClosed?.(finished.id, finished.play.complete === true, resume);
      options.refresh();
      if (resume && !rewardShown)
        $2("walk-toggle").focus({ preventScroll: true });
    }
    function update(dt) {
      if (!interactive() || !current || !refs)
        return;
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready") {
        updateStatus();
        paint();
        return;
      }
      if (pendingPoint) {
        current = api.move(current, pendingPoint);
        pendingPoint = null;
      }
      current = api.tick(current, dt);
      if (!current.game && current.play.complete && !genericCompletionSound) {
        genericCompletionSound = true;
        options.audio.mini?.("memory", "complete");
      }
      updateStatus();
      paint();
      if (current.done)
        finish2(true);
    }
    function point2(event) {
      const rect = surface.getBoundingClientRect();
      const p = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      return refs && api.point ? api.point(refs, p) : refs && games2 ? games2.point(refs, p) : p;
    }
    function retry() {
      if (!interactive() || !current || !currentEntry || current.play.complete || !refs)
        return;
      const entry = currentEntry;
      pause();
      if (refs.waitsForArt && refs.contentState === "error") {
        const returnStatus = session?.returnStatus;
        finish2(false, false);
        begin(entry, returnStatus);
        return;
      }
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      soundSerial = 0;
      genericCompletionSound = false;
      updateStatus();
      paint();
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function action(name, value) {
      if (!interactive() || !current || !refs)
        return;
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready")
        return;
      if (refs.art && !view.artReady(refs))
        return;
      pause();
      perform({ action: name, value });
    }
    function cancelGesture() {
      pause();
      paint();
      updateStatus();
    }
    function keydown(event) {
      if (!interactive() || !current || !refs)
        return;
      if (current.game && event.key.toLowerCase() === "r") {
        event.preventDefault();
        retry();
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey)
        return;
      const arrows = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] };
      if (api.key) {
        if (event.repeat && !arrows[event.key]) {
          event.preventDefault();
          return;
        }
        if (!inputReady())
          return;
        const next = api.key(current, event.key, "down");
        if (next) {
          event.preventDefault();
          current = next;
          paint();
          updateStatus();
          options.ensureLoop();
        }
        return;
      }
      if (refs.art) {
        const supported = !!arrows[event.key] || ["Enter", " "].includes(event.key) || current.game === "puzzle" && /^[1-6]$/.test(event.key);
        if (!supported)
          return;
        event.preventDefault();
        if (!view.artReady(refs) || event.repeat && !arrows[event.key] || !games2)
          return;
        current = games2.artKey(current, event.key);
        paint();
        updateStatus();
        options.ensureLoop();
        return;
      }
      if (arrows[event.key]) {
        event.preventDefault();
        if (!inputReady())
          return;
        const [dx, dy] = arrows[event.key];
        current = api.release(api.move(current, { x: current.x + dx, y: current.y + dy, key: true, dx, dy }));
        paint();
        updateStatus();
        options.ensureLoop();
        return;
      }
      if (current.game !== "clouds" && current.game !== "greet")
        return;
      let name = null;
      if (event.key === "Enter" || event.key === " ")
        name = current.game === "clouds" ? "blow" : current.stage === "camera" ? "shutter" : current.stage === "review" && !current.capture?.ok ? "retake" : "advance";
      else if (current.game === "greet" && ["+", "=", "-", "_"].includes(event.key))
        name = ["-", "_"].includes(event.key) ? "zoom-out" : "zoom-in";
      if (!name)
        return;
      event.preventDefault();
      if (!event.repeat)
        action(name);
    }
    function bind() {
      bindings.listen($2("micro-skip"), "click", () => finish2());
      bindings.listen(surface, "click", (event) => {
        if (event.detail > 0)
          return;
        perform({ assist: true });
      });
      bindings.listen(surface, "keydown", keydown);
      bindings.listen(surface, "keyup", (event) => {
        if (interactive() && current && (refs?.mogan || refs?.tiger) && api.key && inputReady()) {
          const next = api.key(current, event.key, "up");
          if (next) {
            event.preventDefault();
            current = next;
            paint();
            updateStatus();
            options.ensureLoop();
          }
          return;
        }
        if (!interactive() || !current || !refs?.art || event.key !== " " || !games2)
          return;
        event.preventDefault();
        if (!view.artReady(refs))
          return;
        current = games2.artKey(current, event.key, "up");
        paint();
        updateStatus();
        options.ensureLoop();
      });
      bindings.listen(surface, "pointerdown", (event) => {
        if (!inputReady() || pointer || event.isPrimary === false || event.button !== void 0 && event.button !== 0 || !current)
          return;
        event.stopPropagation?.();
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, drag: false };
        surface.setPointerCapture?.(event.pointerId);
        if (current.game)
          perform({ ...point2(event), ...refs?.art || refs?.mogan || refs?.tiger || current.game === "clouds" ? { phase: "press" } : {} });
      });
      bindings.listen(surface, "pointermove", (event) => {
        if (!interactive() || !current)
          return;
        if (!pointer) {
          if (event.pointerType === "mouse" && api.hover && inputReady()) {
            const next = api.hover(current, point2(event));
            if (next !== current) {
              current = next;
              options.ensureLoop();
            }
          }
          return;
        }
        if (pointer.id !== event.pointerId)
          return;
        event.stopPropagation?.();
        if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8)
          pointer.drag = true;
        if (!pointer.drag)
          return;
        const input = { ...point2(event), gesture: "drag" };
        if (current.game) {
          pendingPoint = input;
          options.ensureLoop();
          return;
        }
        if (!current.acted) {
          const rect = surface.getBoundingClientRect();
          perform({ x: (pointer.x - rect.left) / rect.width, y: (pointer.y - rect.top) / rect.height, gesture: "drag" });
        }
        if (current)
          current = api.move(current, input);
        updateStatus();
        paint();
      });
      bindings.listen(surface, "pointerup", (event) => {
        if (!interactive() || !pointer || pointer.id !== event.pointerId || !current)
          return;
        event.stopPropagation?.();
        const dragged = pointer.drag, input = { ...point2(event), gesture: dragged ? "drag" : "tap" };
        if (refs?.art || refs?.mogan || refs?.tiger || current.game === "clouds") {
          pendingPoint = null;
          if (dragged && refs && (view.artReady(refs) || (refs.mogan || refs.tiger || current.game === "clouds") && refs.contentState === "ready"))
            current = api.move(current, input);
          perform({ ...input, phase: "release", dragged });
        } else if (dragged) {
          pendingPoint = null;
          current = api.release(api.move(current, input));
        } else
          perform(input);
        pointer = null;
        if (surface.hasPointerCapture?.(event.pointerId))
          surface.releasePointerCapture(event.pointerId);
        paint();
      });
      bindings.listen(surface, "pointercancel", cancelGesture);
      bindings.listen(surface, "lostpointercapture", (event) => {
        if (pointer?.id === event.pointerId)
          cancelGesture();
      });
      bindings.listen(surface, "blur", () => {
        if (current?.sling?.charge)
          cancelGesture();
        if (refs?.mountain) {
          cancelGesture();
          return;
        }
        if (current?.game?.startsWith("tiger-") && api.key) {
          const heldKeys = current.game === "tiger-climb" ? ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"] : ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
          for (const key of heldKeys) {
            current = api.key(current, key, "up") || current;
          }
          paint();
          updateStatus();
        }
      });
      bindings.listen($2("mini-retry"), "click", retry);
      bindings.listen($2("mini-sound"), "click", async () => {
        await options.toggleSound();
        updateStatus();
      });
      bindings.listen($2("art-actions"), "click", (event) => {
        const button = event.target.closest?.("button[data-action]");
        const name = button?.getAttribute("data-action");
        if (button && !button.disabled && name)
          action(name);
      });
      for (const id2 of ["wugong-primary", "wugong-secondary"])
        bindings.listen($2(id2), "click", () => {
          const name = $2(id2).getAttribute("data-action");
          if (name)
            action(name);
        });
      bindings.listen($2("wugong-zoom-in"), "click", () => action("zoom-in"));
      bindings.listen($2("wugong-zoom-out"), "click", () => action("zoom-out"));
    }
    bind();
    return {
      get state() {
        return current;
      },
      get active() {
        return current !== null;
      },
      begin,
      finish: finish2,
      update,
      pause,
      retry,
      action,
      /** New typed adapters can be installed without adding a dispatch branch to app.js. */
      registerGame(ids, adapter) {
        for (const id2 of ids)
          registered.set(id2, adapter);
      },
      destroy() {
        finish2(false, false);
        bindings.destroy();
        registered.clear();
      }
    };
  }

  // .build/typescript/runtime/reward-controller.js
  function createRewardController(options) {
    const { dom: dom2, scenes: scenes2, catalog: D } = options, { get: $2 } = dom2;
    const bindings = new EventBindings();
    let current = null;
    let session = null;
    let collecting = false;
    let flight = null;
    let bodyOverflow = "";
    let imageEntry = null;
    let imageListener = null;
    function close(resume = true) {
      if (!current)
        return;
      const wasMini = !!options.gameKind(current.id), closing2 = session;
      current = null;
      session = null;
      collecting = false;
      flight?.cancel();
      flight = null;
      if (imageEntry && imageEntry.onChange === imageListener)
        imageEntry.onChange = null;
      imageEntry = null;
      imageListener = null;
      $2("wind-keepsake").hidden = true;
      $2("reward-overlay").hidden = true;
      $2("app-main").removeAttribute("inert");
      dom2.document.body.style.overflow = bodyOverflow;
      scenes2.leave(closing2, resume);
      options.refresh();
      if (resume) {
        $2("walk-toggle").focus({ preventScroll: true });
        if (wasMini && !options.reduced && !options.autoCollect)
          $2("journey-stage").animate?.([{ opacity: 0.6, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
      }
    }
    function show(moment, returnStatus) {
      if (!D.hasTag(moment) || options.autoCollect && (!moment.earned || moment.edition !== 3))
        return false;
      if (current)
        close(false);
      current = moment;
      collecting = false;
      session = scenes2.enter("reward", returnStatus);
      const game = options.gameKind(moment.id);
      $2("reward-overlay").setAttribute("data-wind", String(!!game));
      $2("reward-overlay").setAttribute("data-collecting", "false");
      $2("reward-overlay").setAttribute("data-auto", String(!!options.autoCollect));
      $2("reward-continue").disabled = false;
      $2("reward-continue").hidden = !!options.autoCollect;
      $2("reward-continue").textContent = game ? "收进手帐，继续走 →" : "收好徽章 →";
      const file = D.tagArt(moment), cached = options.cache?.request(file, "high") || null;
      const display = () => {
        if (current !== moment)
          return;
        let image = $2("reward-art");
        if (options.presentArt && current) {
          const framed = cached?.state === "ready" ? options.presentArt(cached.image, current) : null;
          const source = framed || file;
          if (source && image.getAttribute("src") !== source)
            image.setAttribute("src", source);
        } else if (cached?.state === "ready" && cached.image !== image) {
          image.removeAttribute("id");
          cached.image.id = "reward-art";
          cached.image.setAttribute("class", "reward-art");
          image.replaceWith(cached.image);
          image = cached.image;
        }
        if (!cached && file)
          image.setAttribute("src", file);
        image.setAttribute("alt", (moment.tag || moment.title) + " · 手绘水彩徽章");
        image.hidden = !!cached && cached.state !== "ready";
        $2("reward-loading").hidden = !cached || cached.state === "ready";
        $2("reward-loading").textContent = cached?.state === "error" ? "画作暂未加载，可收好后在手帐查看。" : "正在展开手绘纪念…";
      };
      if (cached) {
        imageEntry = cached;
        imageListener = display;
        cached.onChange = display;
      }
      display();
      $2("reward-title").textContent = moment.tag || moment.title;
      $2("reward-place").textContent = moment.place;
      $2("reward-copy").textContent = D.item(moment.id).result;
      $2("reward-overlay").hidden = false;
      $2("app-main").setAttribute("inert", "");
      bodyOverflow = dom2.document.body.style.overflow || "";
      dom2.document.body.style.overflow = "hidden";
      options.stopLoop();
      options.refresh();
      if (options.autoCollect) {
        $2("reward-dialog").setAttribute("tabindex", "-1");
        $2("reward-dialog").focus({ preventScroll: true });
      } else
        $2("reward-continue").focus({ preventScroll: true });
      options.audio.mini?.(game || "memory", "reveal");
      if (options.autoCollect && !dom2.document.hidden)
        collect();
      return true;
    }
    function collect() {
      if (!current || collecting)
        return;
      if (options.onCollected?.(current) === false) {
        $2("reward-continue").hidden = false;
        $2("reward-continue").textContent = "重试保存";
        $2("reward-continue").focus({ preventScroll: true });
        return;
      }
      if (options.autoCollect)
        $2("reward-continue").hidden = true;
      const game = options.gameKind(current.id);
      options.audio.mini?.(game || "memory", "collect");
      const targetElement = $2(options.autoCollect ? "reward-overlay" : "reward-dialog");
      if (!targetElement.animate || !options.autoCollect && (!game || options.reduced)) {
        close();
        return;
      }
      collecting = true;
      const moment = current;
      $2("reward-continue").disabled = true;
      $2("reward-overlay").setAttribute("data-collecting", "true");
      $2("wind-keepsake").hidden = !!options.autoCollect;
      let animation2;
      try {
        if (options.autoCollect) {
          const hold = options.reduced ? 1200 : 1500, fade = options.reduced ? 180 : 950;
          animation2 = flight = targetElement.animate([{ opacity: 1 }, { opacity: 1, offset: hold / (hold + fade) }, { opacity: 0 }], { duration: hold + fade, easing: "ease-in-out", fill: "forwards" });
        } else {
          const box = $2("reward-dialog").getBoundingClientRect(), target = $2("wind-keepsake").getBoundingClientRect();
          const dx = target.left + target.width / 2 - box.left - box.width / 2, dy = target.top + target.height / 2 - box.top - box.height / 2;
          animation2 = flight = targetElement.animate([{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(0,-16px) scale(1.025) rotate(-2deg)", opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px) scale(.08) rotate(6deg)`, opacity: 0 }], { duration: 680, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
        }
      } catch {
        close();
        return;
      }
      const finish2 = () => {
        if (current === moment && flight === animation2)
          close();
      };
      animation2.finished.then(finish2, finish2);
    }
    bindings.listen($2("reward-continue"), "click", collect);
    function visibilityChanged() {
      if (!options.autoCollect || !current)
        return;
      if (dom2.document.hidden)
        flight?.pause?.();
      else if (flight)
        flight.play?.();
      else if ($2("reward-continue").hidden)
        collect();
    }
    if (options.autoCollect)
      dom2.document.addEventListener("visibilitychange", visibilityChanged);
    return {
      get current() {
        return current;
      },
      get open() {
        return current !== null;
      },
      show,
      close,
      collect,
      handleKey(event) {
        if (!current)
          return false;
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "Tab") {
          event.preventDefault();
          $2($2("reward-continue").hidden ? "reward-dialog" : "reward-continue").focus({ preventScroll: true });
        }
        return true;
      },
      destroy() {
        close(false);
        bindings.destroy();
        dom2.document.removeEventListener("visibilitychange", visibilityChanged);
      }
    };
  }

  // .build/typescript/runtime/music-layer.js
  var WUGONG_MUSIC = Object.freeze({
    id: "wugong-reverie",
    file: "audio/wugong-reverie-v1.mp3",
    title: "Reverie",
    author: "Scott Buckley",
    source: "https://www.scottbuckley.com.au/library/reverie/",
    license: "CC BY 4.0"
  });
  var theme = (slug, title) => Object.freeze({
    id: "wugong-" + slug,
    file: "audio/wugong-" + slug + "-loop-v1.mp3",
    title,
    author: "Scott Buckley",
    source: "https://www.scottbuckley.com.au/library/" + slug + "/",
    license: "CC BY 4.0"
  });
  var WUGONG_THEMES = Object.freeze({
    wind: theme("childhood", "Childhood"),
    clouds: theme("cirrus", "Cirrus"),
    greet: theme("a-kind-of-hope", "A Kind Of Hope"),
    puzzle: WUGONG_MUSIC
  });
  var MOGAN_MUSIC = WUGONG_THEMES.greet;
  var MOGAN_THEMES = Object.freeze({ rain: WUGONG_THEMES.clouds, footsteps: WUGONG_MUSIC, sling: WUGONG_THEMES.wind });
  var momentGames = Object.freeze({
    "meadow-bird": "wind",
    "meadow-butterfly": "clouds",
    "wugong-wind-hiker": "greet",
    "meadow-flower": "puzzle",
    "bamboo-drop": "rain",
    "bamboo-step": "footsteps",
    "bamboo-leaf": "sling"
  });
  function musicLevel(scene) {
    if (!["wugong", "mogan"].includes(scene.routeId || "") || !scene.mode || scene.mode === "silent")
      return 0;
    const game = scene.momentGame || momentGames[scene.momentId || ""];
    let level = scene.mode === "photo" ? 0.47 : scene.mode === "choice" ? 0.24 : scene.mode === "reward" ? 0.42 : 0.4;
    if (scene.mode === "moment")
      level = game === "greet" ? 0.25 : game === "puzzle" ? 0.35 : game === "clouds" ? 0.32 : 0.29;
    if (scene.routeId === "mogan") {
      level = scene.mode === "moment" ? game === "footsteps" ? 0.2 : game === "rain" ? 0.24 : 0.3 : scene.mode === "reward" ? 0.34 : scene.mode === "choice" ? 0.2 : 0.33;
    }
    if (scene.weather === "storm")
      level *= 0.65;
    else if (scene.weather === "rain")
      level *= 0.82;
    return level;
  }
  function musicTrack(scene) {
    if (!musicLevel(scene))
      return null;
    const game = scene.momentGame || momentGames[scene.momentId || ""];
    if (scene.routeId === "mogan") {
      if ((scene.mode === "moment" || scene.mode === "reward") && game && Object.hasOwn(MOGAN_THEMES, game))
        return MOGAN_THEMES[game];
      return MOGAN_MUSIC;
    }
    if ((scene.mode === "moment" || scene.mode === "reward") && game && Object.hasOwn(WUGONG_THEMES, game))
      return WUGONG_THEMES[game];
    return WUGONG_MUSIC;
  }
  function createTrackLayer({ context, destination, track, createMedia = () => typeof Audio === "function" ? new Audio() : null, timers = globalThis, onStateChange = () => {
  } }) {
    let media = null;
    let source = null;
    let volume = null;
    let state = "off";
    let desired = false, destroyed = false, failed = false, pending2 = false;
    let failureState = "error";
    let epoch = 0, target = 0;
    let stopTimer = null;
    let fade = null;
    let lastDuck = -Infinity;
    const listeners = [];
    function publish(next) {
      if (state === next || destroyed)
        return;
      state = next;
      onStateChange();
    }
    function cancelStop() {
      if (stopTimer !== null)
        timers.clearTimeout(stopTimer);
      stopTimer = null;
    }
    function hold() {
      if (!volume)
        return 0;
      const now = context.currentTime, param = volume.gain;
      const held = fade ? fade.from + (fade.to - fade.from) * Math.max(0, Math.min(1, (now - fade.at) / fade.duration)) : param.value;
      if (param.cancelAndHoldAtTime)
        param.cancelAndHoldAtTime(now);
      else {
        param.cancelScheduledValues(now);
        param.setValueAtTime(held, now);
      }
      return held;
    }
    function ramp(level, duration) {
      if (!volume)
        return;
      const from = hold(), now = context.currentTime;
      volume.gain.linearRampToValueAtTime(level, now + duration);
      fade = { from, to: level, at: now, duration };
    }
    function silence() {
      if (!volume)
        return;
      volume.gain.cancelScheduledValues(context.currentTime);
      volume.gain.setValueAtTime(0, context.currentTime);
      fade = null;
    }
    function listen(type, fn) {
      const listener = fn;
      media.addEventListener(type, listener);
      listeners.push([type, listener]);
    }
    function prepare() {
      if (media)
        return true;
      if (typeof context.createMediaElementSource !== "function") {
        failed = true;
        state = failureState = "unavailable";
        return false;
      }
      try {
        media = createMedia();
        if (!media) {
          failed = true;
          state = failureState = "unavailable";
          return false;
        }
        media.preload = "none";
        media.loop = true;
        media.setAttribute("playsinline", "");
        source = context.createMediaElementSource(media);
        volume = context.createGain();
        volume.gain.value = 0;
        source.connect(volume);
        volume.connect(destination);
        listen("playing", () => {
          if (!desired || destroyed || failed) {
            media?.pause();
            return;
          }
          failed = false;
          ramp(target, 2.4);
          publish("playing");
        });
        listen("waiting", () => {
          if (desired) {
            silence();
            publish("loading");
          }
        });
        listen("error", () => {
          if (!desired || destroyed)
            return;
          failed = true;
          pending2 = false;
          ++epoch;
          failureState = "error";
          silence();
          media?.pause();
          publish("error");
        });
        media.src = track.file;
        return true;
      } catch (_) {
        failed = true;
        source?.disconnect();
        volume?.disconnect();
        source = null;
        volume = null;
        media?.pause();
        if (media)
          for (const [type, fn] of listeners)
            media.removeEventListener(type, fn);
        listeners.length = 0;
        media = null;
        state = failureState = "unavailable";
        return false;
      }
    }
    function play() {
      if (pending2 || failed || !media || !desired || destroyed)
        return;
      if (!media.paused) {
        if (state === "paused") {
          state = "playing";
          ramp(target, 1.4);
        }
        return;
      }
      const token = ++epoch;
      pending2 = true;
      state = "loading";
      try {
        Promise.resolve(media.play()).then(() => {
          if (destroyed || !desired) {
            media?.pause();
            return;
          }
          if (token !== epoch)
            return;
          pending2 = false;
          ramp(target, 2.4);
          publish("playing");
        }).catch((error) => {
          if (token !== epoch || destroyed || !desired)
            return;
          pending2 = false;
          failed = true;
          silence();
          media?.pause();
          failureState = error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "error";
          publish(failureState);
        });
      } catch (_) {
        pending2 = false;
        failed = true;
        silence();
        state = failureState = "error";
      }
    }
    function pause(immediate = false, duration = 0.32) {
      if (destroyed)
        return;
      desired = false;
      pending2 = false;
      const token = ++epoch;
      cancelStop();
      if (!media)
        return;
      if (immediate || media.paused) {
        silence();
        media.pause();
      } else {
        ramp(0, duration);
        stopTimer = timers.setTimeout(() => {
          stopTimer = null;
          if (token === epoch && !desired)
            media?.pause();
        }, Math.round(duration * 1e3) + 20);
      }
      state = "paused";
    }
    function sync(scene) {
      if (destroyed)
        return;
      const next = musicLevel(scene);
      if (!next) {
        if (desired)
          pause();
        return;
      }
      cancelStop();
      const wasDesired = desired, changed = Math.abs(next - target) > 2e-3;
      target = next;
      desired = true;
      if (failed) {
        state = failureState;
        return;
      }
      if (!prepare())
        return;
      if (!wasDesired && !media.paused) {
        state = "playing";
        ramp(target, 1.4);
      } else if (changed && state === "playing")
        ramp(target, 1.2);
      play();
    }
    function resume(scene) {
      if (destroyed)
        return;
      failed = false;
      if (media?.error)
        media.load();
      sync(scene);
    }
    function duck(strength = 0.78, length = 0.65) {
      if (!volume || !desired || state !== "playing" || context.currentTime - lastDuck < 0.12)
        return;
      lastDuck = context.currentTime;
      const now = context.currentTime;
      hold();
      const lower = target * Math.max(0.5, Math.min(1, strength));
      volume.gain.linearRampToValueAtTime(lower, now + 0.04);
      volume.gain.linearRampToValueAtTime(target, now + length);
      fade = { from: lower, to: target, at: now + 0.04, duration: length - 0.04 };
    }
    function destroy2() {
      if (destroyed)
        return;
      pause(true);
      destroyed = true;
      cancelStop();
      if (media) {
        for (const [type, fn] of listeners)
          media.removeEventListener(type, fn);
        media.removeAttribute("src");
        media.load();
      }
      source?.disconnect();
      volume?.disconnect();
      media = null;
      source = null;
      volume = null;
    }
    return { sync, resume, pause, duck, destroy: destroy2, get state() {
      return state;
    }, get playing() {
      return desired && state === "playing";
    } };
  }
  function createMusicLayer(options) {
    const layers = /* @__PURE__ */ new Map();
    let requested = null;
    let previous = null;
    let desired = false, destroyed = false;
    function fadePrevious(duration) {
      const id2 = previous;
      previous = null;
      if (id2 && id2 !== requested?.id)
        layers.get(id2)?.pause(false, duration);
    }
    function getLayer(track) {
      let layer = layers.get(track.id);
      if (!layer) {
        layer = createTrackLayer({ ...options, track, onStateChange: () => {
          if (destroyed)
            return;
          if (desired && requested?.id === track.id) {
            const current = layers.get(track.id);
            if (current?.state === "playing")
              fadePrevious(0.95);
            else if (current && ["error", "blocked", "unavailable"].includes(current.state))
              fadePrevious(0.32);
          }
          options.onStateChange?.();
        } });
        layers.set(track.id, layer);
      }
      return layer;
    }
    function pause(immediate = false) {
      desired = false;
      previous = null;
      for (const layer of layers.values())
        layer.pause(immediate);
    }
    function select(scene, retry) {
      if (destroyed)
        return;
      const track = musicTrack(scene);
      if (!track) {
        if (desired)
          pause();
        return;
      }
      if (requested?.id !== track.id) {
        const outgoing = requested && layers.get(requested.id)?.playing ? requested.id : previous;
        for (const [id2, layer] of layers)
          if (id2 !== track.id && id2 !== outgoing)
            layer.pause(true);
        previous = outgoing !== track.id ? outgoing : null;
        requested = track;
      }
      desired = true;
      if (previous)
        layers.get(previous)?.sync(scene);
      const current = getLayer(track);
      retry ? current.resume(scene) : current.sync(scene);
      if (current.state === "playing")
        fadePrevious(0.95);
      else if (["error", "blocked", "unavailable"].includes(current.state))
        fadePrevious(0.32);
    }
    function destroy2() {
      if (destroyed)
        return;
      destroyed = true;
      desired = false;
      previous = null;
      for (const layer of layers.values())
        layer.destroy();
      layers.clear();
    }
    return {
      sync: (scene) => select(scene, false),
      resume: (scene) => select(scene, true),
      pause,
      duck: (strength, length) => {
        if (desired && requested)
          layers.get(requested.id)?.duck(strength, length);
      },
      destroy: destroy2,
      get track() {
        return requested;
      },
      get state() {
        return requested ? layers.get(requested.id)?.state || "off" : "off";
      },
      get playing() {
        return !!(desired && requested && layers.get(requested.id)?.playing);
      }
    };
  }

  // .build/typescript/wugong-walk/badge-art.js
  var ROUND_BADGE_IDS = /* @__PURE__ */ new Set(["wugong-forest-leaves", "wugong-camp-stars", "wugong-homeward-pages", "tiger-28-bends-v1", "tiger-middle-river-frame-v1"]);
  var SIZE = 640;
  var CENTER = SIZE / 2;
  var outline = (radius) => Array.from({ length: 145 }, (_, i) => {
    const a = i / 144 * Math.PI * 2, r = radius + Math.sin(a * 11) * 0.8 + Math.sin(a * 23) * 0.35;
    return `${i ? "L" : "M"}${CENTER + Math.cos(a) * r},${CENTER + Math.sin(a) * r}`;
  }).join(" ") + "Z";
  var outer = outline(302);
  var inner = outline(279);
  var gold = outline(295);
  var ink = outline(285);
  var sprigs = Array.from({ length: 18 }, (_, i) => {
    const a = 0.25 + i / 17 * 1.1, sign = i % 2 ? 1 : -1, x = CENTER + sign * Math.sin(a) * 292, y = CENTER + Math.cos(a) * 292;
    return `M${x},${y}q${sign * 7},-12 ${sign * 1},-18q${-sign * 9},9 ${-sign * 1},18Z`;
  });
  function circularBadge(image, options = {}) {
    if (!image.naturalWidth || !image.naturalHeight)
      return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    let x = 0, y = 0, width = image.naturalWidth, height = image.naturalHeight;
    if (options.legacyPaper) {
      x = width * 24 / 900;
      y = height * 24 / 660;
      width *= 852 / 900;
      height *= 530 / 660;
    }
    const side = Math.min(width, height), centerX = options.camp ? 0.36 : 0.5;
    x += Math.max(0, Math.min(width - side, width * centerX - side / 2));
    y += (height - side) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 280, 0, Math.PI * 2);
    ctx.clip();
    if (options.preserveFrame) {
      ctx.fillStyle = "#e9e7d7";
      ctx.fillRect(0, 0, SIZE, SIZE);
      const ratio = image.naturalWidth / image.naturalHeight, h = 555 / Math.sqrt(1 + ratio * ratio), w = h * ratio;
      ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, CENTER - w / 2, CENTER - h / 2, w, h);
    } else
      ctx.drawImage(image, x, y, side, side, 40, 40, 560, 560);
    ctx.restore();
    ctx.fillStyle = "#f3edd9";
    ctx.fill(new Path2D(`${outer} ${inner}`), "evenodd");
    ctx.strokeStyle = "#b69a61";
    ctx.lineWidth = 2.4;
    ctx.stroke(new Path2D(gold));
    ctx.strokeStyle = "#a6a67b";
    ctx.lineWidth = 1.1;
    ctx.stroke(new Path2D(ink));
    ctx.fillStyle = "#b4a777";
    ctx.globalAlpha = 0.8;
    for (const d of sprigs)
      ctx.fill(new Path2D(d));
    ctx.globalAlpha = 1;
    return canvas;
  }
  function roundJournalArt(image, moment) {
    const tiger = moment.route === "tiger";
    if (!ROUND_BADGE_IDS.has(moment.id) || !tiger && image.naturalWidth <= image.naturalHeight * 1.1)
      return null;
    const canvas = circularBadge(image, { preserveFrame: tiger, camp: moment.id === "wugong-camp-stars", legacyPaper: !tiger && !!moment.captureArt && moment.id !== "wugong-camp-stars" });
    return canvas?.toDataURL("image/webp", 0.88) ?? null;
  }

  // .build/typescript/wugong-walk/scroll/camp-journal.js
  function storeEarnedMoment(catalog2, journal2, storage2, moment) {
    if (moment.edition !== 3 || !moment.earned || !catalog2.hasTag(moment))
      return { kind: "error", message: "完成互动后才会记入手帐。" };
    const result = journal2.remember(catalog2.loadMoments(storage2), moment);
    if (result.status === "unchanged")
      return { kind: "stored", existing: true };
    if (result.status === "full")
      return { kind: "error", message: "手帐已满，原有回忆已保留。可以先留在这里看看画。" };
    if (!catalog2.saveMoments(storage2, result.moments))
      return { kind: "error", message: "暂时无法保存手帐，可以重试。" };
    return { kind: "stored", existing: false };
  }

  // .build/typescript/wugong-walk/model.js
  function curve(knots, subdivisions = 15) {
    if (knots.length < 2)
      return [...knots];
    const points = [];
    const sample = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    for (let i = 0; i < knots.length - 1; i++) {
      const a = knots[Math.max(0, i - 1)], b = knots[i], c = knots[i + 1], d = knots[Math.min(knots.length - 1, i + 2)];
      for (let j = 0; j < subdivisions; j++)
        points.push({ x: sample(a.x, b.x, c.x, d.x, j / subdivisions), y: sample(a.y, b.y, c.y, d.y, j / subdivisions) });
    }
    points.push(knots[knots.length - 1]);
    return points;
  }

  // .build/typescript/runtime/tiger-trail/geometry.js
  var WORLD = Object.freeze({ width: 1e3, height: 720 });
  var PAINTED_CLIMB = [
    [380, 1010],
    [298, 965],
    [225, 916],
    [176, 878],
    [165, 844],
    [191, 813],
    [270, 783],
    [364, 745],
    [452, 705],
    [535, 667],
    [615, 632],
    [662, 605],
    [659, 583],
    [608, 560],
    [537, 538],
    [463, 515],
    [385, 492],
    [309, 470],
    [268, 448],
    [267, 425],
    [308, 404],
    [368, 385],
    [425, 367],
    [478, 345],
    [521, 320],
    [549, 298],
    [563, 278],
    [589, 265],
    [626, 259],
    [653, 260]
  ];
  var CLIMB_PATH = curve(PAINTED_CLIMB.map(([x, y]) => ({ x: x * WORLD.width / 1478, y: y * WORLD.height / 1064 })), 7);
  var PASSAGE_PATH = [
    { x: 90, y: 447 },
    { x: 220, y: 432 },
    { x: 335, y: 420 },
    { x: 405, y: 410 },
    { x: 530, y: 396 },
    { x: 650, y: 385 },
    { x: 760, y: 374 }
  ];
  var DESCENT_PATH = [
    { x: 230, y: 118 },
    { x: 500, y: 172 },
    { x: 640, y: 240 },
    { x: 350, y: 308 },
    { x: 255, y: 370 },
    { x: 590, y: 430 },
    { x: 730, y: 500 },
    { x: 585, y: 573 },
    { x: 680, y: 631 }
  ];
  var clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function makeTrail(points) {
    const cumulative = [0];
    for (let i = 1; i < points.length; i++)
      cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
    return { points, cumulative, length: cumulative[cumulative.length - 1] || 0 };
  }
  var CLIMB_TRAIL = makeTrail(CLIMB_PATH);
  var PASSAGE_TRAIL = makeTrail(PASSAGE_PATH);
  var DESCENT_TRAIL = makeTrail(DESCENT_PATH);
  function pointAt(trail, at) {
    const d = clamp(Number.isFinite(at) ? at : 0, 0, trail.length);
    let index = 0;
    while (index < trail.points.length - 2 && trail.cumulative[index + 1] <= d)
      index++;
    const a = trail.points[index] || { x: 0, y: 0 }, b = trail.points[index + 1] || a;
    const length = distance(a, b), ratio = length > 0 ? (d - (trail.cumulative[index] || 0)) / length : 0;
    return {
      x: a.x + (b.x - a.x) * ratio,
      y: a.y + (b.y - a.y) * ratio,
      distance: d,
      segment: index,
      heading: Math.atan2(b.y - a.y, b.x - a.x)
    };
  }
  function turnAhead(trail, at, within2 = 48) {
    const a = pointAt(trail, at), b = pointAt(trail, Math.min(trail.length, at + within2));
    return Math.abs(Math.atan2(Math.sin(b.heading - a.heading), Math.cos(b.heading - a.heading)));
  }

  // .build/typescript/runtime/tiger-trail/rules.js
  var TRAIL_GAMES = {
    "tiger-28-bends-v1": "tiger-climb",
    "tiger-middle-river-frame-v1": "tiger-river",
    "tiger-halfway-view-v1": "tiger-rest",
    "tiger-longdong-passage-v1": "tiger-passage"
  };
  var TITLES = {
    "tiger-climb": "二十八道拐 · 山路慢行",
    "tiger-river": "中虎跳江边 · 留下这一江激流",
    "tiger-rest": "中途客栈 · 在山腰歇一会儿",
    "tiger-passage": "龙洞瀑布 · 沿崖经过"
  };
  var PROMPTS = {
    "tiger-climb": "按住画面往山上走，松手停下看风景。",
    "tiger-river": "拖动画面取景，按下快门；选一帧喜欢的，定格这幅画。",
    "tiger-rest": "拖动画面看看对岸山景，歇好了就继续走。",
    "tiger-passage": "水帘落在沿崖小径旁。停一会儿看看，也可以继续行程。"
  };
  var MAX_CAPTURES = 5;
  var ARROWS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
  var MOVEMENT_KEYS = { a: "ArrowLeft", d: "ArrowRight", w: "ArrowUp", s: "ArrowDown" };
  var keyName = (key) => MOVEMENT_KEYS[key.toLowerCase()] || key;
  var hasPoint = (p) => Number.isFinite(p.x) && Number.isFinite(p.y);
  var scenePoint = (p) => ({ x: clamp(p.x, 0, WORLD.width), y: clamp(p.y, 0, WORLD.height) });
  function walkStart(trail) {
    const start = pointAt(trail, 0);
    return {
      distance: 0,
      progress: 0,
      position: { x: start.x, y: start.y },
      heading: start.heading,
      speed: 0,
      held: false,
      arrivedAt: null,
      nextStep: 0
    };
  }
  function createTrailState(entry, options) {
    const game = TRAIL_GAMES[entry.id] || "tiger-rest";
    const zoom = game === "tiger-river" ? 1.25 : game === "tiger-rest" ? 1.12 : game === "tiger-climb" ? 1.52 : 1;
    const start = pointAt(CLIMB_TRAIL, 0);
    return {
      id: entry.id,
      route: "tiger",
      kind: game,
      game,
      age: 0,
      acted: false,
      dragging: false,
      gesture: "tap",
      done: false,
      x: 0.5,
      y: 0.5,
      play: {
        type: game,
        progress: 0,
        complete: false,
        completedAt: null,
        reduced: options.reduced
      },
      events: [],
      serial: 0,
      feedback: PROMPTS[game],
      camera: { x: game === "tiger-climb" ? start.x + 105 : 500, y: game === "tiger-climb" ? start.y - 88 : 360, zoom },
      viewport: { width: WORLD.width / zoom, height: WORLD.height / zoom },
      climb: walkStart(CLIMB_TRAIL),
      passage: walkStart(PASSAGE_TRAIL),
      rest: { panX: 0 },
      river: {
        phase: options.riverArrival === "river" ? "river" : "descent",
        descentProgress: options.riverArrival === "river" || options.reduced ? 1 : 0,
        waveClock: 0,
        captures: [],
        selected: -1,
        selectionLocked: false,
        captureRequest: null,
        captureSerial: 0,
        burst: false,
        burstRemaining: 0,
        nextCaptureAt: 0
      },
      pointer: null,
      keys: []
    };
  }
  function copy(state) {
    return {
      ...state,
      play: { ...state.play },
      camera: { ...state.camera },
      viewport: { ...state.viewport },
      climb: { ...state.climb, position: { ...state.climb.position } },
      passage: { ...state.passage, position: { ...state.passage.position } },
      rest: { ...state.rest },
      river: {
        ...state.river,
        captures: state.river.captures.slice(),
        captureRequest: state.river.captureRequest ? { ...state.river.captureRequest, camera: { ...state.river.captureRequest.camera } } : null
      },
      pointer: state.pointer ? { ...state.pointer } : null,
      keys: state.keys.slice(),
      events: state.events.slice(-31)
    };
  }
  function emit(state, type, x = 0.5, index) {
    state.events.push({ serial: ++state.serial, type, x: clamp(x, 0, 1), ...index === void 0 ? {} : { index } });
    if (state.events.length > 32)
      state.events.shift();
  }
  function stopWalking(state) {
    for (const walk of [state.climb, state.passage]) {
      walk.held = false;
      walk.speed = 0;
    }
    state.pointer = null;
    state.keys = [];
    state.dragging = false;
  }
  function finish(state) {
    stopWalking(state);
    state.play.complete = true;
    state.play.progress = 1;
    state.play.completedAt = state.age;
    state.river.burst = false;
    state.river.burstRemaining = 0;
    state.river.captureRequest = null;
    emit(state, "complete");
  }
  function requestCapture(state) {
    const river = state.river;
    if (river.phase !== "river" || river.captureRequest || river.captures.length >= MAX_CAPTURES)
      return false;
    river.captureRequest = { id: ++river.captureSerial, age: state.age, waveClock: river.waveClock, camera: { ...state.camera } };
    state.acted = true;
    emit(state, "shutter", 0.5, river.captureRequest.id);
    return true;
  }
  function attachTrailCapture(state, url, requestId) {
    const request = state.river.captureRequest;
    if (state.done || state.play.complete || state.game !== "tiger-river" || state.river.phase !== "river" || !request || requestId !== void 0 && request.id !== requestId)
      return state;
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || url.length > 3e5) {
      return rejectTrailCapture(state, request.id);
    }
    const next = copy(state);
    next.river.captures.push({ ...request, camera: { ...request.camera }, url });
    if (!next.river.selectionLocked)
      next.river.selected = next.river.captures.length - 1;
    next.river.captureRequest = null;
    next.play.progress = 0.5;
    next.feedback = next.river.captures.length === MAX_CAPTURES ? "五帧都在这里了。选一张喜欢的，收进手帐。" : "这一帧留下了。可以换个构图再拍，也可以选好收进手帐。";
    if (next.river.captures.length >= MAX_CAPTURES) {
      next.river.burst = false;
      next.river.burstRemaining = 0;
    }
    emit(next, "frame-ready", 0.5, next.river.selected);
    return next;
  }
  function rejectTrailCapture(state, requestId) {
    if (!state.river.captureRequest || requestId !== void 0 && state.river.captureRequest.id !== requestId)
      return state;
    const next = copy(state);
    next.river.captureRequest = null;
    next.river.burst = false;
    next.river.burstRemaining = 0;
    next.feedback = "这一帧没能保存，可以再拍一次；已经拍好的画面还在。";
    return next;
  }
  function beginWalk(state, point2) {
    const walk = state.climb;
    if (walk.arrivedAt !== null)
      return;
    walk.held = true;
    state.pointer = point2;
    state.feedback = PROMPTS[state.game];
    state.acted = true;
    state.dragging = true;
    state.gesture = "hold";
  }
  function rememberViewport(state, input) {
    if (Number.isFinite(input.viewWidth) && input.viewWidth > 0)
      state.viewport.width = Math.min(WORLD.width, input.viewWidth);
    if (Number.isFinite(input.viewHeight) && input.viewHeight > 0)
      state.viewport.height = Math.min(WORLD.height, input.viewHeight);
  }
  function viewCamera(state, camera) {
    const halfW = Math.min(WORLD.width, state.viewport.width) / 2;
    const halfH = Math.min(WORLD.height, state.viewport.height) / 2;
    return {
      zoom: clamp(camera.zoom, 1, 1.8),
      x: clamp(camera.x, halfW, WORLD.width - halfW),
      y: clamp(camera.y, halfH, WORLD.height - halfH)
    };
  }
  function pan(state, point2) {
    if (!state.pointer)
      return;
    const dx = point2.x - state.pointer.x, dy = point2.y - state.pointer.y;
    const before = state.camera;
    state.camera = viewCamera(state, { ...before, x: before.x - dx, y: before.y - dy });
    state.pointer = { x: point2.x + state.camera.x - before.x, y: point2.y + state.camera.y - before.y };
    state.rest.panX = (state.camera.x - 500) / 500;
    state.dragging = true;
    state.acted = true;
    state.gesture = "drag";
  }
  function moveTrail(state, input) {
    if (state.done || state.play.complete || state.game === "tiger-climb" || !hasPoint(input))
      return state;
    const next = copy(state), point2 = scenePoint(input);
    rememberViewport(next, input);
    if (next.pointer && (next.game === "tiger-rest" || next.river.phase === "river"))
      pan(next, point2);
    else
      return state;
    return next;
  }
  function inputTrail(state, input) {
    if (input.action === "viewport") {
      const next2 = copy(state);
      rememberViewport(next2, input);
      if (next2.game === "tiger-rest" || next2.game === "tiger-river")
        next2.camera = viewCamera(next2, next2.camera);
      return next2;
    }
    if (state.done || state.play.complete)
      return state;
    if (input.phase === "release" && !input.action)
      return releaseTrail(state);
    const next = copy(state), action = input.action || "";
    rememberViewport(next, input);
    if (input.phase === "press" && !action) {
      if (!hasPoint(input))
        return state;
      const point2 = scenePoint(input);
      if (next.game === "tiger-climb")
        beginWalk(next, point2);
      else if (next.game === "tiger-rest" || next.river.phase === "river") {
        next.pointer = point2;
        next.dragging = true;
        next.acted = true;
        next.gesture = "drag";
      }
      return next;
    }
    if (input.phase === "press")
      return state;
    if (next.game === "tiger-rest" || next.game === "tiger-passage") {
      if (action === "continue") {
        stopWalking(next);
        next.done = true;
        next.acted = true;
        next.play.complete = false;
        next.play.completedAt = null;
        next.feedback = "继续沿高路行进。";
        return next;
      }
    }
    if (next.game === "tiger-climb")
      return state;
    if (next.game === "tiger-river") {
      if (action === "continue-to-river" && next.river.phase === "descent") {
        next.river.phase = "river";
        next.river.descentProgress = 1;
        next.acted = true;
        next.feedback = PROMPTS[next.game];
        emit(next, "river-arrive");
        return next;
      }
      if (next.river.phase !== "river")
        return state;
      if (action === "shutter") {
        if (!requestCapture(next))
          next.feedback = next.river.captures.length >= MAX_CAPTURES ? "已有五帧，先选一张收好，或重新取景。" : "正在留下这一帧。";
        return next;
      }
      if (action === "burst") {
        if (next.river.burst) {
          next.river.burst = false;
          next.river.burstRemaining = 0;
          next.feedback = "连拍停下了，选一帧喜欢的。";
          return next;
        }
        const remaining = MAX_CAPTURES - next.river.captures.length - (next.river.captureRequest ? 1 : 0);
        if (remaining <= 0) {
          next.feedback = "已有五帧，选一张喜欢的，或重新取景。";
          return next;
        }
        next.river.burst = true;
        next.river.burstRemaining = remaining;
        if (requestCapture(next))
          next.river.burstRemaining--;
        next.river.nextCaptureAt = next.age + 0.65;
        next.feedback = "连拍中，最多留下五帧；也可以再按一次停下。";
        return next;
      }
      if (action === "stop-burst") {
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.feedback = "连拍停下了，选一帧喜欢的。";
        return next;
      }
      if (action === "select-frame" && Number.isInteger(input.value) && input.value >= 0 && input.value < next.river.captures.length) {
        next.river.selected = input.value;
        next.river.selectionLocked = true;
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.feedback = "选中了这一帧。喜欢的话，就收进手帐。";
        next.acted = true;
        return next;
      }
      if (action === "keep" || action === "collect") {
        if (next.river.captureRequest || next.river.burst) {
          next.feedback = "先停下连拍，选一帧喜欢的画面。";
          return next;
        }
        const selected = next.river.captures[next.river.selected];
        if (!selected?.url) {
          next.feedback = "先按快门留下画面，再选一帧收进手帐。";
          return next;
        }
        next.acted = true;
        next.feedback = "这一江激流和自己的构图，留在了手帐里。";
        finish(next);
        return next;
      }
      if (action === "retake" || action === "clear-frames") {
        next.river.captures = [];
        next.river.selected = -1;
        next.river.selectionLocked = false;
        next.river.captureRequest = null;
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.play.progress = 0;
        next.feedback = "重新取景。之前已经收好的手帐不会改变。";
        return next;
      }
    }
    if (action === "zoom" && Number.isFinite(input.value) && (next.game === "tiger-river" || next.game === "tiger-rest")) {
      const zoom = clamp(input.value, 1, 1.8), ratio = next.camera.zoom / zoom;
      next.viewport.width = Math.min(WORLD.width, next.viewport.width * ratio);
      next.viewport.height = Math.min(WORLD.height, next.viewport.height * ratio);
      next.camera = viewCamera(next, { ...next.camera, zoom });
      next.acted = true;
      next.rest.panX = (next.camera.x - 500) / 500;
      return next;
    }
    return state;
  }
  function releaseTrail(state) {
    if (!state.pointer && !state.keys.length && !state.climb.held && !state.passage.held && !state.river.burst)
      return state;
    const next = copy(state);
    stopWalking(next);
    next.river.burst = false;
    next.river.burstRemaining = 0;
    return next;
  }
  function advanceClimb(state, dt) {
    const walk = state.climb, trail = CLIMB_TRAIL;
    if (walk.arrivedAt !== null)
      return;
    if (!walk.held && !state.keys.length) {
      walk.speed = 0;
      return;
    }
    const direction = pointAt(trail, walk.distance + 12).heading;
    const uphill = Math.max(0, -Math.sin(direction)), bend = Math.min(1, turnAhead(trail, walk.distance, 28) / 1.4);
    const pace = 78 * (1 - uphill * 0.27) * (1 - bend * 0.37);
    walk.speed += (pace - walk.speed) * (1 - Math.exp(-dt * 7));
    const travelled = Math.min(walk.speed * dt, trail.length - walk.distance);
    walk.distance += travelled;
    const position = pointAt(trail, walk.distance);
    const behind = pointAt(trail, walk.distance - 6), ahead = pointAt(trail, walk.distance + 10);
    const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    walk.heading += Math.atan2(Math.sin(heading - walk.heading), Math.cos(heading - walk.heading)) * (1 - Math.exp(-dt * 10));
    walk.position = { x: position.x, y: position.y };
    walk.progress = walk.distance / trail.length;
    state.play.progress = walk.progress * 0.94;
    state.x = position.x / WORLD.width;
    state.y = position.y / WORLD.height;
    if (travelled > 0) {
      walk.nextStep -= travelled;
      if (walk.nextStep <= 0) {
        walk.nextStep += 20;
        emit(state, "trail-step", state.x, Math.floor(walk.distance / 20));
      }
    }
    if (trail.length - walk.distance <= 0.2) {
      const end = pointAt(trail, trail.length);
      walk.distance = trail.length;
      walk.progress = 1;
      walk.position = { x: end.x, y: end.y };
      walk.arrivedAt = state.age;
      stopWalking(state);
      state.feedback = "转上山肩了。停下脚步，看看谷底的金沙江。";
      emit(state, "trail-arrive", end.x / WORLD.width);
    }
  }
  function tickTrail(state, dt) {
    if (state.done || !Number.isFinite(dt) || dt <= 0)
      return state;
    const next = copy(state), elapsed = Math.min(0.12, dt);
    next.age += elapsed;
    if (next.play.complete) {
      next.done = next.age - (next.play.completedAt ?? next.age) >= (next.play.reduced ? 0.25 : 0.85);
      return next;
    }
    if (next.game === "tiger-climb") {
      const walk = next.climb;
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 60)));
      for (let i = 0; i < steps; i++)
        advanceClimb(next, elapsed / steps);
      const follow = next.play.reduced ? 1 : 1 - Math.exp(-elapsed * 3.8);
      const target = walk.arrivedAt !== null ? { x: 590, y: 355, zoom: 1.02 } : {
        x: clamp(walk.position.x + 105, 0, WORLD.width),
        y: clamp(walk.position.y - 88, 0, WORLD.height),
        zoom: 1.52 - walk.progress * 0.15
      };
      next.camera.x += (target.x - next.camera.x) * follow;
      next.camera.y += (target.y - next.camera.y) * follow;
      next.camera.zoom += (target.zoom - next.camera.zoom) * follow;
      if (walk.arrivedAt !== null && next.age - walk.arrivedAt >= (next.play.reduced ? 0.65 : 2.1))
        finish(next);
    }
    if (next.game === "tiger-passage") {
      const walk = next.passage;
      walk.progress = next.play.reduced ? 1 : Math.min(1, walk.progress + elapsed / 7);
      walk.distance = walk.progress * PASSAGE_TRAIL.length;
      const position = pointAt(PASSAGE_TRAIL, walk.distance);
      walk.position = { x: position.x, y: position.y };
      walk.heading = position.heading;
      if (walk.progress >= 1 && walk.arrivedAt === null)
        walk.arrivedAt = next.age;
      walk.speed = walk.arrivedAt !== null ? 0 : PASSAGE_TRAIL.length / 7;
      next.play.progress = 0;
      next.play.complete = false;
    }
    if (next.game === "tiger-river") {
      if (next.river.phase === "descent")
        next.river.descentProgress = Math.min(1, next.river.descentProgress + elapsed / 3.4);
      else {
        next.river.waveClock += elapsed;
        if (next.river.burst && next.river.burstRemaining > 0 && !next.river.captureRequest && next.age >= next.river.nextCaptureAt) {
          if (requestCapture(next))
            next.river.burstRemaining--;
          next.river.nextCaptureAt = next.age + 0.65;
        }
        if (next.river.burstRemaining <= 0 && !next.river.captureRequest)
          next.river.burst = false;
      }
    }
    if ((next.game === "tiger-rest" || next.game === "tiger-river" && next.river.phase === "river") && next.keys.length) {
      const dx = Number(next.keys.includes("ArrowRight")) - Number(next.keys.includes("ArrowLeft"));
      const dy = Number(next.keys.includes("ArrowDown")) - Number(next.keys.includes("ArrowUp"));
      next.camera = viewCamera(next, {
        ...next.camera,
        x: next.camera.x + dx * elapsed * 180 / next.camera.zoom,
        y: next.camera.y + dy * elapsed * 180 / next.camera.zoom
      });
      next.rest.panX = (next.camera.x - 500) / 500;
    }
    return next;
  }
  function keyTrail(state, key, phase = "down") {
    const normalized = keyName(key);
    if (ARROWS.includes(normalized) || state.game === "tiger-climb" && (normalized === " " || normalized === "Enter")) {
      const next = copy(state);
      next.keys = phase === "up" ? next.keys.filter((item) => item !== normalized) : [.../* @__PURE__ */ new Set([...next.keys, normalized])];
      if (phase === "down" && !next.done && !next.play.complete) {
        next.acted = true;
        next.gesture = "keyboard";
      }
      if (!next.keys.length && !next.climb.held) {
        next.climb.speed = 0;
        next.passage.speed = 0;
      }
      return next;
    }
    if (phase === "up")
      return ["Enter", " ", "+", "=", "-", "_", "b", "B", "k", "K"].includes(key) ? state : null;
    if (state.done || state.play.complete)
      return null;
    if (key === "Enter" || key === " ") {
      if (state.game === "tiger-rest" || state.game === "tiger-passage")
        return inputTrail(state, { action: "continue" });
      return inputTrail(state, { action: state.river.phase === "descent" ? "continue-to-river" : "shutter" });
    }
    if ((key === "+" || key === "=") && (state.game === "tiger-river" || state.game === "tiger-rest"))
      return inputTrail(state, { action: "zoom", value: state.camera.zoom + 0.15 });
    if ((key === "-" || key === "_") && (state.game === "tiger-river" || state.game === "tiger-rest"))
      return inputTrail(state, { action: "zoom", value: state.camera.zoom - 0.15 });
    if ((key === "b" || key === "B") && state.game === "tiger-river")
      return inputTrail(state, { action: "burst" });
    if ((key === "k" || key === "K") && state.game === "tiger-river")
      return inputTrail(state, { action: "keep" });
    if (/^[1-5]$/.test(key) && state.game === "tiger-river")
      return inputTrail(state, { action: "select-frame", value: Number(key) - 1 });
    return null;
  }

  // .build/typescript/runtime/map-walk-art.js
  var MAP_WALK_FILE = "characters/trailbound-walk-v2.webp";
  var MAP_WALK_SCALE = 54 / 429;
  var MAP_WALK_FRAMES = [
    [112, 9, 275, 435, 153, 434],
    [542, 11, 258, 433, 148, 432],
    [978, 11, 255, 436, 142, 436],
    [1399, 11, 264, 435, 151, 434],
    [124, 448, 286, 425, 161, 424],
    [546, 451, 260, 422, 159, 421],
    [984, 447, 243, 428, 136, 427],
    [1395, 449, 278, 426, 155, 425]
  ];

  // .build/typescript/runtime/tiger-trail/scene.js
  var FILES = {
    high: "scenes/tiger-climb-walk-v3.webp",
    river: "scenes/tiger-river-v2.webp",
    rest: "scenes/tiger-halfway-v2.webp",
    passage: "scenes/tiger-longdong-v2.webp",
    hiker: MAP_WALK_FILE
  };
  var TIGER_TRAIL_ROUTE_ASSETS = Object.values(FILES);
  function tigerTrailAssets(game) {
    const scene = game === "tiger-climb" ? FILES.high : game === "tiger-river" ? FILES.river : game === "tiger-rest" ? FILES.rest : FILES.passage;
    return { scene, ...game === "tiger-climb" || game === "tiger-passage" ? { actor: FILES.hiker } : {} };
  }
  var clamp2 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  var smooth = (n) => {
    const q = clamp2(n, 0, 1);
    return q * q * (3 - 2 * q);
  };
  var attrs = (node, values) => {
    for (const [key, value] of Object.entries(values))
      if (node.getAttribute(key) !== String(value))
        node.setAttribute(key, String(value));
  };
  function imageRect(entry) {
    const ratio = (entry.image.naturalWidth || 1280) / (entry.image.naturalHeight || 720);
    const width = Math.max(WORLD.width, WORLD.height * ratio), height = width / ratio;
    return { x: (WORLD.width - width) / 2, y: (WORLD.height - height) / 2, width, height };
  }
  function project(camera, height) {
    const scale = Math.max(1, height / WORLD.height) * clamp2(camera.zoom, 1, 1.8);
    const vw = WORLD.width / scale, vh = height / scale;
    const cx = vw < WORLD.width ? clamp2(camera.x, vw / 2, WORLD.width - vw / 2) : WORLD.width / 2;
    const cy = vh < WORLD.height ? clamp2(camera.y, vh / 2, WORLD.height - vh / 2) : WORLD.height / 2;
    return { scale, x: WORLD.width / 2 - cx * scale, y: height / 2 - cy * scale, width: WORLD.width, height };
  }
  function walkingFrame(stride) {
    return Math.floor(Math.max(0, stride) / 4) % 8;
  }
  function stageFrame(state, height, capture = false) {
    const climb = state.game === "tiger-climb", river = state.game === "tiger-river", passage = state.game === "tiger-passage";
    const camera = { ...state.camera }, progress = climb ? state.climb.progress : passage ? state.passage.progress : river ? state.river.descentProgress : 0;
    const request = capture ? state.river.captureRequest : null;
    if (request)
      Object.assign(camera, request.camera);
    else if (passage) {
      camera.x = state.passage.position.x + 90;
      camera.y = state.passage.position.y - 50;
      camera.zoom = 1.12 - progress * 0.05;
    } else if (river && state.river.phase === "descent") {
      const q = smooth(progress);
      camera.y -= (1 - q) * 110;
      camera.zoom += (1 - q) * 0.18;
    }
    let actor = null;
    if (climb) {
      const facing = Math.cos(state.climb.heading) < 0 ? -1 : 1;
      actor = { at: state.climb.position, width: 38 - smooth(progress) * 10, frame: walkingFrame(state.climb.distance), rotation: clamp2(Math.sin(state.climb.heading) * facing * 0.1, -0.08, 0.06), alpha: 1, mirror: facing };
    } else if (passage)
      actor = { at: state.passage.position, width: 40 - progress * 10, frame: walkingFrame(state.passage.distance), rotation: -0.025, alpha: 1, mirror: Math.cos(state.passage.heading) < 0 ? -1 : 1 };
    return {
      camera,
      projection: project(camera, height),
      age: request?.age ?? state.age,
      wave: request?.waveClock ?? (river ? state.river.waveClock : state.age),
      reduced: !!state.play.reduced,
      actor,
      river,
      passage,
      rest: state.game === "tiger-rest",
      capture
    };
  }
  var HIGH_FLOW = [
    { x: 0.674, y: 0.654 },
    { x: 0.675, y: 0.682 },
    { x: 0.68, y: 0.71 },
    { x: 0.705, y: 0.744 },
    { x: 0.721, y: 0.772 },
    { x: 0.745, y: 0.811 },
    { x: 0.777, y: 0.841 },
    { x: 0.828, y: 0.876 },
    { x: 0.878, y: 0.911 },
    { x: 0.919, y: 0.946 },
    { x: 0.957, y: 0.983 },
    { x: 0.98, y: 1 }
  ];
  var HIGH_WATER = [
    ...HIGH_FLOW.map((p) => ({ x: p.x - (15e-4 + (p.y - 0.65) * 0.024), y: p.y })),
    ...HIGH_FLOW.slice().reverse().map((p) => ({ x: p.x + (15e-4 + (p.y - 0.65) * 0.024), y: p.y }))
  ];
  var RIVER_WATER = [
    { x: 0, y: 0.54 },
    { x: 0.15, y: 0.532 },
    { x: 0.29, y: 0.526 },
    { x: 0.36, y: 0.516 },
    { x: 0.46, y: 0.512 },
    { x: 0.56, y: 0.513 },
    { x: 0.65, y: 0.521 },
    { x: 0.72, y: 0.523 },
    { x: 0.82, y: 0.541 },
    { x: 0.87, y: 0.565 },
    { x: 1, y: 0.584 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ];
  var RIVER_ROCKS = [
    [{ x: 0.497, y: 0.647 }, { x: 0.52, y: 0.6 }, { x: 0.54, y: 0.584 }, { x: 0.548, y: 0.548 }, { x: 0.568, y: 0.516 }, { x: 0.589, y: 0.521 }, { x: 0.61, y: 0.545 }, { x: 0.638, y: 0.565 }, { x: 0.675, y: 0.588 }, { x: 0.707, y: 0.618 }, { x: 0.724, y: 0.664 }, { x: 0.713, y: 0.701 }, { x: 0.657, y: 0.716 }, { x: 0.6, y: 0.699 }, { x: 0.551, y: 0.673 }],
    [{ x: 0, y: 0.55 }, { x: 0.041, y: 0.537 }, { x: 0.083, y: 0.536 }, { x: 0.12, y: 0.566 }, { x: 0.156, y: 0.612 }, { x: 0.156, y: 0.637 }, { x: 0.097, y: 0.644 }, { x: 0, y: 0.641 }],
    [{ x: 0.736, y: 0.731 }, { x: 0.745, y: 0.699 }, { x: 0.781, y: 0.705 }, { x: 0.805, y: 0.709 }, { x: 0.85, y: 0.681 }, { x: 0.875, y: 0.711 }, { x: 0.862, y: 0.727 }, { x: 0.85, y: 0.754 }, { x: 0.809, y: 0.777 }, { x: 0.759, y: 0.766 }],
    [{ x: 0.874, y: 0.79 }, { x: 0.887, y: 0.755 }, { x: 0.91, y: 0.735 }, { x: 0.933, y: 0.746 }, { x: 0.965, y: 0.762 }, { x: 1, y: 0.77 }, { x: 1, y: 0.886 }, { x: 0.958, y: 0.864 }, { x: 0.9, y: 0.837 }],
    [{ x: 0, y: 0.874 }, { x: 0.042, y: 0.868 }, { x: 0.094, y: 0.875 }, { x: 0.139, y: 0.874 }, { x: 0.195, y: 0.858 }, { x: 0.234, y: 0.858 }, { x: 0.272, y: 0.867 }, { x: 0.326, y: 0.858 }, { x: 0.365, y: 0.879 }, { x: 0.397, y: 0.936 }, { x: 0.424, y: 1 }, { x: 0, y: 1 }],
    [{ x: 0.509, y: 0.516 }, { x: 0.523, y: 0.502 }, { x: 0.539, y: 0.507 }, { x: 0.553, y: 0.52 }],
    [{ x: 0.637, y: 0.53 }, { x: 0.644, y: 0.509 }, { x: 0.654, y: 0.51 }, { x: 0.665, y: 0.531 }],
    [{ x: 0.71, y: 0.539 }, { x: 0.724, y: 0.514 }, { x: 0.74, y: 0.513 }, { x: 0.755, y: 0.536 }]
  ];
  var FALL_FLOW = [
    { x: 0.234, y: 0.025 },
    { x: 0.26, y: 0.12 },
    { x: 0.29, y: 0.24 },
    { x: 0.308, y: 0.34 },
    { x: 0.33, y: 0.43 },
    { x: 0.357, y: 0.51 },
    { x: 0.376, y: 0.563 },
    { x: 0.401, y: 0.613 },
    { x: 0.421, y: 0.704 },
    { x: 0.447, y: 0.794 },
    { x: 0.479, y: 0.885 },
    { x: 0.505, y: 0.956 },
    { x: 0.521, y: 1 }
  ];
  var FALL_WATER = [
    ...FALL_FLOW.map((p) => ({ x: p.x - (p.y < 0.5 ? 4e-3 : 8e-3), y: p.y })),
    ...FALL_FLOW.slice().reverse().map((p) => ({ x: p.x + (p.y < 0.5 ? 5e-3 : 0.01), y: p.y }))
  ];
  var FALL_LEDGE = [{ x: 0.32, y: 0.565 }, { x: 0.46, y: 0.565 }, { x: 0.46, y: 0.605 }, { x: 0.32, y: 0.605 }];
  function waterPolygon(frame2, rect) {
    return (frame2.river ? RIVER_WATER : frame2.passage ? FALL_WATER : HIGH_WATER).map((p) => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height }));
  }
  function waterHoles(frame2, rect) {
    return (frame2.river ? RIVER_ROCKS : frame2.passage ? [FALL_LEDGE] : []).map((rock) => rock.map((p) => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height })));
  }
  function within(p, polygon2) {
    let yes = false;
    for (let i = 0, j = polygon2.length - 1; i < polygon2.length; j = i++) {
      const a = polygon2[i], b = polygon2[j];
      if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
        yes = !yes;
    }
    return yes;
  }
  function waves(frame2, rect) {
    const polygon2 = waterPolygon(frame2, rect), holes = waterHoles(frame2, rect), count = frame2.river ? 38 : frame2.rest ? 0 : frame2.passage ? 14 : 16;
    const time = frame2.reduced ? 1.7 : frame2.wave;
    const result = [];
    for (let i = 0; i < count; i++) {
      const q = ((time * (frame2.river ? 0.095 : frame2.passage ? 0.18 : 0.035) + i * 0.137) % 1 + 1) % 1;
      const flow = frame2.passage ? FALL_FLOW : HIGH_FLOW;
      const section = Math.min(flow.length - 2, Math.floor(q * (flow.length - 1))), t = q * (flow.length - 1) - section;
      const a = flow[section], b = flow[section + 1];
      const x = frame2.river ? rect.x + (0.43 + q * 0.4 + Math.sin(i * 5.71) * (0.02 + q * 0.14)) * rect.width : rect.x + (a.x + (b.x - a.x) * t) * rect.width;
      const y = frame2.river ? rect.y + (0.51 + q * 0.5) * rect.height : rect.y + (a.y + (b.y - a.y) * t) * rect.height;
      if (!within({ x, y }, polygon2) || holes.some((hole) => within({ x, y }, hole)))
        continue;
      result.push({ x, y, length: (frame2.river ? 12 : frame2.passage ? 9 : 5) + q * (frame2.river ? 30 : 8), alpha: Math.sin(q * Math.PI) * (frame2.river ? 0.45 : frame2.passage ? 0.25 : 0.35), bend: 3 + Math.sin(time * 1.2 + i) * 2 });
    }
    return result;
  }
  function actorCrop(entry, frame2) {
    const [x, y, width, height] = MAP_WALK_FRAMES[frame2];
    return { x, y, width, height };
  }
  var HIKER_ANCHORS = MAP_WALK_FRAMES.map(([, , width, height, footX, footY]) => ({ x: footX / width, y: footY / height }));
  var svgSequence = 0;
  function fallback(svg, parent, game) {
    const root = svg("g", { class: "tiger-trail-fallback" }, parent), defs = svg("defs", {}, root);
    const clipId = "tiger-trail-water-" + ++svgSequence;
    const waterClip = svg("mask", { id: clipId, maskUnits: "userSpaceOnUse", maskContentUnits: "userSpaceOnUse", x: 0, y: 0, width: WORLD.width, height: WORLD.height }, defs);
    const waterShape = svg("polygon", { fill: "white" }, waterClip);
    const rockShapes = RIVER_ROCKS.map(() => svg("polygon", { fill: "black" }, waterClip));
    const paper2 = svg("rect", { x: 0, y: 0, width: WORLD.width, height: 720, fill: "#f3edda" }, root);
    const world = svg("g", {}, root), background = svg("image", { href: tigerTrailAssets(game).scene }, world);
    const river = svg("g", { mask: "url(#" + clipId + ")" }, world);
    const waveNodes = Array.from({ length: 38 }, () => svg("path", { fill: "none", stroke: "#fff6d9", "stroke-linecap": "round", "stroke-width": 2.1 }, river));
    const shadow = svg("ellipse", { fill: "#243b32", opacity: 0.2 }, world), hiker = svg("g", {}, world);
    const crop = svg("svg", { overflow: "hidden", preserveAspectRatio: "none" }, hiker), actor = svg("image", { href: FILES.hiker }, crop);
    const loading = svg("text", { x: 500, y: 360, "data-loading": "true", "text-anchor": "middle", fill: "#476152", "font-family": "Georgia, Songti SC, serif", "font-size": 19 }, root);
    loading.textContent = "江谷画作正在展开…";
    return {
      root,
      paint(frame2, resources) {
        const p = frame2.projection;
        attrs(parent, { viewBox: "0 0 " + p.width + " " + p.height, preserveAspectRatio: "none" });
        attrs(paper2, { height: p.height });
        attrs(loading, { y: p.height / 2, display: resources.has("scene") ? "none" : "" });
        attrs(world, { transform: "translate(" + p.x + " " + p.y + ") scale(" + p.scale + ")" });
        const scene = resources.get("scene");
        if (!scene)
          return;
        const rect = imageRect(scene);
        attrs(background, { ...rect, preserveAspectRatio: "none" });
        attrs(waterShape, { points: waterPolygon(frame2, rect).map((v) => v.x + "," + v.y).join(" ") });
        const holes = waterHoles(frame2, rect);
        for (let i = 0; i < rockShapes.length; i++)
          attrs(rockShapes[i], holes[i] ? { points: holes[i].map((v) => v.x + "," + v.y).join(" "), display: "" } : { display: "none" });
        const lines = waves(frame2, rect);
        for (let i = 0; i < waveNodes.length; i++) {
          const line = lines[i];
          attrs(waveNodes[i], line ? {
            display: "",
            opacity: line.alpha,
            "stroke-width": frame2.passage ? 1.05 : 2.1,
            d: "M" + line.x + " " + line.y + " q" + (frame2.passage ? line.length * 0.14 : line.length * 0.45) + " " + (frame2.passage ? line.length * 0.5 : -line.bend) + " " + (frame2.passage ? line.length * 0.45 : line.length) + " " + (frame2.passage ? line.length : 0)
          } : { display: "none" });
        }
        const art = resources.get("actor");
        if (frame2.actor && art) {
          const pose = frame2.actor, region = actorCrop(art, pose.frame), ah = pose.width * region.height / region.width, anchor = HIKER_ANCHORS[pose.frame];
          attrs(hiker, { display: "", transform: "translate(" + pose.at.x + " " + pose.at.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + pose.mirror + " 1)" });
          attrs(crop, { viewBox: [region.x, region.y, region.width, region.height].join(" "), x: -pose.width * anchor.x, y: -ah * anchor.y, width: pose.width, height: ah });
          attrs(actor, { width: art.image.naturalWidth, height: art.image.naturalHeight });
          attrs(shadow, { display: "", cx: pose.at.x, cy: pose.at.y + 2, rx: 12, ry: 3.5 });
        } else {
          attrs(hiker, { display: "none" });
          attrs(shadow, { display: "none" });
        }
      },
      dispose() {
        root.remove();
      }
    };
  }
  function encodeCapture(source) {
    const budget = 3e5;
    for (const quality of [0.82, 0.7, 0.58]) {
      const url = source.toDataURL("image/webp", quality);
      if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
        return url;
    }
    for (const side of [800, 640, 480, 320]) {
      const scale = Math.min(1, side / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Canvas is unavailable.");
      context.fillStyle = "#f3edda";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      for (const format of ["image/webp", "image/jpeg"]) {
        const url = canvas.toDataURL(format, side >= 640 ? 0.7 : 0.62);
        if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
          return url;
      }
    }
    throw new Error("The frozen painting exceeds the journal image budget.");
  }
  async function renderer(P, host, resources, initialHeight, displayWidth, cancelled, onLost) {
    const app = new P.Application(), textures = /* @__PURE__ */ new Map(), crops = [];
    let disposed2 = false;
    const resolution = (height) => Math.max(0.25, Math.min(2, displayWidth() / WORLD.width * Math.min(2, globalThis.devicePixelRatio || 1), Math.sqrt(3e6 / (WORLD.width * height))));
    const scene = new P.Container(), paper2 = new P.Graphics(), world = new P.Container();
    const waterMask = new P.Sprite(P.Texture.EMPTY), whitewater = new P.Graphics(), shadow = new P.Graphics();
    let maskTexture = null, maskKey = "";
    let background = null, water = null, original = null, hiker = null;
    const loss = (event) => {
      event.preventDefault();
      dispose();
      onLost();
    };
    function dispose() {
      if (disposed2)
        return;
      disposed2 = true;
      try {
        app.canvas?.removeEventListener("webglcontextlost", loss);
      } catch {
      }
      try {
        app.destroy(true, { children: true });
      } catch {
      }
      for (const texture of crops)
        texture.destroy(false);
      for (const texture of textures.values())
        texture.destroy(true);
      maskTexture?.destroy(true);
      maskTexture = null;
      textures.clear();
      crops.length = 0;
    }
    try {
      let setWaterMask2 = function(frame2, rect) {
        const key = frame2.river ? "river" : frame2.passage ? "passage" : "high";
        if (maskKey === key)
          return;
        const canvas = document.createElement("canvas");
        canvas.width = WORLD.width;
        canvas.height = WORLD.height;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("The river mask could not be made.");
        const polygon2 = (points) => {
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (const p of points.slice(1))
            context.lineTo(p.x, p.y);
          context.closePath();
          context.fill();
        };
        context.fillStyle = "#ffffff";
        polygon2(waterPolygon(frame2, rect));
        context.globalCompositeOperation = "destination-out";
        for (const hole of waterHoles(frame2, rect))
          polygon2(hole);
        const previous = maskTexture;
        maskTexture = P.Texture.from(canvas, true);
        waterMask.texture = maskTexture;
        previous?.destroy(true);
        maskKey = key;
      }, paint2 = function(frame2) {
        if (disposed2)
          return;
        const projection = frame2.projection, res = resolution(projection.height);
        if (app.screen.height !== projection.height || Math.abs(app.renderer.resolution - res) > 0.01)
          app.renderer.resize(WORLD.width, projection.height, res);
        paper2.clear().rect(0, 0, WORLD.width, projection.height).fill(15986138);
        world.scale.set(projection.scale);
        world.position.set(projection.x, projection.y);
        const rect = imageRect(resources.get("scene"));
        background.position.set(rect.x, rect.y);
        background.width = rect.width;
        background.height = rect.height;
        const activeWater = !frame2.rest;
        water.visible = activeWater;
        whitewater.visible = activeWater;
        waterMask.visible = activeWater;
        if (activeWater) {
          setWaterMask2(frame2, rect);
          water.position.set(rect.x, rect.y);
          water.width = rect.width;
          water.height = rect.height;
          const buffer = water.geometry.getBuffer("aPosition"), values = buffer.data;
          for (let i = 0; i < values.length; i += 2) {
            const x = original[i], y = original[i + 1], q = y / sceneTexture.height;
            values[i] = x + (frame2.reduced ? 0 : Math.sin(y * 0.043 + frame2.wave * 1.3) * (frame2.river ? 2.4 : frame2.passage ? 0.38 : 1.05) * q);
            values[i + 1] = y + (frame2.reduced ? 0 : Math.sin(x * 0.034 + y * 0.01 - frame2.wave * 1.8) * (frame2.river ? 1.9 : frame2.passage ? 0.55 : 0.7) * q);
          }
          buffer.update();
          whitewater.clear();
          for (const wave of waves(frame2, rect))
            whitewater.moveTo(wave.x, wave.y).quadraticCurveTo(wave.x + wave.length * (frame2.passage ? 0.14 : 0.45), wave.y + (frame2.passage ? wave.length * 0.5 : -wave.bend), wave.x + wave.length * (frame2.passage ? 0.45 : 1), wave.y + (frame2.passage ? wave.length : 0)).stroke({ color: 16775133, width: frame2.river ? 2.1 : frame2.passage ? 1.05 : 1.3, alpha: wave.alpha, cap: "round" });
        }
        shadow.clear();
        if (hiker) {
          hiker.visible = !!frame2.actor;
          if (frame2.actor) {
            const a = frame2.actor, anchor = HIKER_ANCHORS[a.frame];
            hiker.texture = crops[a.frame];
            hiker.anchor.set(anchor.x, anchor.y);
            hiker.position.set(a.at.x, a.at.y);
            hiker.width = a.width;
            hiker.scale.y = Math.abs(hiker.scale.x);
            hiker.scale.x = Math.abs(hiker.scale.x) * a.mirror;
            hiker.rotation = a.rotation;
            hiker.alpha = a.alpha;
            shadow.ellipse(a.at.x, a.at.y + 2, 12, 3.5).fill({ color: 2374450, alpha: 0.2 });
          }
        }
        app.render();
      };
      var setWaterMask = setWaterMask2, paint = paint2;
      await app.init({ width: WORLD.width, height: initialHeight, resolution: resolution(initialHeight), autoDensity: true, antialias: true, autoStart: false, preference: "webgl", backgroundAlpha: 0 });
      if (cancelled()) {
        dispose();
        return null;
      }
      app.stage.eventMode = "none";
      app.stage.addChild(scene);
      scene.addChild(paper2, world);
      for (const [key, entry] of resources) {
        const texture = P.Texture.from(entry.image, true);
        textures.set(key, texture);
        if (app.renderer.prepare)
          await app.renderer.prepare.upload(texture);
        else
          app.renderer.texture.bind(texture);
        if (cancelled()) {
          dispose();
          return null;
        }
      }
      const sceneTexture = textures.get("scene");
      background = new P.Sprite(sceneTexture);
      world.addChild(background);
      water = new P.MeshPlane({ texture: sceneTexture, verticesX: 28, verticesY: 20 });
      original = new Float32Array(water.geometry.getBuffer("aPosition").data);
      water.alpha = 0.72;
      world.addChild(water, waterMask, whitewater, shadow);
      water.mask = waterMask;
      whitewater.mask = waterMask;
      const art = resources.get("actor"), actorTexture = textures.get("actor");
      if (art && actorTexture) {
        for (let i = 0; i < 8; i++) {
          const r = actorCrop(art, i);
          crops.push(new P.Texture({ source: actorTexture.source, frame: new P.Rectangle(r.x, r.y, r.width, r.height) }));
        }
        hiker = new P.Sprite(crops[0]);
        hiker.anchor.set(0.5, 0.88);
        world.addChild(hiker);
      }
      app.canvas.className = "mini-game-canvas tiger-trail-canvas";
      app.canvas.setAttribute("aria-hidden", "true");
      app.canvas.setAttribute("data-ready", "true");
      app.canvas.addEventListener("webglcontextlost", loss);
      host.appendChild(app.canvas);
      return {
        canvas: app.canvas,
        paint: paint2,
        dispose,
        capture(frame2) {
          if (disposed2)
            throw new Error("The painted scene has closed.");
          paint2({ ...frame2, capture: true });
          const canvas = app.renderer.extract.canvas({ target: scene, frame: new P.Rectangle(0, 0, WORLD.width, frame2.projection.height), resolution: Math.min(1, 960 / Math.max(WORLD.width, frame2.projection.height)), clearColor: "#f3edda", antialias: true });
          return encodeCapture(canvas);
        }
      };
    } catch (error) {
      console.warn("Tiger trail uses its painted SVG fallback:", error);
      dispose();
      return null;
    }
  }
  function drawTigerTrail(svg, parent, game) {
    parent.removeAttribute("visibility");
    attrs(parent, { viewBox: "0 0 1000 720", preserveAspectRatio: "xMidYMid meet" });
    return { tiger: true, tigerTrail: true, game, parent, fallback: fallback(svg, parent, game), gpu: null, resources: /* @__PURE__ */ new Map(), loaded: false, height: 720, displayWidth: 1e3, latest: null, host: null, resize: null, captureBusy: false, generation: 0, embedded: /* @__PURE__ */ new Map(), waitsForArt: true, contentState: "loading", disposed: false };
  }
  function paintTigerTrail(refs, state) {
    if (refs.disposed)
      return;
    refs.latest = state;
    const frame2 = stageFrame(state, refs.height);
    if (refs.gpu) {
      try {
        refs.gpu.paint(frame2);
        refs.parent.setAttribute("visibility", "hidden");
        return;
      } catch {
        refs.gpu.dispose();
        refs.gpu = null;
      }
    }
    refs.parent.removeAttribute("visibility");
    refs.fallback.paint(frame2, refs.resources);
    const loading = refs.fallback.root.querySelector("[data-loading]");
    if (loading)
      loading.textContent = refs.contentState === "error" ? "画作暂未展开，可以重试或继续行程。" : "江谷画作正在展开…";
  }
  function tigerTrailViewport(refs, state = refs.latest) {
    const p = project(state?.camera || { x: 500, y: 360, zoom: 1 }, refs.height);
    return { action: "viewport", viewWidth: p.width / p.scale, viewHeight: p.height / p.scale };
  }
  function tigerTrailPoint(refs, point2) {
    if (!refs.latest)
      return point2;
    const p = stageFrame(refs.latest, refs.height).projection;
    return {
      ...point2,
      x: ((point2.x ?? 0) * p.width - p.x) / p.scale,
      y: ((point2.y ?? 0) * p.height - p.y) / p.scale,
      viewWidth: p.width / p.scale,
      viewHeight: p.height / p.scale,
      ...point2.dx === void 0 ? {} : { dx: point2.dx * p.width / p.scale },
      ...point2.dy === void 0 ? {} : { dy: point2.dy * p.height / p.scale }
    };
  }
  async function mountTigerTrail(refs, host, cache2, pixi) {
    if (refs.disposed)
      return;
    const generation = ++refs.generation;
    refs.host = host;
    refs.gpu?.dispose();
    refs.gpu = null;
    refs.loaded = false;
    refs.resources.clear();
    refs.contentState = "loading";
    const cancelled = () => !!refs.disposed || refs.generation !== generation;
    const resize = () => {
      if (cancelled())
        return;
      const box = host.getBoundingClientRect();
      refs.displayWidth = box.width > 0 ? box.width : 1e3;
      refs.height = box.width > 0 && box.height > 0 ? Math.max(1, Math.round(WORLD.width * box.height / box.width)) : 720;
      if (refs.latest)
        paintTigerTrail(refs, refs.latest);
    };
    resize();
    refs.resize?.disconnect();
    if (globalThis.ResizeObserver) {
      refs.resize = new ResizeObserver(resize);
      refs.resize.observe(host);
    }
    const assets = tigerTrailAssets(refs.game), pending2 = [];
    for (const key of ["scene", "actor"]) {
      const file = assets[key];
      if (!file)
        continue;
      const entry = cache2?.request(file, "high");
      if (!entry) {
        refs.contentState = "error";
        return;
      }
      pending2.push([key, entry]);
    }
    await Promise.all(pending2.map(([, entry]) => entry.promise));
    if (cancelled())
      return;
    if (pending2.some(([, entry]) => entry.state !== "ready")) {
      refs.contentState = "error";
      return;
    }
    refs.resources = new Map(pending2);
    refs.loaded = true;
    const P = pixi;
    if (typeof P?.Application === "function") {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (cancelled())
        return;
      refs.gpu = await renderer(P, host, refs.resources, refs.height, () => refs.displayWidth, cancelled, () => {
        refs.gpu = null;
        if (!refs.disposed && refs.latest)
          paintTigerTrail(refs, refs.latest);
      });
    }
    if (cancelled()) {
      refs.gpu?.dispose();
      refs.gpu = null;
      return;
    }
    refs.contentState = "ready";
    if (refs.latest)
      paintTigerTrail(refs, refs.latest);
  }
  async function svgCapture(refs, frame2) {
    refs.fallback.paint({ ...frame2, capture: true }, refs.resources);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 1000 " + refs.height);
    const scale = Math.min(1, 960 / Math.max(WORLD.width, refs.height));
    svg.setAttribute("width", String(Math.round(WORLD.width * scale)));
    svg.setAttribute("height", String(Math.round(refs.height * scale)));
    const clone = refs.fallback.root.cloneNode(true);
    clone.querySelectorAll("[data-capture-hide]").forEach((node) => node.remove());
    svg.appendChild(clone);
    for (const node of clone.querySelectorAll("image")) {
      const href = node.getAttribute("href");
      if (!href)
        continue;
      let embedded = refs.embedded.get(href);
      if (!embedded) {
        const key = Object.entries(tigerTrailAssets(refs.game)).find(([, file]) => file === href)?.[0];
        const image = key && refs.resources.get(key)?.image;
        if (!image) {
          node.remove();
          continue;
        }
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("Canvas is unavailable.");
        context.drawImage(image, 0, 0);
        embedded = canvas.toDataURL("image/png");
        refs.embedded.set(href, embedded);
      }
      node.setAttribute("href", embedded);
    }
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("The frozen painting could not be rendered."));
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(WORLD.width * scale);
      canvas.height = Math.round(refs.height * scale);
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Canvas is unavailable.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return encodeCapture(canvas);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async function captureTigerTrail(refs, state = refs.latest) {
    if (refs.disposed || !refs.loaded || !state || refs.captureBusy)
      return null;
    refs.captureBusy = true;
    const generation = refs.generation;
    try {
      const frame2 = stageFrame(state, refs.height, true), url = refs.gpu ? refs.gpu.capture(frame2) : await svgCapture(refs, frame2);
      return refs.disposed || generation !== refs.generation ? null : url;
    } catch (error) {
      console.warn("The river photograph could not be saved:", error);
      return null;
    } finally {
      refs.captureBusy = false;
      if (!refs.disposed && refs.latest)
        paintTigerTrail(refs, refs.latest);
    }
  }
  function disposeTigerTrail(refs) {
    if (refs.disposed)
      return;
    refs.disposed = true;
    refs.generation++;
    refs.resize?.disconnect();
    refs.resize = null;
    refs.gpu?.dispose();
    refs.gpu = null;
    refs.fallback.dispose();
    refs.resources.clear();
    refs.embedded.clear();
    refs.latest = null;
    refs.host = null;
    refs.parent.removeAttribute("visibility");
  }

  // .build/typescript/runtime/tiger-trail/adapter.js
  var KEYS = {
    "tiger-climb": "按住空格或方向键前进，松开停下；走到山肩会自动留下记忆。",
    "tiger-river": "方向键取景，＋／－调整远近；空格拍照，B 连拍，1–5 选片，K 定格。",
    "tiger-rest": "方向键看看山景；Enter 继续走。",
    "tiger-passage": "Enter 继续走。"
  };
  var MEMORIES = {
    "tiger-climb": "沿二十八道拐的一段折返小径走上高处，山壁逐渐退开，金沙江落在深深的谷底。",
    "tiger-river": "沿张老师小路来到中虎跳江边，白浪掠过江中巨石。我选下这一帧，把自己的构图和奔流的一刻留在手帐里。",
    "tiger-rest": "在中途客栈歇了歇，看看峡谷对面的山。",
    "tiger-passage": "沿高路经过龙洞瀑布，水声短暂靠近，又落在身后。"
  };
  function createTigerTrailGames({ dom: dom2, onAction, riverArrived = false }) {
    const { get: $2, text, html } = dom2, bindings = new EventBindings();
    let generation = 0, pending2 = null, busy = false;
    let actionKey = "", framesKey = "", current = null;
    let activeRefs = null;
    let shutterPointer = null, shutterHeldAt = 0, holdingBurst = false, ignoreClick = false;
    const strip = $2("tiger-frame-strip");
    const zoom = $2("tiger-trail-zoom");
    const withViewport = (state) => activeRefs && !activeRefs.disposed ? inputTrail(state, tigerTrailViewport(activeRefs, state)) : state;
    function renderFrames(s) {
      strip.hidden = s.game !== "tiger-river" || !s.river.captures.length;
      const key = s.id + ":" + s.river.captures.map((frame2) => frame2.id).join(",");
      if (key !== framesKey) {
        strip.replaceChildren();
        s.river.captures.forEach((frame2, index) => {
          const button = html("button", null, strip, "tiger-frame");
          button.type = "button";
          button.dataset.frame = String(index);
          button.setAttribute("aria-label", "选择第 " + (index + 1) + " 帧");
          const picture = html("img", null, button);
          picture.src = frame2.url;
          picture.alt = "刚刚拍下的江景，第 " + (index + 1) + " 帧";
          html("span", String(index + 1), button);
        });
        framesKey = key;
      }
      strip.querySelectorAll("button[data-frame]").forEach((button, index) => {
        button.setAttribute("aria-pressed", String(index === s.river.selected));
        button.disabled = s.play.complete;
      });
    }
    function present(base, view) {
      const s = base, refs = view, waiting = refs.contentState !== "ready";
      current = s;
      $2("tiger-tools").hidden = false;
      $2("micro-panel").setAttribute("data-trail", "true");
      $2("micro-panel").setAttribute("data-trail-game", s.game);
      $2("micro-panel").setAttribute("data-phase", waiting ? "loading" : s.play.complete ? "memory" : s.game === "tiger-river" ? s.river.phase : s.acted ? "play" : "invite");
      text("micro-title", TITLES[s.game]);
      text("tiger-key-hint", KEYS[s.game]);
      text("micro-result", waiting ? refs.contentState === "error" ? "画作未能展开，可以重新加载，或继续旅程。" : "山与江正在展开……" : s.feedback);
      text("micro-skip", s.game === "tiger-river" ? "返回高路 →" : "继续走 →");
      $2("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      $2("micro-surface").setAttribute("aria-label", PROMPTS[s.game] + " " + KEYS[s.game] + " R 重试。");
      const controls = [];
      if (s.game === "tiger-climb") {
        text("tiger-count", s.climb.arrivedAt !== null ? "山肩 · 江在脚下" : s.climb.progress < 0.32 ? "沿着石壁，慢慢起步" : s.climb.progress < 0.7 ? "转过山弯，继续向上" : "山肩将近，峡谷渐渐展开");
      } else if (s.game === "tiger-rest") {
        text("tiger-count", "中途客栈 · 看山歇脚");
        controls.push({ action: "continue", label: "歇好了，继续走", primary: true });
      } else if (s.game === "tiger-passage") {
        text("tiger-count", "龙洞瀑布 · 沿高路经过");
        controls.push({ action: "continue", label: "继续沿高路走", primary: true });
      } else if (s.river.phase === "descent") {
        text("tiger-count", "张老师小路 ↓ 中虎跳江边 · 行程示意");
        controls.push({ action: "continue-to-river", label: "来到江边，看看激流", primary: true });
      } else {
        text("tiger-count", s.river.captureRequest ? "正在留下这一帧…" : s.river.burst ? "连拍中 · 最多五帧" : s.river.captures.length ? "已拍 " + s.river.captures.length + " 帧 · 点小图选一张" : "拖动取景 · 轻按拍照，按住连拍");
        controls.push({ action: "shutter", label: "拍下这一刻", primary: true, disabled: !!s.river.captureRequest || s.river.captures.length >= 5 });
        if (s.river.burst)
          controls.push({ action: "stop-burst", label: "停止连拍" });
        if (s.river.captures.length)
          controls.push({ action: "retake", label: "重新取景", disabled: !!s.river.captureRequest }, { action: "keep", label: "定格这一帧", primary: true, disabled: !!s.river.captureRequest || s.river.burst || s.river.selected < 0 });
      }
      const key = s.id + ":" + controls.map((c) => c.action).join(",");
      if (key !== actionKey) {
        $2("tiger-actions").replaceChildren();
        for (const control of controls) {
          const b = html("button", control.label, $2("tiger-actions"));
          b.type = "button";
          b.dataset.trailAction = control.action;
        }
        actionKey = key;
      }
      for (const control of controls) {
        const button = $2("tiger-actions").querySelector('[data-trail-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || s.play.complete || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const zoomVisible = s.game === "tiger-river" && s.river.phase === "river";
      $2("tiger-trail-lens").hidden = !zoomVisible;
      zoom.disabled = waiting || s.play.complete;
      if (dom2.document.activeElement !== zoom)
        zoom.value = String(s.camera.zoom);
      renderFrames(s);
    }
    const adapter = {
      create(entry, options) {
        generation++;
        pending2 = null;
        busy = false;
        actionKey = "";
        framesKey = "";
        shutterPointer = null;
        holdingBurst = false;
        ignoreClick = false;
        return createTrailState(entry, { ...options, riverArrival: riverArrived ? "river" : "descent" });
      },
      act: (state, point2) => inputTrail(withViewport(state), point2),
      move: (state, point2) => moveTrail(state, point2),
      release(state) {
        shutterPointer = null;
        holdingBurst = false;
        return releaseTrail(state);
      },
      tick(state, dt) {
        let s = withViewport(state);
        if (pending2 && pending2.generation === generation && pending2.id === s.id) {
          const result = pending2;
          pending2 = null;
          s = result.url ? attachTrailCapture(s, result.url, result.request) : rejectTrailCapture(s, result.request);
        }
        if (shutterPointer !== null && !holdingBurst && s.age - shutterHeldAt >= 0.45) {
          holdingBurst = true;
          s = inputTrail(s, { action: "burst" });
        }
        return tickTrail(s, dt);
      },
      draw: (svg, parent, entry) => drawTigerTrail(svg, parent, TRAIL_GAMES[entry.id]),
      paint(view, state) {
        const refs = view, s = state;
        activeRefs = refs;
        paintTigerTrail(refs, s);
        const request = s.river.captureRequest;
        if (!request || busy || pending2 || refs.captureBusy || refs.contentState !== "ready")
          return;
        busy = true;
        const started = generation;
        void captureTigerTrail(refs, s).then((url) => {
          if (generation === started && !refs.disposed)
            pending2 = { generation: started, id: s.id, request: request.id, url };
        }, () => {
          if (generation === started && !refs.disposed)
            pending2 = { generation: started, id: s.id, request: request.id, url: null };
        }).finally(() => {
          if (generation === started)
            busy = false;
        });
      },
      instruction: (entry) => PROMPTS[TRAIL_GAMES[entry.id]],
      status: (state) => state.feedback,
      outcome(state, entry) {
        const s = state, captured = s.game === "tiger-river" ? s.river.captures[s.river.selected]?.url : null;
        return {
          id: s.id,
          edition: entry.edition,
          earned: s.play.complete,
          interaction: s.gesture,
          memory: MEMORIES[s.game],
          title: s.play.complete ? entry.tag : entry.name,
          ...captured ? { captureArt: captured, artSource: "capture" } : {}
        };
      },
      assets: (entry) => tigerTrailAssets(TRAIL_GAMES[entry.id]),
      mount: (refs, context) => mountTigerTrail(refs, context.host, context.cache, context.pixi),
      dispose(refs) {
        generation++;
        pending2 = null;
        busy = false;
        current = null;
        activeRefs = null;
        shutterPointer = null;
        holdingBurst = false;
        strip.replaceChildren();
        strip.hidden = true;
        $2("tiger-trail-lens").hidden = true;
        $2("micro-panel").removeAttribute("data-trail");
        $2("micro-panel").removeAttribute("data-trail-game");
        disposeTigerTrail(refs);
      },
      point: (refs, point2) => tigerTrailPoint(refs, point2),
      key: (state, key, phase) => keyTrail(withViewport(state), key, phase),
      present
    };
    const actions = $2("tiger-actions");
    bindings.listen(actions, "click", (event) => {
      const button = event.target.closest("button[data-trail-action]");
      const action = button?.dataset.trailAction;
      if (!button || button.disabled || !action)
        return;
      if (action === "shutter" && ignoreClick && event.detail > 0) {
        ignoreClick = false;
        return;
      }
      onAction(action);
    });
    bindings.listen(actions, "pointerdown", (event) => {
      const button = event.target.closest('[data-trail-action="shutter"]');
      if (!button || button.disabled || !current || event.button !== 0)
        return;
      onAction("shutter");
      shutterPointer = event.pointerId;
      shutterHeldAt = current.age;
      holdingBurst = false;
      ignoreClick = true;
      actions.setPointerCapture(event.pointerId);
    });
    const endShutter = (event) => {
      if (shutterPointer !== event.pointerId)
        return;
      const wasBurst = holdingBurst;
      shutterPointer = null;
      holdingBurst = false;
      if (actions.hasPointerCapture(event.pointerId))
        actions.releasePointerCapture(event.pointerId);
      if (wasBurst)
        onAction("stop-burst");
    };
    bindings.listen(actions, "pointerup", endShutter);
    bindings.listen(actions, "pointercancel", endShutter);
    bindings.listen(actions, "lostpointercapture", endShutter);
    bindings.listen(strip, "click", (event) => {
      const button = event.target.closest("button[data-frame]");
      if (button && !button.disabled)
        onAction("select-frame", Number(button.dataset.frame));
    });
    bindings.listen(zoom, "input", () => onAction("zoom", Number(zoom.value)));
    return { adapter, destroy: () => bindings.destroy() };
  }

  // .build/typescript/runtime/tiger-memories/model.js
  var MEMORY_SPECS = {
    "tiger-bends-puzzle-v4": { kind: "bends", game: "tiger-climb", title: "转过山弯", badge: "山弯初见", prompt: "从起点沿箭头描过 S 弯，画到山肩后松手出发。", keys: "方向键移笔，按住空格或 Enter 落笔，松开后启程；R 重试。", memory: "我沿着山坡画下一道 S 弯，小人循着山路走上山肩。山弯转过，金沙江的白浪在峡谷里奔流，江声慢慢涌了上来。" },
    "tiger-inn-pairs-v4": { kind: "inn", game: "tiger-rest", title: "记住山色", badge: "半山灯火", prompt: "翻开四张画片，找到两对相同的风景。", keys: "方向键选画片，Enter 翻开。", memory: "在中途客栈的桌边认出两对山影与窗灯。山色暗下来，窗里亮起暖光，今晚就在这里歇脚。" },
    "tiger-waterfall-paint-v4": { kind: "waterfall", game: "tiger-passage", title: "涂一页山色", badge: "崖间飞瀑", prompt: "蘸一点颜色，把岩壁与草木两处留白涂上山色。", keys: "1–3 选颜料；方向键移动笔，按住空格落笔。", memory: "在龙洞瀑布附近停下，用自己选的颜色涂过岩壁和草木。水声落在山径边，山色留在这一页。" },
    "tiger-river-roundframe-v4": { kind: "river", game: "tiger-river", title: "把江声留下", badge: "江声入峡", prompt: "拖动圆形取景窗，把巨石和白浪一起装进去，松手拍下。", keys: "方向键移动取景窗，Enter 拍下；巨石和近旁白浪都要入窗。", memory: "沿张老师小路来到中虎跳江边，把江心巨石和它旁边的一段白浪一起放进圆窗，留下当时亲手选定的构图。" }
  };
  var memoryId = (id2) => Object.hasOwn(MEMORY_SPECS, id2);
  var MEMORY_IDS = Object.keys(MEMORY_SPECS).filter(memoryId);
  var sceneFile = (kind) => `scenes/tiger-memories-v4/${kind}.webp`;
  var badgeFile = (kind) => `badges/tiger-memories-v4/${kind}.webp`;
  var clamp3 = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var inside = (p, r) => p.x >= r.x && p.y >= r.y && p.x <= r.x + r.width && p.y <= r.y + r.height;
  var MemoryState = class {
    id;
    route = "tiger";
    kind;
    game;
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.5;
    play = { type: "tiger-memory", progress: 0, complete: false, completedAt: null, reduced: false };
    events = [];
    serial = 0;
    feedback;
    flow = { kind: "playing" };
    portrait = false;
    wave = 0;
    session;
    constructor(id2, reduced2, order = [0, 1, 1, 0]) {
      this.id = id2;
      const spec = MEMORY_SPECS[id2];
      this.kind = spec.kind;
      this.game = spec.game;
      this.feedback = spec.prompt;
      this.play.reduced = reduced2;
      switch (spec.kind) {
        case "bends":
          this.session = { kind: "bends", phase: { kind: "drawing", progress: 0, pen: { kind: "up" }, cursor: { x: 178 * 1e3 / 724, y: 479 * 750 / 543 }, keyboard: false } };
          break;
        case "inn":
          this.session = { kind: "inn", order, open: [], matched: [], turnAt: null, focus: 0 };
          break;
        case "waterfall":
          this.session = { kind: "waterfall", color: 0, strokes: [], coverage: [[], []], brush: { x: 0.35, y: 0.45 }, drawing: false, keyHeld: false, keyboard: false, reveal: 0 };
          break;
        case "river":
          this.session = { kind: "river", center: { x: 0.23, y: 0.3 }, drag: null, adjusted: false, shot: null };
          break;
      }
    }
  };
  function fork(s) {
    const n = new MemoryState(s.id, s.play.reduced);
    Object.assign(n, s);
    n.play = { ...s.play };
    n.events = s.events.slice(-15);
    switch (s.session.kind) {
      case "bends":
        n.session = { ...s.session, phase: s.session.phase.kind === "drawing" ? { ...s.session.phase, pen: s.session.phase.pen.kind === "down" ? { kind: "down", last: { ...s.session.phase.pen.last } } : { kind: "up" }, cursor: { ...s.session.phase.cursor } } : { ...s.session.phase } };
        break;
      case "inn":
        n.session = { ...s.session, open: s.session.open.slice(), matched: s.session.matched.slice() };
        break;
      case "waterfall":
        n.session = { ...s.session, brush: { ...s.session.brush }, strokes: s.session.strokes.slice(), coverage: [s.session.coverage[0].slice(), s.session.coverage[1].slice()] };
        break;
      case "river":
        n.session = { ...s.session, center: { ...s.session.center }, drag: s.session.drag ? { ...s.session.drag } : null };
        break;
    }
    return n;
  }
  function stateOf(base) {
    if (!(base instanceof MemoryState))
      throw new Error("虎跳峡互动状态不匹配");
    return base;
  }
  function emit2(s, type, index = 0) {
    s.events.push({ serial: ++s.serial, type, x: 0.5, index });
  }
  function settle(s) {
    if (s.flow.kind === "playing") {
      s.flow = { kind: "settling", at: s.age };
      s.dragging = false;
    }
  }

  // .build/typescript/runtime/tiger-memories/road.js
  var ROAD_POINTS = curve([[178, 479], [252, 461], [331, 436], [398, 416], [430, 395], [399, 380], [332, 365], [255, 347], [180, 328], [130, 307], [127, 289], [193, 273], [299, 256], [388, 233]].map(([x, y]) => ({ x: x * 1e3 / 724, y: y * 750 / 543 })), 8);
  var lengths = [0];
  for (let i = 1; i < ROAD_POINTS.length; i++)
    lengths.push(lengths[i - 1] + distance2(ROAD_POINTS[i - 1], ROAD_POINTS[i]));
  var ROAD_LENGTH = lengths[lengths.length - 1];
  var ROAD_STATIONS = ROAD_POINTS.map((point2, i) => ({ point: point2, progress: lengths[i] / ROAD_LENGTH }));
  var TURN_DISTANCES = [lengths[4 * 8], lengths[10 * 8]];
  var WALK_SPEED = ROAD_LENGTH / 8.6;
  var TURN_PAUSE = 0.32;
  var ROAD_WALK_SECONDS = ROAD_LENGTH / WALK_SPEED + TURN_PAUSE * TURN_DISTANCES.length;
  var ROAD_RIVER_SECONDS = 4.8;
  var roadWalk = (phase) => phase.kind === "walking" ? phase.progress : phase.kind === "river" ? 1 : 0;
  function roadAt(progress) {
    const at = clamp3(progress, 0, 1) * ROAD_LENGTH;
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < at)
      i++;
    const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], t = (at - lengths[i - 1]) / Math.max(1e-3, lengths[i] - lengths[i - 1]);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  function roadWalkingProgress(elapsed) {
    let stopped = 0;
    for (const turn of TURN_DISTANCES) {
      const arrive = turn / WALK_SPEED + stopped;
      if (elapsed < arrive)
        break;
      if (elapsed < arrive + TURN_PAUSE)
        return turn / ROAD_LENGTH;
      stopped += TURN_PAUSE;
    }
    return clamp3((elapsed - stopped) * WALK_SPEED / ROAD_LENGTH, 0, 1);
  }
  function traceRoad(progress, from, to, tolerance) {
    const count = Math.max(1, Math.min(256, Math.ceil(distance2(from, to) / 8)));
    for (let sample = 1; sample <= count; sample++) {
      const at = { x: from.x + (to.x - from.x) * sample / count, y: from.y + (to.y - from.y) * sample / count };
      const low = Math.max(0, progress * ROAD_LENGTH - tolerance), high = Math.min(ROAD_LENGTH, progress * ROAD_LENGTH + 22);
      let nearest = Infinity, next = progress;
      for (let i = 1; i < ROAD_POINTS.length; i++) {
        if (lengths[i] < low || lengths[i - 1] > high)
          continue;
        const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], len = lengths[i] - lengths[i - 1];
        const t = clamp3(((at.x - a.x) * (b.x - a.x) + (at.y - a.y) * (b.y - a.y)) / Math.max(1e-3, len * len), clamp3((low - lengths[i - 1]) / Math.max(1e-3, len), 0, 1), clamp3((high - lengths[i - 1]) / Math.max(1e-3, len), 0, 1));
        const d = distance2(at, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        if (d < nearest) {
          nearest = d;
          next = Math.max(progress, (lengths[i - 1] + t * len) / ROAD_LENGTH);
        }
      }
      if (nearest > tolerance)
        return { progress, connected: false };
      progress = next;
    }
    return { progress, connected: true };
  }

  // .build/typescript/runtime/tiger-memories/layout.js
  var PALETTE = ["#a8a778", "#7c998a", "#b99c7c"];
  var BRUSH = 0.068;
  var regionRock = [{ x: 0.08, y: 0.05 }, { x: 0.38, y: 0.02 }, { x: 0.47, y: 0.14 }, { x: 0.4, y: 0.33 }, { x: 0.52, y: 0.5 }, { x: 0.4, y: 0.65 }, { x: 0.24, y: 0.67 }, { x: 0.15, y: 0.42 }];
  var regionPlants = [{ x: 0.02, y: 0.47 }, { x: 0.2, y: 0.44 }, { x: 0.29, y: 0.63 }, { x: 0.42, y: 0.72 }, { x: 0.5, y: 0.91 }, { x: 0.32, y: 0.99 }, { x: 0.03, y: 0.97 }];
  var PAINT_REGIONS = [regionRock, regionPlants];
  function polygonContains(p, polygon2) {
    let result = false;
    for (let i = 0, j = polygon2.length - 1; i < polygon2.length; j = i++) {
      const a = polygon2[i], b = polygon2[j];
      if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
        result = !result;
    }
    return result;
  }
  var PAINT_CELLS = PAINT_REGIONS.map((region) => {
    const cells = [];
    for (let y = 0.025; y < 1; y += 0.05)
      for (let x = 0.025; x < 1; x += 0.05)
        if (polygonContains({ x, y }, region))
          cells.push({ x, y });
    return cells;
  });
  var coverage = (s) => s.session.kind === "waterfall" ? s.session.coverage.map((cells, i) => cells.length / PAINT_CELLS[i].length) : [];
  function layout(s, viewport) {
    const height = s.kind === "bends" && viewport ? 1e3 * viewport.height / viewport.width : s.portrait ? s.kind === "bends" ? 1040 : 1260 : 750;
    const walk = s.session.kind === "bends" ? roadWalk(s.session.phase) : 0;
    const zoom = s.kind === "bends" ? Math.max(1, height / 750) * (1.03 - walk * 0.03) : 1;
    const scene = s.kind === "river" ? { x: 0, y: 0, width: 1e3, height } : s.kind === "bends" ? {
      x: clamp3(500 - 385 * zoom, 1e3 - 1e3 * zoom, 0),
      y: clamp3(height / 2 - (492 - walk * 25) * zoom, height - 750 * zoom, 0),
      width: 1e3 * zoom,
      height: 750 * zoom
    } : { x: 0, y: 0, width: 1e3, height: 750 };
    const sketch = s.portrait ? { x: 90, y: 800, width: 680, height: 400 } : { x: 545, y: 350, width: 405, height: 340 };
    const sketchImage = { x: sketch.x + 20, y: sketch.y + 16, width: sketch.width - 40, height: sketch.height - 42 };
    const swatches = PALETTE.map((_, i) => s.portrait ? { x: 885, y: 865 + i * 135 } : { x: 508, y: 410 + i * 98 });
    const cardWidth = s.portrait ? 175 : 132, cardHeight = cardWidth * 0.9;
    const cards = Array.from({ length: 4 }, (_, i) => ({ x: (s.portrait ? 105 : 170) + i * (s.portrait ? 205 : 161), y: s.portrait ? 900 : 550, width: cardWidth, height: cardHeight }));
    const radius = s.portrait ? 360 : 236;
    return { width: 1e3, height, scene, sketch, sketchImage, swatches, cards, radius };
  }
  function riverImageRect(portrait) {
    const height = portrait ? 1260 : 750, scale = Math.max(1, height / 750);
    return { x: (1e3 - 1e3 * scale) * 0.55, y: 0, width: 1e3 * scale, height: 750 * scale };
  }
  var riverToStage = (p, portrait) => {
    const r = riverImageRect(portrait);
    return { x: r.x + p.x * r.width, y: r.y + p.y * r.height };
  };
  var stageToRiver = (p, portrait) => {
    const r = riverImageRect(portrait);
    return { x: (p.x - r.x) / r.width, y: (p.y - r.y) / r.height };
  };
  function frameCenter(s) {
    const at = riverToStage(s.session.kind === "river" ? s.session.center : { x: 0.23, y: 0.3 }, s.portrait), l = layout(s);
    return { x: clamp3(at.x, l.radius, 1e3 - l.radius), y: clamp3(at.y, l.radius, l.height - l.radius) };
  }
  function frameFits(s) {
    if (s.session.kind !== "river")
      return false;
    const center = frameCenter(s), radius = layout(s).radius;
    return [{ x: 0.489, y: 0.45 }, { x: 0.765, y: 0.68 }, { x: 0.64, y: 0.81 }, { x: 0.4, y: 0.68 }].every((p) => distance2(center, riverToStage(p, s.portrait)) < radius * 0.94);
  }
  function moveFrame(s, p) {
    const l = layout(s), radius = l.radius;
    return stageToRiver({ x: clamp3(p.x, radius, l.width - radius), y: clamp3(p.y, radius, l.height - radius) }, s.portrait);
  }
  function roadFromStage(s, at, viewport) {
    const r = layout(s, viewport).scene;
    return { x: (at.x - r.x) * 1e3 / r.width, y: (at.y - r.y) * 750 / r.height };
  }
  function roadToStage(s, at, viewport) {
    const r = layout(s, viewport).scene;
    return { x: r.x + at.x * r.width / 1e3, y: r.y + at.y * r.height / 750 };
  }

  // .build/typescript/runtime/tiger-memories/rules.js
  var point = (input) => typeof input.x === "number" && typeof input.y === "number" && Number.isFinite(input.x) && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
  function createMemory(id2, reduced2) {
    const order = [0, 0, 1, 1];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return new MemoryState(id2, reduced2, order);
  }
  function beginRoad(s, at) {
    const p = s.session;
    if (p.kind !== "bends" || p.phase.kind !== "drawing")
      return;
    const phase = p.phase;
    phase.cursor = at;
    if (distance2(at, roadAt(phase.progress)) > (s.portrait ? 58 : 36)) {
      s.feedback = "从已经画好的路头接着画就好。";
      return;
    }
    phase.pen = { kind: "down", last: at };
    s.dragging = true;
  }
  function drawRoad(s, at) {
    const p = s.session;
    if (p.kind !== "bends" || p.phase.kind !== "drawing")
      return;
    const phase = p.phase, before = phase.progress;
    if (phase.pen.kind !== "down")
      return;
    const next = traceRoad(before, phase.pen.last, at, s.portrait ? 48 : 26);
    phase.progress = next.progress;
    phase.cursor = at;
    phase.pen = next.connected ? { kind: "down", last: at } : { kind: "up" };
    s.dragging = next.connected;
    if (next.progress > before + 1e-4) {
      if (!s.acted)
        emit2(s, "depth-paper");
      s.acted = true;
      s.gesture = "drag";
    }
    s.play.progress = phase.progress * 0.55;
    s.feedback = phase.progress >= 0.99 ? "山路画好了，松手就出发。" : next.connected ? "顺着这道山弯，慢慢往上画。" : "这段已经留下了，从路头接着画。";
  }
  function finishRoad(s) {
    const p = s.session;
    if (p.kind !== "bends" || p.phase.kind !== "drawing")
      return;
    const phase = p.phase, placed = phase.pen.kind === "down" && phase.progress >= 0.99;
    phase.pen = { kind: "up" };
    s.dragging = false;
    if (placed) {
      p.phase = { kind: "walking", elapsed: 0, progress: 0 };
      s.feedback = "沿着刚画好的山路，走上山肩。";
      emit2(s, "pack-place");
    }
  }
  function flipCard(s, index) {
    const p = s.session;
    if (p.kind !== "inn" || p.turnAt !== null || p.matched.includes(index) || p.open.includes(index))
      return;
    p.open.push(index);
    s.acted = true;
    s.feedback = "再找找相同的那一张。";
    emit2(s, "depth-paper", index);
    if (p.open.length !== 2)
      return;
    if (p.order[p.open[0]] === p.order[p.open[1]]) {
      p.matched.push(...p.open);
      p.open = [];
      s.play.progress = p.matched.length / 4;
      s.feedback = p.matched.length === 4 ? "山影与窗灯，都记住了。" : "找到一对了，还有两张。";
      emit2(s, "pack-place", index);
      if (p.matched.length === 4)
        settle(s);
    } else {
      p.turnAt = s.age;
      s.feedback = "这两张不同，再翻翻看。";
    }
  }
  function paintPoint(s, at, start = false) {
    const p = s.session;
    if (p.kind !== "waterfall")
      return;
    const r = layout(s).sketchImage, next = { x: clamp3((at.x - r.x) / r.width, 0, 1), y: clamp3((at.y - r.y) / r.height, 0, 1) };
    const lastStroke = p.strokes[p.strokes.length - 1], old = lastStroke?.points[lastStroke.points.length - 1] ?? p.brush;
    p.brush = next;
    if (!inside(at, r)) {
      p.drawing = false;
      return;
    }
    if (!p.drawing && !start)
      return;
    if (!start && lastStroke?.color === p.color && distance2(old, next) < 3e-3)
      return;
    const begin = start || !p.strokes.length || p.strokes[p.strokes.length - 1].color !== p.color;
    if (begin) {
      p.strokes.push({ color: p.color, points: [next] });
    } else {
      const last = p.strokes[p.strokes.length - 1];
      if (last.points.length >= 500)
        p.strokes.push({ color: p.color, points: [old, next] });
      else
        p.strokes[p.strokes.length - 1] = { color: last.color, points: [...last.points, next] };
    }
    p.drawing = true;
    s.acted = true;
    s.gesture = "drag";
    const samples = Math.max(1, Math.ceil(distance2(begin ? next : old, next) / (BRUSH * 0.35)));
    for (let j = 0; j <= samples; j++) {
      const t = j / samples, a = begin ? next : old, sample = { x: a.x + (next.x - a.x) * t, y: a.y + (next.y - a.y) * t };
      PAINT_CELLS.forEach((cells, region) => cells.forEach((cell, index) => {
        if (distance2(cell, sample) <= BRUSH && !p.coverage[region].includes(index))
          p.coverage[region].push(index);
      }));
    }
    const filled = coverage(s);
    s.play.progress = filled.reduce((sum, value) => sum + Math.min(1, value / 0.62), 0) / 2;
    s.feedback = filled.every((value) => value >= 0.62) ? "这一页山色，留下来了。" : filled[0] >= 0.62 ? "岩壁有颜色了，再涂涂草木。" : filled[1] >= 0.62 ? "草木有颜色了，再涂涂岩壁。" : "把颜色轻轻涂在纸上的两处留白。";
    if (start)
      emit2(s, "depth-paper");
    if (filled.every((value) => value >= 0.62)) {
      p.drawing = false;
      p.keyHeld = false;
      settle(s);
    }
  }
  function shoot(s) {
    const p = s.session;
    if (p.kind !== "river")
      return;
    if (!p.adjusted || !frameFits(s)) {
      s.feedback = "把巨石的上缘和旁边的白浪，都留在圆窗里。";
      return;
    }
    p.shot = { center: frameCenter(s), wave: s.wave, portrait: s.portrait };
    s.acted = true;
    s.play.progress = 1;
    emit2(s, "shutter");
    settle(s);
  }
  function actMemory(state, input) {
    const s = fork(state);
    if (input.action === "retry-capture" && s.flow.kind === "capture-error") {
      s.flow = { kind: "capturing" };
      return s;
    }
    if (s.flow.kind !== "playing")
      return state;
    const at = point(input), l = layout(s), p = s.session;
    if (!at)
      return state;
    if (input.phase === "press") {
      switch (p.kind) {
        case "bends":
          if (p.phase.kind === "drawing") {
            p.phase.keyboard = false;
            beginRoad(s, roadFromStage(s, at));
          }
          break;
        case "inn":
          break;
        case "waterfall": {
          p.keyboard = false;
          const color = l.swatches.findIndex((c) => distance2(c, at) <= (s.portrait ? 76 : 48));
          if (color >= 0) {
            p.color = color;
            emit2(s, "depth-paper");
          } else if (inside(at, l.sketchImage))
            paintPoint(s, at, true);
          break;
        }
        case "river": {
          const center = frameCenter(s);
          if (distance2(at, center) <= l.radius + 35)
            p.drag = { offset: { x: center.x - at.x, y: center.y - at.y }, moved: false };
          break;
        }
      }
    } else if (input.phase === "release") {
      switch (p.kind) {
        case "bends":
          drawRoad(s, roadFromStage(s, at));
          finishRoad(s);
          break;
        case "inn": {
          const index = l.cards.findIndex((card) => inside(at, card));
          if (index >= 0) {
            p.focus = index;
            flipCard(s, index);
          }
          break;
        }
        case "waterfall":
          p.drawing = false;
          break;
        case "river": {
          const moved = p.drag?.moved;
          p.drag = null;
          if (moved)
            shoot(s);
          break;
        }
      }
      s.dragging = false;
    }
    return s;
  }
  function moveMemory(state, input) {
    if (state.flow.kind !== "playing")
      return state;
    const at = point(input);
    if (!at)
      return state;
    const s = fork(state), p = s.session;
    switch (p.kind) {
      case "bends":
        drawRoad(s, roadFromStage(s, at));
        break;
      case "inn":
        break;
      case "waterfall":
        if (p.drawing)
          paintPoint(s, at);
        break;
      case "river":
        if (p.drag) {
          const center = { x: at.x + p.drag.offset.x, y: at.y + p.drag.offset.y }, before = frameCenter(s);
          p.center = moveFrame(s, center);
          if (distance2(before, frameCenter(s)) > 0.2) {
            p.drag.moved = true;
            p.adjusted = true;
            s.acted = true;
            s.gesture = "drag";
          }
          s.feedback = frameFits(s) ? "巨石和白浪入窗了，松手留下这一刻。" : "再移一移圆窗，把巨石和白浪一起装进去。";
        }
        break;
    }
    return s;
  }
  function releaseMemory(state) {
    const s = fork(state), p = s.session;
    s.dragging = false;
    if (p.kind === "bends" && p.phase.kind === "drawing")
      p.phase.pen = { kind: "up" };
    if (p.kind === "waterfall") {
      p.drawing = false;
      p.keyHeld = false;
    }
    if (p.kind === "river")
      p.drag = null;
    return s;
  }
  function tickMemory(state, dt) {
    if (!Number.isFinite(dt) || dt <= 0 || state.done)
      return state;
    const s = fork(state), p = s.session;
    s.age += Math.min(dt, 0.1);
    if (p.kind !== "river" || !p.shot)
      s.wave += s.play.reduced ? 0 : Math.min(dt, 0.1);
    if (p.kind === "bends" && s.flow.kind === "playing") {
      const phase = p.phase;
      if (phase.kind === "walking") {
        const before = Math.floor(phase.progress * ROAD_LENGTH / 34);
        phase.elapsed += Math.min(dt, 0.1);
        phase.progress = roadWalkingProgress(phase.elapsed);
        s.play.progress = 0.55 + phase.progress * 0.3;
        const step = Math.floor(phase.progress * ROAD_LENGTH / 34);
        if (step > before)
          emit2(s, "road-step", step);
        if (phase.elapsed >= ROAD_WALK_SECONDS) {
          p.phase = { kind: "river", elapsed: 0 };
          s.feedback = "山弯转过，金沙江的激流就在峡谷下方。";
          emit2(s, "river-arrive");
        }
      } else if (phase.kind === "river") {
        phase.elapsed = Math.min(ROAD_RIVER_SECONDS, phase.elapsed + Math.min(dt, 0.1));
        s.play.progress = 0.85 + phase.elapsed / ROAD_RIVER_SECONDS * 0.1;
        if (phase.elapsed >= ROAD_RIVER_SECONDS)
          settle(s);
      }
    }
    if (p.kind === "inn" && p.turnAt !== null && s.age - p.turnAt > (s.play.reduced ? 0.35 : 0.85)) {
      p.open = [];
      p.turnAt = null;
    }
    if (p.kind === "waterfall") {
      if (p.keyHeld && s.flow.kind === "playing") {
        const r = layout(s).sketchImage;
        paintPoint(s, { x: r.x + p.brush.x * r.width, y: r.y + p.brush.y * r.height });
      }
      if (s.flow.kind !== "playing")
        p.reveal = clamp3(p.reveal + dt * 1.4, 0, 1);
    }
    if (s.flow.kind === "settling" && s.age - s.flow.at >= (s.play.reduced ? 0.3 : 1.1))
      s.flow = { kind: "capturing" };
    if (s.flow.kind === "complete" && s.play.completedAt !== null && s.age - s.play.completedAt > (s.play.reduced ? 0.3 : 1.15))
      s.done = true;
    return s;
  }
  function attachMemoryCapture(state, art) {
    if (state.flow.kind !== "capturing")
      return state;
    const s = fork(state);
    if (!art) {
      s.flow = { kind: "capture-error" };
      s.feedback = "画面暂未能保存，可重试留下这幅画，或继续旅程。";
      return s;
    }
    s.flow = { kind: "complete", art };
    s.play.complete = true;
    s.play.progress = 1;
    s.play.completedAt = s.age;
    s.feedback = MEMORY_SPECS[s.id].badge + "，这一刻值得留下。";
    emit2(s, "complete");
    return s;
  }
  function keyMemory(state, key, phase) {
    const arrow = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key];
    if (!arrow && !["Enter", " ", "1", "2", "3"].includes(key))
      return null;
    if (state.flow.kind !== "playing")
      return state;
    const s = fork(state), p = s.session;
    if (phase === "up") {
      if (p.kind === "bends" && (key === " " || key === "Enter"))
        finishRoad(s);
      if (key === " " && p.kind === "waterfall") {
        p.keyHeld = false;
        p.drawing = false;
      }
      return s;
    }
    switch (p.kind) {
      case "bends": {
        if (p.phase.kind !== "drawing")
          break;
        p.phase.keyboard = true;
        if (arrow) {
          const at = { x: clamp3(p.phase.cursor.x + arrow[0] * 12, 0, 1e3), y: clamp3(p.phase.cursor.y + arrow[1] * 12, 0, 750) };
          if (p.phase.pen.kind === "down")
            drawRoad(s, at);
          else
            p.phase.cursor = at;
        } else if ((key === " " || key === "Enter") && p.phase.pen.kind === "up")
          beginRoad(s, p.phase.cursor);
        break;
      }
      case "inn":
        if (arrow)
          p.focus = (p.focus + (arrow[0] || arrow[1]) + 4) % 4;
        else if (key === "Enter" || key === " ")
          flipCard(s, p.focus);
        break;
      case "waterfall": {
        p.keyboard = true;
        if (/^[1-3]$/.test(key)) {
          p.color = Number(key) - 1;
          p.drawing = false;
        } else if (arrow) {
          p.brush = { x: clamp3(p.brush.x + arrow[0] * 0.045, 0, 1), y: clamp3(p.brush.y + arrow[1] * 0.045, 0, 1) };
        } else if (key === " ") {
          p.keyHeld = true;
          const r = layout(s).sketchImage;
          paintPoint(s, { x: r.x + p.brush.x * r.width, y: r.y + p.brush.y * r.height }, !p.drawing);
        }
        break;
      }
      case "river":
        if (arrow) {
          const center = frameCenter(s);
          p.center = moveFrame(s, { x: center.x + arrow[0] * 24, y: center.y + arrow[1] * 24 });
          p.adjusted = true;
          s.acted = true;
        } else if (key === "Enter" || key === " ")
          shoot(s);
        break;
    }
    return s;
  }

  // .build/typescript/runtime/tiger-memories/view.js
  function polygon(ctx, points, r) {
    points.forEach((p, i) => {
      const x = r.x + p.x * r.width, y = r.y + p.y * r.height;
      if (!i)
        ctx.moveTo(x, y);
      else
        ctx.lineTo(x, y);
    });
    ctx.closePath();
  }
  function paintImage(ctx, image, r) {
    ctx.drawImage(image, r.x, r.y, r.width, r.height);
  }
  function imagePart(ctx, image, source, target) {
    ctx.drawImage(image, source.x * image.naturalWidth / 1e3, source.y * image.naturalHeight / 750, source.width * image.naturalWidth / 1e3, source.height * image.naturalHeight / 750, target.x, target.y, target.width, target.height);
  }
  function paperPath(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(r.x + 3, r.y + 2);
    ctx.lineTo(r.x + r.width - 3, r.y);
    ctx.lineTo(r.x + r.width, r.y + r.height - 4);
    ctx.lineTo(r.x + 2, r.y + r.height);
    ctx.closePath();
  }
  function paper(ctx, r, outline2 = "#b9b196", shadow = false) {
    ctx.save();
    if (shadow) {
      ctx.shadowColor = "#253e393d";
      ctx.shadowBlur = 13;
      ctx.shadowOffsetY = 5;
    }
    paperPath(ctx, r);
    ctx.fillStyle = "#f4efdf";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = outline2;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }
  function ink2(ctx, text, at, size = 17) {
    ctx.fillStyle = "#6b7761";
    ctx.font = `${size}px "PingFang SC",sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, at.x, at.y);
  }
  var MemoryView = class {
    kind;
    doc;
    tiger = true;
    canvas;
    contentState = "loading";
    disposed = false;
    images = null;
    observer = null;
    host = null;
    state = null;
    brushCanvas;
    paintedStrokes = -1;
    paintedPoints = -1;
    portraitValue = false;
    cssWidth = 1e3;
    constructor(kind, doc) {
      this.kind = kind;
      this.doc = doc;
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "tiger-memory-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      this.brushCanvas = doc.createElement("canvas");
      this.brushCanvas.width = 640;
      this.brushCanvas.height = 480;
    }
    get portrait() {
      return this.portraitValue;
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const rect = this.host.getBoundingClientRect(), ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3e6 / Math.max(1, rect.width * rect.height)));
      this.cssWidth = Math.max(1, rect.width);
      this.portraitValue = window.innerWidth <= 600 || rect.height / Math.max(1, rect.width) > 1.05;
      this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      this.resize();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      const load = async (file) => {
        const entry = cache2?.request(file, "high");
        if (entry) {
          await entry.promise;
          if (entry.state !== "ready")
            throw new Error("画作暂未能展开");
          return entry.image;
        }
        const image = new Image();
        image.src = file;
        await image.decode();
        return image;
      };
      try {
        if (!this.canvas.getContext("2d"))
          throw new Error("画面暂不支持绘制");
        const [scene, badge, actor, rapids] = await Promise.all([load(sceneFile(this.kind)), load(badgeFile(this.kind)), this.kind === "bends" ? load(MAP_WALK_FILE) : Promise.resolve(null), this.kind === "bends" ? load(sceneFile("river")) : Promise.resolve(null)]);
        if (this.disposed)
          return;
        this.images = { scene, badge, actor, rapids };
        this.contentState = "ready";
        if (this.state)
          this.paint(this.state);
      } catch {
        if (!this.disposed) {
          this.contentState = "error";
          if (this.state)
            this.paint(this.state);
        }
      }
    }
    input(input) {
      if (this.kind === "bends" && this.state && typeof input.x === "number" && typeof input.y === "number") {
        const viewport = this.canvas, l = layout(this.state, viewport);
        const world = roadFromStage(this.state, { x: input.x * l.width, y: input.y * l.height }, viewport);
        return { ...input, ...roadToStage(this.state, world) };
      }
      const height = this.portraitValue ? this.kind === "bends" ? 1040 : 1260 : 750, scale = Math.min(this.canvas.width / 1e3, this.canvas.height / height);
      const dx = (this.canvas.width - 1e3 * scale) / 2, dy = (this.canvas.height - height * scale) / 2;
      return { ...input, x: typeof input.x === "number" ? (input.x * this.canvas.width - dx) / scale : void 0, y: typeof input.y === "number" ? (input.y * this.canvas.height - dy) / scale : void 0 };
    }
    brushLayer(s) {
      const p = s.session;
      if (p.kind !== "waterfall")
        return this.brushCanvas;
      const points = p.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
      if (this.paintedStrokes === p.strokes.length && this.paintedPoints === points)
        return this.brushCanvas;
      this.paintedStrokes = p.strokes.length;
      this.paintedPoints = points;
      const ctx = this.brushCanvas.getContext("2d");
      if (!ctx)
        return this.brushCanvas;
      ctx.clearRect(0, 0, 640, 480);
      ctx.save();
      ctx.beginPath();
      for (const region of PAINT_REGIONS)
        polygon(ctx, region, { x: 0, y: 0, width: 640, height: 480 });
      ctx.clip();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const stroke of p.strokes) {
        const first = stroke.points[0];
        if (!first)
          continue;
        ctx.strokeStyle = PALETTE[stroke.color];
        ctx.fillStyle = PALETTE[stroke.color];
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 640 * 0.136;
        ctx.beginPath();
        ctx.moveTo(first.x * 640, first.y * 480);
        for (const point2 of stroke.points.slice(1))
          ctx.lineTo(point2.x * 640, point2.y * 480);
        if (stroke.points.length === 1) {
          ctx.arc(first.x * 640, first.y * 480, 640 * 0.068, 0, Math.PI * 2);
          ctx.fill();
        } else
          ctx.stroke();
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 640 * 0.153;
        ctx.stroke();
      }
      ctx.restore();
      return this.brushCanvas;
    }
    paintedScene(ctx, s, r) {
      if (!this.images)
        return;
      paintImage(ctx, this.images.scene, r);
      ctx.save();
      ctx.beginPath();
      for (const region of PAINT_REGIONS)
        polygon(ctx, region, r);
      ctx.clip();
      ctx.globalAlpha = 0.87;
      ctx.fillStyle = "#f4efdf";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.globalAlpha = 1;
      paintImage(ctx, this.brushLayer(s), r);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.85;
      paintImage(ctx, this.images.scene, r);
      ctx.restore();
    }
    river(ctx, s, wave = s.wave, image = this.images?.scene, r = riverImageRect(s.portrait)) {
      if (!image)
        return;
      paintImage(ctx, image, r);
      if (s.play.reduced)
        return;
      const opacity = ctx.globalAlpha;
      ctx.save();
      ctx.beginPath();
      polygon(ctx, [{ x: 0.06, y: 0.53 }, { x: 0.4, y: 0.47 }, { x: 0.5, y: 0.45 }, { x: 0.6, y: 0.46 }, { x: 0.8, y: 0.54 }, { x: 1, y: 0.55 }, { x: 1, y: 1 }, { x: 0.62, y: 1 }, { x: 0.45, y: 0.84 }, { x: 0.13, y: 0.74 }], r);
      polygon(ctx, [{ x: 0.427, y: 0.585 }, { x: 0.449, y: 0.498 }, { x: 0.489, y: 0.454 }, { x: 0.555, y: 0.477 }, { x: 0.623, y: 0.512 }, { x: 0.653, y: 0.565 }, { x: 0.735, y: 0.591 }, { x: 0.766, y: 0.675 }, { x: 0.736, y: 0.73 }, { x: 0.65, y: 0.74 }, { x: 0.54, y: 0.704 }, { x: 0.462, y: 0.663 }], r);
      ctx.clip("evenodd");
      ctx.globalAlpha = opacity * 0.34;
      for (let i = 0; i < 12; i++) {
        const y = 0.46 + i * 0.045, sy = y * image.naturalHeight, h = 0.045 * image.naturalHeight;
        const shift = Math.sin(wave * 1.8 - i * 0.6) * (1 + i * 0.13);
        ctx.drawImage(image, 0, sy, image.naturalWidth, Math.min(h, image.naturalHeight - sy), r.x + shift, r.y + y * r.height + Math.sin(wave * 1.3 - i) * 1.8, r.width, h / image.naturalHeight * r.height + 2);
      }
      ctx.globalAlpha = opacity * 0.42;
      ctx.strokeStyle = "#f5f5e4";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 30; i++) {
        const t = (wave * 0.12 + i * 0.137) % 1, x = 0.75 + Math.sin(i * 23.6) * 0.15 + t * 0.08, y = 0.55 + t * 0.44;
        ctx.beginPath();
        ctx.ellipse(r.x + x * r.width, r.y + y * r.height, 2 + t * 7, 0.7 + t, 0.3, 0.1, 2.7);
        ctx.stroke();
      }
      ctx.restore();
    }
    waterDrops(ctx, s) {
      if (s.play.reduced)
        return;
      ctx.save();
      ctx.strokeStyle = "#f4f5e8";
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 21; i++) {
        const t = (s.wave * 0.35 + i * 0.139) % 1;
        const x = 105 + t * 105 + Math.sin(i * 4.8) * (5 + t * 7), y = 25 + t * 470;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y + 5 + t * 7);
        ctx.stroke();
      }
      ctx.restore();
    }
    roadJourney(ctx, s, l) {
      if (!this.images || s.session.kind !== "bends")
        return;
      const phase = s.session.phase, walk = roadWalk(phase), drawn = phase.kind === "drawing" ? phase.progress : 1, unit = 1e3 / this.cssWidth;
      ctx.save();
      ctx.translate(l.scene.x, l.scene.y);
      ctx.scale(l.scene.width / 1e3, l.scene.height / 750);
      const stroke = (progress) => {
        ctx.beginPath();
        ctx.moveTo(ROAD_POINTS[0].x, ROAD_POINTS[0].y);
        for (const station of ROAD_STATIONS) {
          if (station.progress > progress)
            break;
          ctx.lineTo(station.point.x, station.point.y);
        }
        const tip = roadAt(progress);
        ctx.lineTo(tip.x, tip.y);
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (phase.kind === "drawing") {
        stroke(1);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#fcf7e7";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = "#557759";
        ctx.lineWidth = 3.2;
        ctx.setLineDash([8, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (drawn > 0) {
        stroke(drawn);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#f8f4e7";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#547159";
        ctx.lineWidth = 4.8;
        ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#ece6d4";
        for (let i = 2; i < ROAD_STATIONS.length; i += 3) {
          const at2 = ROAD_STATIONS[i];
          if (at2.progress > drawn)
            break;
          ctx.beginPath();
          ctx.ellipse(at2.point.x + Math.sin(i) * 1.5, at2.point.y, 1.2, 0.5, i, 0, 7);
          ctx.fill();
        }
      }
      if (phase.kind === "drawing") {
        const tip = phase.keyboard ? phase.cursor : roadAt(drawn);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#53715a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x + 12, tip.y - 17);
        ctx.lineTo(tip.x + 16, tip.y - 14);
        ctx.lineTo(tip.x + 3, tip.y + 1);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      if (phase.kind === "drawing") {
        for (const progress of [0.17, 0.52, 0.84]) {
          if (progress <= drawn)
            continue;
          const at2 = roadAt(progress), point2 = roadToStage(s, at2, this.canvas);
          ctx.save();
          ctx.translate(point2.x, point2.y);
          ctx.rotate(at2.heading);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(-5 * unit, -5 * unit);
          ctx.lineTo(2 * unit, 0);
          ctx.lineTo(-5 * unit, 5 * unit);
          ctx.strokeStyle = "#fff9e9";
          ctx.lineWidth = 5 * unit;
          ctx.stroke();
          ctx.strokeStyle = "#355d43";
          ctx.lineWidth = 2 * unit;
          ctx.stroke();
          ctx.restore();
        }
        const label = (text, progress, below) => {
          const at2 = roadToStage(s, roadAt(progress), this.canvas), gap = 12 * unit, height = 28 * unit;
          ctx.save();
          ctx.font = `600 ${13 * unit}px "PingFang SC",sans-serif`;
          const width = ctx.measureText(text).width + 20 * unit;
          const rect = { x: clamp3(at2.x - width / 2, 8 * unit, l.width - width - 8 * unit), y: below ? at2.y + gap : at2.y - gap - height, width, height };
          paper(ctx, rect, "#99ab8a", true);
          ctx.fillStyle = "#35573f";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, rect.x + width / 2, rect.y + height / 2);
          ctx.fillStyle = "#f9f5e5";
          ctx.strokeStyle = "#456c4e";
          ctx.lineWidth = 2 * unit;
          ctx.beginPath();
          ctx.arc(at2.x, at2.y, 5 * unit, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (below) {
            ctx.beginPath();
            ctx.arc(at2.x, at2.y, 2 * unit, 0, Math.PI * 2);
            ctx.fillStyle = "#456c4e";
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(at2.x, at2.y - 2 * unit);
            ctx.lineTo(at2.x, at2.y - 18 * unit);
            ctx.lineTo(at2.x + 10 * unit, at2.y - 15 * unit);
            ctx.lineTo(at2.x, at2.y - 10 * unit);
            ctx.stroke();
          }
          ctx.restore();
        };
        label(drawn > 0.01 ? "起点" : "起点 · 从这里画", 0, true);
        label("终点 · 山肩", 1, false);
      }
      const actor = this.images.actor, at = roadAt(walk);
      const moving = phase.kind === "walking" && roadWalkingProgress(phase.elapsed + 0.02) > walk + 1e-5;
      if (actor) {
        const frame2 = MAP_WALK_FRAMES[moving && !s.play.reduced ? Math.floor(walk * ROAD_LENGTH / 12) % 8 : 1], [sx, sy, w, h, fx, fy] = frame2;
        const scale = (60 - walk * 9) / h * l.scene.width / 1e3, facing = Math.cos(at.heading) < 0 ? -1 : 1;
        ctx.save();
        ctx.translate(l.scene.x + at.x * l.scene.width / 1e3, l.scene.y + at.y * l.scene.height / 750);
        if (phase.kind === "drawing")
          ctx.translate(-15, 5);
        ctx.fillStyle = "#38473b35";
        ctx.beginPath();
        ctx.ellipse(0, 1, 12, 3, 0, 0, 7);
        ctx.fill();
        ctx.rotate(clamp3(Math.sin(at.heading) * facing * 0.08, -0.06, 0.04));
        ctx.scale(scale * facing, scale);
        ctx.drawImage(actor, sx, sy, w, h, -fx, -fy, w, h);
        ctx.restore();
      }
      if (phase.kind === "river" && this.images.rapids) {
        const fade = clamp3(phase.elapsed / (s.play.reduced ? 0.3 : 1), 0, 1), cover = Math.max(1, l.height / 750);
        const zoom = s.play.reduced ? 1 : 1 + Math.min(phase.elapsed, 4.8) * 6e-3;
        const width = 1e3 * cover * zoom, height = 750 * cover * zoom;
        ctx.save();
        ctx.globalAlpha = fade * fade * (3 - 2 * fade);
        this.river(ctx, s, phase.elapsed * 1.35, this.images.rapids, { x: (1e3 - width) * 0.55, y: (l.height - height) * 0.5, width, height });
        ctx.restore();
      }
    }
    pairs(ctx, s) {
      if (!this.images || s.session.kind !== "inn")
        return;
      const p = s.session, l = layout(s);
      if (s.portrait) {
        ctx.save();
        ctx.fillStyle = "#e7e0ca";
        ctx.fillRect(0, 750, 1e3, 510);
        ctx.globalAlpha = 0.18;
        paintImage(ctx, this.images.scene, { x: 0, y: 750, width: 1e3, height: 750 });
        ctx.restore();
      }
      for (const [index, r] of l.cards.entries()) {
        const visible = p.open.includes(index) || p.matched.includes(index);
        paper(ctx, r, p.focus === index ? "#8e9b7b" : "#d4c9ad", true);
        ctx.save();
        paperPath(ctx, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 });
        ctx.clip();
        if (visible) {
          const crop = p.order[index] === 0 ? { x: 340, y: 235, width: 290, height: 260 } : { x: 8, y: 200, width: 240, height: 245 };
          imagePart(ctx, this.images.scene, crop, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 });
        } else {
          ctx.globalAlpha = 0.17;
          paintImage(ctx, this.images.scene, r);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "#9ca58a";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(r.x + r.width * 0.2, r.y + r.height * 0.65);
          ctx.lineTo(r.x + r.width * 0.44, r.y + r.height * 0.3);
          ctx.lineTo(r.x + r.width * 0.62, r.y + r.height * 0.54);
          ctx.lineTo(r.x + r.width * 0.76, r.y + r.height * 0.36);
          ctx.stroke();
        }
        if (p.matched.includes(index)) {
          ctx.fillStyle = "#f3ebba17";
          ctx.fillRect(r.x, r.y, r.width, r.height);
        }
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = p.matched.length / 4 * 0.12;
      ctx.fillStyle = "#203957";
      ctx.fillRect(0, 0, 1e3, 510);
      ctx.restore();
    }
    painting(ctx, s) {
      if (s.session.kind !== "waterfall")
        return;
      const l = layout(s), p = s.session;
      this.waterDrops(ctx, s);
      if (s.portrait) {
        ctx.fillStyle = "#e8e6d7";
        ctx.fillRect(0, 750, 1e3, 510);
      }
      paper(ctx, l.sketch, "#d3c6a8", true);
      this.paintedScene(ctx, s, l.sketchImage);
      ctx.save();
      ctx.strokeStyle = "#71806b";
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      const filled = coverage(s);
      PAINT_REGIONS.forEach((region, i) => {
        if (filled[i] >= 0.62)
          return;
        ctx.beginPath();
        polygon(ctx, region, l.sketchImage);
        ctx.stroke();
      });
      ctx.restore();
      for (const [i, at] of l.swatches.entries()) {
        ctx.save();
        ctx.translate(at.x, at.y);
        ctx.beginPath();
        for (let n = 0; n <= 30; n++) {
          const a = n / 30 * Math.PI * 2, r = 24 + Math.sin(n * 2.3) * 2;
          if (!n)
            ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.fillStyle = PALETTE[i];
        ctx.fill();
        if (p.color === i) {
          ctx.strokeStyle = "#fef9e4";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }
      if (p.keyboard) {
        ctx.save();
        ctx.strokeStyle = "#516d59";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(l.sketchImage.x + p.brush.x * l.sketchImage.width, l.sketchImage.y + p.brush.y * l.sketchImage.height, 12, 0, 7);
        ctx.stroke();
        ctx.restore();
      }
    }
    paint(s) {
      this.state = s;
      if (this.disposed)
        return;
      const ctx = this.canvas.getContext("2d");
      if (!ctx)
        return;
      const l = layout(s, s.kind === "bends" ? this.canvas : void 0), scale = Math.min(this.canvas.width / l.width, this.canvas.height / l.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#ede9da";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(scale, 0, 0, scale, (this.canvas.width - l.width * scale) / 2, (this.canvas.height - l.height * scale) / 2);
      if (this.contentState !== "ready" || !this.images) {
        ink2(ctx, this.contentState === "error" ? "画作暂未展开，可以重试或继续走。" : "山与江正在展开……", { x: 500, y: l.height / 2 }, 24);
        return;
      }
      if (s.kind === "river") {
        this.river(ctx, s, s.session.kind === "river" && s.session.shot ? s.session.shot.wave : s.wave);
        const center = s.session.kind === "river" && s.session.shot ? s.session.shot.center : frameCenter(s);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, 1e3, l.height);
        ctx.arc(center.x, center.y, l.radius, 0, 7, true);
        ctx.fillStyle = "#233a3455";
        ctx.fill("evenodd");
        ctx.beginPath();
        ctx.arc(center.x, center.y, l.radius, 0, 7);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = frameFits(s) ? "#f2e2a5" : "#f3edd8";
        ctx.stroke();
        ctx.restore();
      } else {
        paintImage(ctx, this.images.scene, l.scene);
        if (s.kind === "bends")
          this.roadJourney(ctx, s, l);
        if (s.kind === "inn")
          this.pairs(ctx, s);
        if (s.kind === "waterfall")
          this.painting(ctx, s);
      }
      if (s.flow.kind === "complete") {
        const q = clamp3((s.age - (s.play.completedAt ?? s.age)) / (s.play.reduced ? 0.2 : 1), 0, 1), size = Math.min(510, l.height * 0.62), x = (1e3 - size) / 2, y = (l.height - size) / 2;
        ctx.save();
        ctx.fillStyle = `rgba(34,53,44,${q * 0.42})`;
        ctx.fillRect(0, 0, 1e3, l.height);
        ctx.globalAlpha = q;
        const capture = this.captureImage;
        if (capture?.complete && capture.naturalWidth)
          ctx.drawImage(capture, x, y, size, size);
        ctx.restore();
      }
    }
    captureImage = null;
    capture(s) {
      if (!this.images || this.disposed)
        return null;
      const canvas = this.doc.createElement("canvas");
      canvas.width = canvas.height = 576;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        return null;
      ctx.drawImage(this.images.badge, 0, 0, 576, 576);
      if (s.session.kind === "waterfall") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(288, 288, 249, 0, 7);
        ctx.clip();
        this.paintedScene(ctx, s, { x: -88, y: -6, width: 752, height: 564 });
        ctx.restore();
      } else if (s.session.kind === "river" && s.session.shot) {
        const l = layout(s), at = s.session.shot.center;
        ctx.save();
        ctx.beginPath();
        ctx.arc(288, 288, 249, 0, 7);
        ctx.clip();
        ctx.translate(288, 288);
        ctx.scale(249 / l.radius, 249 / l.radius);
        ctx.translate(-at.x, -at.y);
        this.river(ctx, s, s.session.shot.wave);
        ctx.restore();
      }
      try {
        for (const quality of [0.88, 0.78, 0.65]) {
          const url = canvas.toDataURL("image/webp", quality);
          if (url.startsWith("data:image/webp;base64,") && url.length < 4e5) {
            this.captureImage = new Image();
            this.captureImage.src = url;
            return url;
          }
        }
      } catch {
        return null;
      }
      return null;
    }
    reset() {
      this.paintedStrokes = this.paintedPoints = -1;
      this.captureImage = null;
    }
    dispose() {
      this.disposed = true;
      this.observer?.disconnect();
      this.observer = null;
      this.canvas.remove();
      this.images = null;
      this.state = null;
      this.captureImage = null;
      this.canvas.width = this.canvas.height = this.brushCanvas.width = this.brushCanvas.height = 1;
    }
  };
  function viewOf(refs) {
    if (!(refs instanceof MemoryView))
      throw new Error("虎跳峡互动画面不匹配");
    return refs;
  }

  // .build/typescript/runtime/tiger-memories/adapter.js
  function createTigerMemoryGames(dom2, onAction) {
    const { get: $2, text } = dom2, bindings = new EventBindings();
    let active = null;
    const captureButton = dom2.document.createElement("button");
    captureButton.type = "button";
    captureButton.textContent = "重试留下这幅画";
    captureButton.hidden = true;
    $2("tiger-actions").append(captureButton);
    bindings.listen(captureButton, "click", () => onAction("retry-capture"));
    bindings.listen($2("micro-surface"), "blur", () => {
      if (active && !active.disposed)
        onAction("cancel-brush");
    });
    const adapter = {
      create(entry, options) {
        if (!memoryId(entry.id))
          throw new Error("虎跳峡互动没有对应的画作");
        active?.reset();
        return createMemory(entry.id, options.reduced);
      },
      act: (s, input) => actMemory(stateOf(s), input),
      move: (s, input) => moveMemory(stateOf(s), input),
      release: (s) => releaseMemory(stateOf(s)),
      tick(state, dt) {
        let s = tickMemory(stateOf(state), dt);
        s.portrait = s.session.kind === "river" && s.session.shot ? s.session.shot.portrait : active?.portrait ?? s.portrait;
        if (s.flow.kind === "capturing" && active?.contentState === "ready")
          s = attachMemoryCapture(s, active.capture(s));
        return s;
      },
      draw(_svg, _parent, entry) {
        if (!memoryId(entry.id))
          throw new Error("虎跳峡画作不存在");
        return new MemoryView(MEMORY_SPECS[entry.id].kind, dom2.document);
      },
      paint(refs, state) {
        const view = viewOf(refs), s = stateOf(state);
        active = view;
        s.portrait = s.session.kind === "river" && s.session.shot ? s.session.shot.portrait : view.portrait;
        view.paint(s);
      },
      instruction: (entry) => memoryId(entry.id) ? MEMORY_SPECS[entry.id].prompt : "",
      status: (s) => stateOf(s).feedback,
      outcome(state, entry) {
        const s = stateOf(state);
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.flow.kind === "complete", interaction: s.gesture, memory: MEMORY_SPECS[s.id].memory, title: MEMORY_SPECS[s.id].badge, ...s.flow.kind === "complete" && (s.kind === "waterfall" || s.kind === "river") ? { captureArt: s.flow.art, artSource: "capture" } : {} };
      },
      assets: (entry) => ({ scene: memoryId(entry.id) ? sceneFile(MEMORY_SPECS[entry.id].kind) : void 0 }),
      mount: (refs, context) => viewOf(refs).mount(context.host, context.cache),
      dispose(refs) {
        viewOf(refs).dispose();
        active = null;
        $2("micro-panel").removeAttribute("data-memory");
        $2("micro-panel").removeAttribute("data-memory-acted");
        $2("micro-panel").removeAttribute("data-road-phase");
        captureButton.hidden = true;
      },
      point: (refs, input) => viewOf(refs).input(input),
      key: (s, key, phase) => keyMemory(stateOf(s), key, phase),
      present(state, refs) {
        const s = stateOf(state), view = viewOf(refs), spec = MEMORY_SPECS[s.id];
        const panel = $2("micro-panel");
        panel.dataset.memory = s.kind;
        panel.dataset.memoryActed = String(s.acted);
        panel.dataset.phase = s.play.complete ? "memory" : s.acted ? "play" : "invite";
        text("micro-title", spec.title);
        text("micro-instruction", view.contentState === "ready" ? spec.prompt : view.contentState === "error" ? "画作暂未展开，可以重试或继续走。" : "手绘正在展开……");
        text("micro-result", s.feedback);
        text("micro-skip", "继续旅程 →");
        if (s.session.kind === "bends") {
          panel.dataset.roadPhase = s.session.phase.kind;
          if (s.session.phase.kind === "drawing" && !s.acted && view.contentState === "ready")
            text("micro-result", "画一个 S 弯，再看看山下的江。");
          else if (s.session.phase.kind !== "drawing" && view.contentState === "ready")
            text("micro-instruction", "");
        }
        $2("micro-surface").setAttribute("aria-label", spec.prompt + " " + spec.keys + (s.kind === "bends" ? "" : " R 重试。"));
        $2("micro-surface").setAttribute("aria-busy", String(view.contentState === "loading"));
        $2("tiger-tools").hidden = s.flow.kind !== "capture-error";
        $2("tiger-trail-lens").hidden = true;
        $2("tiger-frame-strip").hidden = true;
        captureButton.hidden = s.flow.kind !== "capture-error";
      }
    };
    return { adapter, destroy() {
      bindings.destroy();
      captureButton.remove();
    } };
  }

  // .build/typescript/wugong-walk/art-page.js
  var dom = createDom(document);
  var { get: $ } = dom;
  var query = new URLSearchParams(location.search);
  var id = query.get("entry");
  var routeId = document.body.dataset.route === "tiger" ? "tiger" : "wugong";
  var mapPage = routeId === "tiger" ? "tiger-walk.html" : "wugong-walk.html";
  var allowed = new Set(routeId === "tiger" ? [...Object.keys(TRAIL_GAMES), ...MEMORY_IDS] : ["meadow-bird", "meadow-butterfly", "meadow-flower", "wugong-wind-hiker"]);
  var places = new Set(routeId === "tiger" ? ["虎跳峡 · 二十八道拐", "虎跳峡 · 中虎跳江边", "虎跳峡 · 中途客栈", "虎跳峡 · 龙洞瀑布"] : ["武功山 · 山脊草甸", "武功山 · 观音宕草甸", "武功山 · 吊马桩", "武功山 · 吊马桩山脊", "武功山 · 金顶古祭坛"]);
  var requestedPlace = query.get("place");
  var place = requestedPlace && places.has(requestedPlace) ? requestedPlace : null;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var disposed = false;
  var closing = false;
  var animation = 0;
  var lastTime = 0;
  var collected = 0;
  var pending = null;
  var storage = null;
  try {
    storage = localStorage;
  } catch {
  }
  var catalog = window.TrailDiscoveries;
  var games = window.TrailMiniGames;
  var scenes = createSceneManager({ status: () => "paused", pause() {
  }, resume() {
  }, hidden: () => document.hidden });
  var cache = window.TrailImageCache.create(Image);
  var routes = [{ id: "wugong", name: "武功山" }, { id: "tiger", name: "虎跳峡" }, { id: "aotai", name: "鳌太线" }, { id: "maclehose", name: "麦理浩径" }, { id: "changping", name: "长坪沟" }, { id: "mogan", name: "莫干山" }, { id: "westlake", name: "九溪 · 西湖" }];
  function returnToMap() {
    if (disposed)
      return;
    if (window.parent !== window)
      window.parent.postMessage({ type: "trailbound-wugong-art-close", collected }, location.origin);
    else
      location.href = mapPage;
  }
  function stopLoop() {
    cancelAnimationFrame(animation);
    animation = 0;
    lastTime = 0;
  }
  function ensureLoop() {
    if (!disposed && !document.hidden && !animation)
      animation = requestAnimationFrame(frame);
  }
  function audioScene() {
    const current = mini.state, phase = current instanceof MemoryState && current.session.kind === "bends" ? current.session.phase : null;
    return { routeId, mode: reward.open ? "reward" : mini.active ? "moment" : "silent", momentId: current?.id ?? pending?.id, momentGame: phase?.kind === "river" ? "tiger-river" : current?.game ?? null, ...phase ? { gorgeOpenness: roadWalk(phase), riverApproach: phase.kind === "river" ? Math.min(1, phase.elapsed) : 0 } : {} };
  }
  function refresh() {
    if (disposed)
      return;
    audio.setScene(audioScene());
    if (closing && !mini.active && !reward.open) {
      pending = null;
      returnToMap();
      return;
    }
    ensureLoop();
  }
  var audio = window.TrailAudio.create({ AudioContext, navigator, fetch: fetch.bind(window), timers: window, createMusic: createMusicLayer, onError() {
    $("mini-sound").textContent = "声音未能开启，再试一次";
  }, onStateChange() {
  } });
  var reward = createRewardController({
    dom,
    scenes,
    catalog,
    cache,
    audio,
    reduced,
    autoCollect: true,
    presentArt: roundJournalArt,
    gameKind: (entryId) => routeId === "tiger" ? memoryId(entryId) ? MEMORY_SPECS[entryId].game : TRAIL_GAMES[entryId] : games.kinds[entryId],
    refresh,
    stopLoop,
    onCollected(moment) {
      const saved = storeEarnedMoment(catalog, window.TrailJournal, storage, moment);
      if (saved.kind === "error") {
        $("reward-copy").textContent = saved.message;
        return false;
      }
      journal.reload();
      $("reward-copy").textContent = "已收进手帐";
      collected++;
      pending = null;
      if (window.parent !== window)
        window.parent.postMessage({ type: "trailbound-wugong-art-collected", collected }, location.origin);
      return true;
    }
  });
  var journal = createJournalController({
    dom,
    scenes,
    catalog,
    data: window.TrailJournal,
    routes,
    weather: { clear: { name: "晴" }, cloud: { name: "多云" }, mist: { name: "薄雾" }, drizzle: { name: "小雨" } },
    storage,
    reduced,
    presentArt: roundJournalArt,
    tripCount: () => collected,
    rewardOpen: () => reward.open,
    pauseInteraction: () => mini.pause(),
    stopLoop,
    refresh,
    onRemember() {
    },
    evidence: (entryId) => window.TrailRouteMoments.evidence(entryId),
    observation: () => null,
    source: () => null
  });
  var mini = createMiniGameController({
    dom,
    scenes,
    api: games.enhance(window.TrailMicroMoments),
    platform: games,
    pixi: window.PIXI,
    catalog,
    cache,
    audio,
    reduced,
    svg(tag, attributes, parent) {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [name, value] of Object.entries(attributes))
        node.setAttribute(name, String(value));
      parent?.appendChild(node);
      return node;
    },
    sound: () => audio.enabled,
    async toggleSound() {
      if (audio.enabled)
        audio.disable();
      else
        await audio.enable(audioScene());
      refresh();
    },
    stopLoop,
    ensureLoop,
    refresh,
    onFinished(finished) {
      const outcome = finished.outcome, entry = finished.entry;
      if (!allowed.has(entry.id) || outcome.id !== entry.id || outcome.edition !== 3 || !outcome.earned)
        return false;
      const captureArt = outcome.captureArt ? catalog.safeCaptureArt(outcome.captureArt) : null;
      if (outcome.captureArt && !captureArt)
        return false;
      const now = Date.now();
      pending = {
        key: `${now}-${routeId}-${entry.id}`,
        id: entry.id,
        route: routeId,
        edition: 3,
        earned: true,
        title: outcome.title,
        memory: outcome.memory,
        icon: entry.icon,
        tag: entry.tag,
        place: place ?? entry.place,
        ...entry.artV5 ? { artVersion: 5 } : entry.artV4 ? { artVersion: 4 } : {},
        createdAt: now,
        ...captureArt ? { captureArt, artSource: outcome.artSource } : {}
      };
      return reward.show(pending, "paused");
    },
    onClosed() {
      closing = true;
    }
  });
  var tigerGames = routeId === "tiger" ? createTigerTrailGames({ dom, riverArrived: true, onAction: (name, value) => mini.action(name, value) }) : null;
  if (tigerGames)
    mini.registerGame(Object.keys(TRAIL_GAMES), tigerGames.adapter);
  var tigerMemories = routeId === "tiger" ? createTigerMemoryGames(dom, (name) => mini.action(name)) : null;
  if (tigerMemories)
    mini.registerGame(MEMORY_IDS, tigerMemories.adapter);
  var lastRoadSound = 0;
  function frame(now) {
    animation = 0;
    if (disposed || document.hidden)
      return;
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1e3) : 0;
    lastTime = now;
    mini.update(dt);
    if (mini.state instanceof MemoryState && mini.state.session.kind === "bends" && now - lastRoadSound > 180) {
      audio.setScene(audioScene());
      lastRoadSound = now;
    }
    if (mini.active)
      ensureLoop();
  }
  function destroy() {
    if (disposed)
      return;
    disposed = true;
    stopLoop();
    mini.destroy();
    tigerGames?.destroy();
    tigerMemories?.destroy();
    reward.destroy();
    journal.destroy();
    audio.destroy();
  }
  $("walk-toggle").addEventListener("click", () => {
    destroy();
    if (window.parent !== window)
      window.parent.postMessage({ type: "trailbound-wugong-art-close", collected }, location.origin);
    else
      location.href = mapPage;
  });
  window.addEventListener("message", (event) => {
    if (event.source === window.parent && event.origin === location.origin && event.data?.type === "trailbound-wugong-art-dispose")
      destroy();
  });
  window.addEventListener("keydown", (event) => {
    if (reward.handleKey(event))
      return;
    if (event.key === "Escape" && !journal.open) {
      event.preventDefault();
      $("walk-toggle").click();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      mini.pause();
      audio.hide();
      scenes.suspend();
    } else {
      scenes.foreground();
      ensureLoop();
    }
  });
  window.addEventListener("pagehide", destroy);
  window.addEventListener("storage", (event) => {
    if (event.storageArea === storage)
      journal.reload();
  });
  journal.render();
  if (id && allowed.has(id)) {
    $("art-journal-wall").hidden = true;
    const original = catalog.item(id);
    mini.begin(place ? { ...original, place, memory: original.memory.replace(original.place, place) } : original, "paused");
  } else
    $("art-page-title").textContent = "旅行手帐";
  window.parent.postMessage({ type: "trailbound-wugong-art-ready" }, location.origin);
})();
