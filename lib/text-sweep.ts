const sweepStagger = .14;

export function prepareTextSweep(root: Element) {
  for (const element of root.querySelectorAll<HTMLElement>("[data-sweep]")) element.classList.add("sweep-wait");
}

export function settleTextSweep(root: Element) {
  for (const element of root.querySelectorAll<HTMLElement>("[data-sweep]")) {
    element.classList.remove("sweep-wait", "is-sweeping");
    element.style.removeProperty("--sweep-delay");
  }
}

export function playTextSweep(root: Element, delay = 0) {
  root.querySelectorAll<HTMLElement>("[data-sweep]").forEach((element, index) => {
    element.style.setProperty("--sweep-delay", `${delay + index * sweepStagger}s`);
    element.classList.remove("sweep-wait");
    element.classList.add("is-sweeping");
    const finish = (event: AnimationEvent) => {
      if (event.animationName !== "text-sweep" || event.target !== element) return;
      element.removeEventListener("animationend", finish);
      element.classList.remove("is-sweeping");
      element.style.removeProperty("--sweep-delay");
    };
    element.addEventListener("animationend", finish);
  });
}
