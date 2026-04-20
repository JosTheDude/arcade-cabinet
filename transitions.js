(() => {
  const root = document.documentElement;
  const body = document.body;
  const heroEmail = document.getElementById("hero-email");
  const modalEmail = document.getElementById("modal-email");
  const openRegisterModalButton = document.getElementById("open-register-modal");
  const registerModalTriggers = Array.from(document.querySelectorAll("[data-open-register-modal], #open-register-modal"));
  const closeRegisterModalButton = document.getElementById("close-register-modal");
  const registerModal = document.getElementById("register-modal");
  const signupPairs = [
    {
      button: document.getElementById("signup-button"),
      tooltip: document.getElementById("signup-tooltip")
    },
    {
      button: document.getElementById("modal-signup-button"),
      tooltip: document.getElementById("modal-signup-tooltip")
    }
  ].filter(({ button, tooltip }) => button && tooltip);
  const pressableSelector = [
    ".page-select a",
    ".page-select-register",
    ".pixel-button",
    ".sticker",
    ".register-modal-close",
    ".faq-item summary",
    ".footer-links a",
    ".joystick",
    ".button",
    ".screen"
  ].join(", ");
  const tooltipTimers = new WeakMap();
  const modalTransitionMs = 320;

  let lastModalTrigger = null;
  let modalCloseTimer = 0;
  let isNavigating = false;

  const motionItems = [];

  [
    ".page-select",
    ".hero-copy > *",
    ".cabinet-wrap",
    ".guides-copy > *",
    "main > *",
    ".site-footer"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (motionItems.includes(element)) {
        return;
      }

      motionItems.push(element);
    });
  });

  motionItems.forEach((element, index) => {
    element.classList.add("motion-item");
    element.style.setProperty("--motion-index", String(index));
  });

  root.classList.add("motion-enabled");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("is-entering");
      root.classList.add("page-ready");
    });
  });

  const setSignupTooltip = (button, tooltip, visible) => {
    const existingTimer = tooltipTimers.get(tooltip);

    if (existingTimer) {
      window.clearTimeout(existingTimer);
      tooltipTimers.delete(tooltip);
    }

    if (visible) {
      tooltip.hidden = false;
      requestAnimationFrame(() => {
        tooltip.classList.add("is-open");
      });
    } else {
      if (tooltip.hidden) {
        button.setAttribute("aria-expanded", "false");
        return;
      }

      tooltip.classList.remove("is-open");

      const hideTimer = window.setTimeout(() => {
        tooltip.hidden = true;
        tooltipTimers.delete(tooltip);
      }, 200);

      tooltipTimers.set(tooltip, hideTimer);
    }

    button.setAttribute("aria-expanded", String(visible));
  };

  const closeAllSignupTooltips = () => {
    signupPairs.forEach(({ button, tooltip }) => {
      setSignupTooltip(button, tooltip, false);
    });
  };

  const syncEmailInputs = (value, source) => {
    [heroEmail, modalEmail].forEach((input) => {
      if (!input || input === source) {
        return;
      }

      input.value = value;
    });
  };

  const setModalOpen = (visible) => {
    if (!registerModal || registerModalTriggers.length === 0) {
      return;
    }

    if (visible) {
      closeAllSignupTooltips();
    }

    window.clearTimeout(modalCloseTimer);

    registerModalTriggers.forEach((trigger) => {
      if (!trigger.hasAttribute("aria-expanded")) {
        return;
      }

      trigger.setAttribute("aria-expanded", String(visible));
    });

    if (visible) {
      lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : openRegisterModalButton;
      registerModal.hidden = false;
      registerModal.classList.remove("is-closing");

      requestAnimationFrame(() => {
        registerModal.classList.add("is-open");
      });

      body.classList.add("modal-open");

      window.setTimeout(() => {
        (modalEmail || closeRegisterModalButton || openRegisterModalButton).focus();
      }, 40);

      return;
    }

    closeAllSignupTooltips();

    body.classList.remove("modal-open");
    registerModal.classList.remove("is-open");
    registerModal.classList.add("is-closing");

    modalCloseTimer = window.setTimeout(() => {
      registerModal.hidden = true;
      registerModal.classList.remove("is-closing");

      if (lastModalTrigger) {
        lastModalTrigger.focus();
      }
    }, modalTransitionMs);
  };

  const isInternalPageLink = (anchor) => {
    if (!anchor) {
      return false;
    }

    if (anchor.target && anchor.target !== "_self") {
      return false;
    }

    if (anchor.hasAttribute("download")) {
      return false;
    }
    const href = anchor.getAttribute("href");

    if (!href || href.startsWith("#")) {
      return false;
    }

    const url = new URL(anchor.href, window.location.href);

    if (url.origin !== window.location.origin) {
      return false;
    }

    return url.pathname.endsWith("index.html")
      || url.pathname.endsWith("guides.html")
      || url.pathname === window.location.pathname;
  };

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;

    if (!isInternalPageLink(anchor)) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const nextUrl = new URL(anchor.href, window.location.href);

    if (nextUrl.href === window.location.href || isNavigating) {
      return;
    }

    event.preventDefault();
    isNavigating = true;
    sessionStorage.setItem("arcade-transition", "1");
    root.classList.remove("page-ready");
    body.classList.add("is-leaving");

    window.setTimeout(() => {
      window.location.href = nextUrl.href;
    }, 420);
  });

  const appendPressPulse = (target, clientX, clientY) => {
    const rect = target.getBoundingClientRect();
    const pulse = document.createElement("span");
    pulse.className = "press-pulse";
    pulse.style.setProperty("--press-x", `${clientX - rect.left}px`);
    pulse.style.setProperty("--press-y", `${clientY - rect.top}px`);
    target.append(pulse);
    pulse.addEventListener("animationend", () => {
      pulse.remove();
    }, { once: true });
  };

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target.closest(pressableSelector) : null;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.classList.add("is-pressed");
    appendPressPulse(target, event.clientX, event.clientY);

    window.setTimeout(() => {
      target.classList.remove("is-pressed");
    }, 180);
  });

  document.addEventListener("click", (event) => {
    if (event.detail !== 0) {
      return;
    }

    const target = event.target instanceof Element ? event.target.closest(pressableSelector) : null;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rect = target.getBoundingClientRect();
    appendPressPulse(target, rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  [heroEmail, modalEmail].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      syncEmailInputs(input.value, input);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const signupButton = input.closest(".hero-signup")?.querySelector(".signup-button");

      if (!signupButton) {
        return;
      }

      event.preventDefault();
      signupButton.click();
    });
  });

  signupPairs.forEach(({ button, tooltip }) => {
    button.addEventListener("click", () => {
      const shouldShow = tooltip.hidden;
      closeAllSignupTooltips();
      setSignupTooltip(button, tooltip, shouldShow);
    });
  });

  registerModalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setModalOpen(true);
    });
  });

  if (closeRegisterModalButton) {
    closeRegisterModalButton.addEventListener("click", () => {
      setModalOpen(false);
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".signup-button-wrap")) {
      return;
    }

    if (target.closest("[data-open-register-modal], #open-register-modal")) {
      return;
    }

    if (target.closest("[data-modal-close]")) {
      setModalOpen(false);
      return;
    }

    if (registerModal && !registerModal.hidden && !target.closest(".register-modal-card")) {
      setModalOpen(false);
      return;
    }

    closeAllSignupTooltips();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const hasOpenTooltip = signupPairs.some(({ tooltip }) => !tooltip.hidden);

    if (hasOpenTooltip) {
      closeAllSignupTooltips();
      return;
    }

    if (registerModal && !registerModal.hidden) {
      setModalOpen(false);
    }
  });
})();
