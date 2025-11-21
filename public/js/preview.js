document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('#imagen');
  const preview = document.querySelector('#previewImg');
  if (!input || !preview) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) { preview.src = ''; preview.style.display = 'none'; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
});
