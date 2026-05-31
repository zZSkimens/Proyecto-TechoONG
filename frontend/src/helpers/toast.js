let addToastFn = null;

export function setAddToastFn(fn) {
  addToastFn = fn;
}

export function showToast(message, type = 'success') {
  if (addToastFn) {
    addToastFn({ message, type, id: Date.now() });
  }
}
