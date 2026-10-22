/** aml. works — Google Sheets + email request receiver
 * Setup: create this script from Extensions > Apps Script in your response Sheet.
 * Then deploy as a Web app, executing as you, with access set to Anyone.
 */
const SPREADSHEET_ID = '1tpgzcNevAvwRTQDTIDV-sYlMtBddtlCEn_PvuWXGt5c'; // ID between /d/ and /edit in the Sheet URL.
const NOTIFICATION_EMAIL = 'amaliakakashi@gmail.com'; // Change to the email that should receive requests.
const SHEET_NAME = 'Project Requests';

function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    // Honeypot: real visitors leave this field empty. Silently reject simple bots.
    if (p.website) return resultPage_(true, 'Request diterima.');

    const required = ['clientName', 'contact', 'contactMethod', 'brandName', 'description', 'projectType'];
    const missing = required.filter(k => !String(p[k] || '').trim());
    if (missing.length) return resultPage_(false, 'Data wajib belum lengkap. Silakan kembali ke form dan periksa isian yang bertanda *.');

    if (!SPREADSHEET_ID || SPREADSHEET_ID.includes('PASTE_GOOGLE')) throw new Error('SPREADSHEET_ID belum dikonfigurasi.');
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submitted At', 'Status', 'Client Name', 'Contact', 'Contact Preference',
        'Brand / Project', 'Project Type', 'Project Stage', 'Description', 'Audience',
        'Visual Style', 'Colors', 'Illustration / Symbol', 'References', 'Must Have / Avoid',
        'Deliverables', 'Deadline', 'Budget', 'Brief'
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 19).setFontWeight('bold');
    }

    const row = [
      new Date(), 'New Request', p.clientName || '', p.contact || '', p.contactMethod || '',
      p.brandName || '', p.projectType || '', p.projectStage || '', p.description || '', p.audience || '',
      p.style || '', p.colors || '', p.illustration || '', p.references || '', p.mustHave || '',
      p.deliverables || '', p.deadline || '', p.budget || '', p.brief || ''
    ];
    sheet.appendRow(row);
    const rowNumber = sheet.getLastRow();
    sheet.getRange(rowNumber, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(rowNumber, 19).setWrap(true);

    if (NOTIFICATION_EMAIL && !NOTIFICATION_EMAIL.includes('YOUR_EMAIL')) {
      const subject = 'New project request — ' + p.brandName;
      const body = [
        'You received a new project request through aml. works.',
        '',
        'Client: ' + p.clientName,
        'Contact: ' + p.contact + ' (' + p.contactMethod + ')',
        'Project: ' + p.brandName,
        'Type: ' + p.projectType,
        'Budget: ' + (p.budget || 'Belum ditentukan'),
        'Deadline: ' + (p.deadline || 'Belum ditentukan'),
        '',
        'Full brief:',
        p.brief || '(No brief provided)',
        '',
        'Spreadsheet: ' + ss.getUrl()
      ].join('\n');
      MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
    }
    return resultPage_(true, 'Project request berhasil disimpan ke Google Sheets.' + (NOTIFICATION_EMAIL.includes('YOUR_EMAIL') ? ' Email notifikasi belum aktif: atur NOTIFICATION_EMAIL di Apps Script.' : ' Notifikasi email sudah diproses.'));
  } catch (err) {
    console.error(err);
    return resultPage_(false, 'Request belum berhasil diproses. Coba lagi atau hubungi aml. works secara langsung.');
  }
}

function resultPage_(success, message) {
  const title = success ? 'Request received' : 'Something went wrong';
  const color = success ? '#b8f36b' : '#ffb4a8';
  const safeMessage = String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — aml. works</title><style>body{margin:0;background:#111311;color:#f4f4ef;font:16px/1.6 Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}.card{max-width:520px;border:1px solid #373b35;border-radius:20px;padding:32px;background:#191c18}.mark{color:${color};font-size:13px;letter-spacing:.16em;font-weight:bold}.symbol{font-size:48px;color:${color};margin:20px 0 4px}h1{font-size:clamp(28px,6vw,42px);line-height:1.1;margin:0 0 14px}p{color:#c4c8bf}.brand{margin-top:28px;font-weight:bold}</style></head><body><main class="card"><div class="mark">AML. WORKS / PROJECT INQUIRY</div><div class="symbol">${success ? '✓' : '!'}</div><h1>${title}</h1><p>${safeMessage}</p><div class="brand">aml. works</div></main></body></html>`);
}
