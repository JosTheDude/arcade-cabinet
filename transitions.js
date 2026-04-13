(() => {
  const root = document.documentElement;
  const body = document.body;

  requestAnimationFrame(() => {
    root.classList.remove("is-entering");
    root.classList.add("page-ready");
  });

  const signupButton = document.getElementById("signup-button");
  const signupTooltip = document.getElementById("signup-tooltip");

  const setSignupTooltip = (visible) => {
    if (!signupButton || !signupTooltip) {
      return;
    }

    signupTooltip.hidden = !visible;
    signupButton.setAttribute("aria-expanded", String(visible));
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
    const anchor = event.target.closest("a");

    if (!isInternalPageLink(anchor)) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const nextUrl = new URL(anchor.href, window.location.href);

    if (nextUrl.href === window.location.href) {
      return;
    }

    event.preventDefault();
    sessionStorage.setItem("arcade-transition", "1");
    body.classList.add("is-leaving");

    window.setTimeout(() => {
      window.location.href = nextUrl.href;
    }, 360);
  });

  if (signupButton && signupTooltip) {
    signupButton.addEventListener("click", () => {
      setSignupTooltip(signupTooltip.hidden);
    });

    document.addEventListener("click", (event) => {
      if (signupTooltip.hidden) {
        return;
      }

      if (event.target.closest(".signup-button-wrap")) {
        return;
      }

      setSignupTooltip(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || signupTooltip.hidden) {
        return;
      }

      setSignupTooltip(false);
    });
  }
})();
