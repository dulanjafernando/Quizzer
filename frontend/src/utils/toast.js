export function showToast(message, type = 'success', duration = 3000, position = 'bottom-right') {
  try {
    const toast = document.createElement('div');
    toast.className = `app-toast ${type} ${position}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // trigger show animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  } catch (err) {
    // fallback to alert if DOM not available
    console.warn('Toast failed', err);
    alert(message);
  }
}

export default { showToast };
