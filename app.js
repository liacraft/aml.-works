(() => {
  const form = document.getElementById('projectForm');
  const resultPanel = document.getElementById('resultPanel');
  const briefOutput = document.getElementById('briefOutput');
  const typeError = document.getElementById('typeError');
  const copyStatus = document.getElementById('copyStatus');
  const dateField = document.getElementById('deadline');
  // Paste your deployed Google Apps Script Web App URL here after setup.
  const GOOGLE_APPS_SCRIPT_URL = ''; // Example: https://script.google.com/macros/s/DEPLOYMENT_ID/exec

  // Avoid allowing a requested deadline to default to a date in the past.
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateField.min = localToday;

  function selectedValues(name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
  }

  function value(name) {
    const el = form.elements.namedItem(name);
    return el && el.value.trim() ? el.value.trim() : 'Belum ditentukan';
  }

  function clearErrors() {
    form.querySelectorAll('.field.invalid').forEach(el => el.classList.remove('invalid'));
    typeError.style.display = 'none';
  }

  function validate() {
    clearErrors();
    let valid = true;
    const requiredIds = ['brandName', 'description', 'contactMethod', 'clientName', 'contact'];
    requiredIds.forEach(id => {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        input.closest('.field').classList.add('invalid');
        valid = false;
      }
    });
    if (!selectedValues('projectType').length) {
      typeError.style.display = 'block';
      valid = false;
    }
    if (dateField.value && dateField.value < localToday) {
      dateField.closest('.field').classList.add('invalid');
      const error = dateField.closest('.field').querySelector('.error-message');
      if (error) { error.textContent = 'Pilih tanggal hari ini atau setelahnya.'; error.style.display = 'block'; }
      valid = false;
    }
    return valid;
  }

  function buildBrief() {
    const types = selectedValues('projectType');
    const styles = selectedValues('style');
    return [
      'PROJECT REQUEST — aml. works',
      '================================',
      '',
      'CONTACT',
      `Nama: ${value('clientName')}`,
      `Kontak: ${value('contact')}`,
      `Preferensi kontak: ${value('contactMethod')}`,
      '',
      'PROJECT OVERVIEW',
      `Nama brand / project: ${value('brandName')}`,
      `Jenis project: ${types.join(', ') || 'Belum ditentukan'}`,
      `Status project: ${value('projectStage')}`,
      `Deskripsi: ${value('description')}`,
      `Target pengguna / audiens: ${value('audience')}`,
      '',
      'VISUAL DIRECTION',
      `Gaya visual: ${styles.join(', ') || 'Belum ditentukan'}`,
      `Preferensi warna: ${value('colors')}`,
      `Ilustrasi / simbol: ${value('illustration')}`,
      `Referensi: ${value('references')}`,
      `Hal yang wajib ada / dihindari: ${value('mustHave')}`,
      '',
      'SCOPE & TIMELINE',
      `Output yang dibutuhkan: ${value('deliverables')}`,
      `Target deadline: ${value('deadline')}`,
      `Estimasi budget: ${value('budget')}`,
      '',
      'Catatan: Detail scope, biaya, dan timeline akan dikonfirmasi sebelum pengerjaan dimulai.'
    ].join('\n');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) {
      const firstInvalid = form.querySelector('.field.invalid input, .field.invalid textarea, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      else document.getElementById('typeChoices').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    briefOutput.value = buildBrief();
    resultPanel.hidden = false;
    copyStatus.textContent = '';

    if (GOOGLE_APPS_SCRIPT_URL) {
      // Submit through a regular HTML POST in a new tab. This avoids browser CORS
      // restrictions on Google Apps Script and lets its response confirm success/failure.
      const payload = {};
      new FormData(form).forEach((val, key) => {
        if (key !== 'projectType' && key !== 'style') payload[key] = String(val);
      });
      payload.projectType = selectedValues('projectType').join(', ');
      payload.style = selectedValues('style').join(', ');
      payload.brief = briefOutput.value;
      const sender = document.createElement('form');
      sender.method = 'POST';
      sender.action = GOOGLE_APPS_SCRIPT_URL;
      sender.target = '_blank';
      sender.hidden = true;
      Object.entries(payload).forEach(([key, val]) => {
        const hidden = document.createElement('input');
        hidden.type = 'hidden'; hidden.name = key; hidden.value = val;
        sender.appendChild(hidden);
      });
      document.body.appendChild(sender);
      sender.submit();
      sender.remove();
      copyStatus.textContent = 'Request dikirim untuk diproses. Tab baru akan menampilkan hasil penyimpanan jika endpoint sudah dikonfigurasi dengan benar.';
    } else {
      copyStatus.textContent = 'Integrasi belum aktif. Brief ini hanya tersedia di browser; salin atau unduh, lalu ikuti README untuk menghubungkan Google Sheets dan email.';
    }
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && input.value.trim()) field.classList.remove('invalid');
      if (input.name === 'projectType' && selectedValues('projectType').length) typeError.style.display = 'none';
    });
    input.addEventListener('change', () => {
      const field = input.closest('.field');
      if (field && input.value.trim()) field.classList.remove('invalid');
      if (input.name === 'projectType' && selectedValues('projectType').length) typeError.style.display = 'none';
    });
  });

  document.getElementById('copyBrief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(briefOutput.value);
      copyStatus.textContent = 'Brief berhasil disalin. Kamu bisa paste ke email atau chat.';
    } catch (error) {
      briefOutput.focus();
      briefOutput.select();
      const copied = document.execCommand('copy');
      copyStatus.textContent = copied ? 'Brief berhasil disalin.' : 'Pilih teks di atas lalu salin secara manual.';
    }
  });

  document.getElementById('downloadBrief').addEventListener('click', () => {
    const blob = new Blob([briefOutput.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `project-brief-${(value('brandName').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'aml-works')}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });
})();
