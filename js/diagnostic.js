// ---------- 品牌定位診斷小工具 ----------
(function () {
  const card = document.getElementById("diagCard");
  if (!card) return;

  const stage = document.getElementById("diagStage");
  const screens = stage.querySelectorAll(".diag-screen");
  const needle = document.getElementById("diagNeedle");
  const gauge = document.getElementById("diagGauge");
  const report = document.getElementById("diagReport");
  const restartBtn = document.getElementById("diagRestart");
  const gaugeLabels = card.querySelectorAll(".diag-gauge-labels span");
  const gaugeSegs = gauge.querySelectorAll(".diag-gauge-seg");

  const ZONE_ANGLE = { positioning: 150, memory: 90, channel: 30 };
  const NEUTRAL_ANGLE = 90;

  const REASON_CONTENT = {
    positioning: {
      label: "定位不夠鮮明",
      insight: "你還沒把「只講給誰聽」說清楚,所以每個人都能路過,卻沒有人覺得那是在講他自己。",
      strategies: [
        "縮小到具體人物側寫——用具體的人物側寫取代模糊的「所有人」,越具體越容易被目標受眾一眼認出",
        "找出唯一的核心差異——列出競品都在做的事,找到自己獨有、競品沒有的一點,只留一個當主打",
        "用「不做什麼」定義品牌——明確說出不做什麼,讓「做什麼」更清楚",
      ],
    },
    memory: {
      label: "記憶點不夠",
      insight: "受眾看完會覺得好看,但闔上手機那刻,記住的是畫面,不是「你」。",
      strategies: [
        "建立單一、可辨識的品牌敘事——聚焦一個具體的生活情境,讓品牌訊息有清楚輪廓",
        "內容從賣產品轉為說故事——增加創作過程與選品邏輯,讓受眾看到「人」而非「貨」",
        "精準而非廣泛的初期曝光——鎖定調性重疊的小眾社群,建立核心受眾再擴大",
      ],
    },
    channel: {
      label: "觸及管道不對",
      insight: "內容其實沒問題,只是還沒被放到會對它心動的人面前。",
      strategies: [
        "從KOC而非KOL開始——找小型、受眾高度重疊的創作者,信任轉移效果更好、成本更低",
        "內容格式對應平台習慣——檢查內容格式是否符合平台原生習慣",
        "善用受眾已經在的社群——先去目標受眾聚集的地方被看見,再導回自己的陣地",
      ],
    },
  };

  const BG_FRAGMENTS = {
    q1: {
      A: "你講得出品牌的具體畫面和目標客群",
      B: "品牌的一句話介紹還偏籠統",
    },
    q2: {
      A: "受眾記得住你的品牌特色",
      B: "受眾多半只記得產品好看,說不出品牌特色",
    },
    q3: {
      A: "內容的觸及量原本就偏低",
      B: "內容有人看到,但沒什麼共鳴或互動",
    },
  };

  const answers = { 1: null, 2: null, 3: null };

  function currentScores() {
    return {
      positioning: answers[1] === "B" ? 1 : 0,
      memory: answers[2] === "B" ? 1 : 0,
      channel: answers[3] === "A" ? 1 : 0,
    };
  }

  function angleFromScores(scores) {
    const entries = Object.entries(scores).filter(([, v]) => v > 0);
    if (entries.length === 0) return NEUTRAL_ANGLE;
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    const weighted = entries.reduce((sum, [zone, v]) => sum + v * ZONE_ANGLE[zone], 0);
    return weighted / total;
  }

  function setNeedle(angle, isFinal) {
    const rotation = 90 - angle;
    needle.setAttribute("transform", `rotate(${rotation} 150 150)`);
    needle.classList.toggle("is-set", !!isFinal);
  }

  function updateGaugeLabels(scores, isFinal) {
    gaugeLabels.forEach((el) => {
      const zone = el.getAttribute("data-zone");
      el.classList.toggle("is-lit", isFinal && scores[zone] > 0);
    });
    gaugeSegs.forEach((el) => {
      const zone = el.getAttribute("data-zone");
      el.classList.toggle("is-lit", isFinal && scores[zone] > 0);
    });
  }

  function showScreen(step) {
    const next = stage.querySelector(`.diag-screen[data-step="${step}"]`);
    const current = stage.querySelector(".diag-screen.is-active");
    if (current === next) return;

    if (current) {
      current.classList.add("is-leaving");
      current.classList.remove("is-active");
      setTimeout(() => {
        current.classList.remove("is-leaving");
        current.style.display = "none";
      }, 260);
    }

    next.style.display = "block";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => next.classList.add("is-active"));
    });
  }

  function buildBackground() {
    const parts = [
      BG_FRAGMENTS.q1[answers[1]],
      BG_FRAGMENTS.q2[answers[2]],
      BG_FRAGMENTS.q3[answers[3]],
    ];
    let note = "";
    if (answers[3] === "B" && (answers[1] === "B" || answers[2] === "B")) {
      note = "有互動但沒共鳴,通常不是管道找錯了,而是前面的定位或記憶點問題,在這裡又被印證了一次。";
    }
    return `<p class="diag-report-bg">根據你的回答:${parts.join("、")}。${note ? note : ""}</p>`;
  }

  function buildReasonBlocks(scores) {
    const activeZones = Object.entries(scores)
      .filter(([, v]) => v > 0)
      .map(([zone]) => zone);

    if (activeZones.length === 0) {
      return `
        <span class="diag-healthy-tag">體質穩健</span>
        <p class="diag-insight">定位夠鮮明,記憶點也站得住,現在還沒被看見,單純是時間和曝光量還沒累積到位。</p>
        <p class="diag-strategy-label">建議</p>
        <ul class="diag-strategy-list">
          <li><span class="diag-strategy-num">01</span><span>維持現在的內容節奏,把力氣放在擴大曝光,而不是重新調整定位或內容方向</span></li>
          <li><span class="diag-strategy-num">02</span><span>觀察最近期哪一篇貼文互動最好,找出可以複製的元素,重複驗證</span></li>
          <li><span class="diag-strategy-num">03</span><span>若想確認基本功是否真的到位,歡迎找我做更完整的品牌健檢</span></li>
        </ul>`;
    }

    return activeZones
      .map((zone) => {
        const r = REASON_CONTENT[zone];
        return `
          <div class="diag-reason-block">
            <span class="diag-reason-tag">${r.label}</span>
            <p class="diag-insight">${r.insight}</p>
            <p class="diag-strategy-label">建議</p>
            <ul class="diag-strategy-list">
              ${r.strategies
                .map(
                  (s, i) =>
                    `<li><span class="diag-strategy-num">${String(i + 1).padStart(2, "0")}</span><span>${s}</span></li>`
                )
                .join("")}
            </ul>
          </div>`;
      })
      .join("");
  }

  function finish() {
    const scores = currentScores();
    const finalAngle = angleFromScores(scores);
    setNeedle(finalAngle, true);
    updateGaugeLabels(scores, true);

    report.innerHTML = buildBackground() + buildReasonBlocks(scores);
    showScreen("result");
  }

  card.querySelectorAll(".diag-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = Number(btn.getAttribute("data-q"));
      const value = btn.getAttribute("data-value");
      answers[q] = value;

      const scores = currentScores();
      setNeedle(angleFromScores(scores), false);
      updateGaugeLabels(scores, false);

      if (q < 3) {
        showScreen(q + 1);
      } else {
        setTimeout(finish, 500);
      }
    });
  });

  restartBtn.addEventListener("click", () => {
    answers[1] = null;
    answers[2] = null;
    answers[3] = null;
    setNeedle(NEUTRAL_ANGLE, false);
    updateGaugeLabels({ positioning: 0, memory: 0, channel: 0 }, false);
    showScreen(1);
  });

  // init
  screens.forEach((s) => {
    if (s.getAttribute("data-step") !== "1") s.style.display = "none";
  });
  requestAnimationFrame(() => {
    screens[0].classList.add("is-active");
  });
  setNeedle(NEUTRAL_ANGLE, false);
})();
