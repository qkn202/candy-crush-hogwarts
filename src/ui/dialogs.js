// Quản lý Hộp thoại <dialog> chuẩn Modern Web (Top-Layer Entry/Exit Animations + Light Dismiss Fallback)

let supportsDisplayTransition;

function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
}

export function setDialogLocked(dialog, locked) {
  if (!dialog) return;
  dialog.dataset.locked = locked ? 'true' : 'false';
  dialog.setAttribute('closedby', locked ? 'none' : 'any');
  dialog.querySelectorAll('[data-close-dialog]').forEach((btn) => {
    btn.hidden = Boolean(locked);
  });
}

export function openModal(dialog) {
  if (!dialog || dialog.open) return;
  dialog.removeAttribute('data-closing');
  dialog.showModal();
  const toastWrap = document.getElementById('toast-container');
  if (toastWrap && toastWrap.children.length > 0 && 'popover' in HTMLElement.prototype) {
    try {
      toastWrap.hidePopover();
      toastWrap.showPopover();
    } catch {
      // Bỏ qua nếu trình duyệt không hỗ trợ nâng lại Popover Top-Layer
    }
  }
}

export async function closeTopLayer(dialog, returnValue = '') {
  if (!dialog || !dialog.open) return;
  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 450))
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }
  dialog.close(returnValue);
}

export function initModernDialogs() {
  const allDialogs = document.querySelectorAll('dialog');

  for (const dialog of allDialogs) {
    // Đảm bảo Esc đóng mượt qua closeTopLayer (trừ khi dialog đang khoá bắt buộc nhập tên lần đầu)
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      if (dialog.dataset.locked === 'true') return;
      closeTopLayer(dialog);
    });

    // Reset returnValue sau khi đóng để tránh rò rỉ giá trị cũ sang lần mở tiếp theo
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });

    // Nút đóng bên trong dialog dùng [data-close-dialog]
    dialog.querySelectorAll('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (dialog.dataset.locked === 'true') return;
        closeTopLayer(dialog, btn.value || 'close');
      });
    });
  }

  // Fallback Light Dismiss cho các trình duyệt (như Safari) chưa hỗ trợ <dialog closedby="any">
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog) && dialog.dataset.locked !== 'true') {
          closeTopLayer(dialog);
        }
      });
    }
  }
}
