function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename, headers, rows) {
  const escapeCell = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  triggerDownload(filename, csvLines.join('\n'), 'text/csv;charset=utf-8;');
}

export function downloadTextReport(filename, markdownContent) {
  triggerDownload(filename, markdownContent, 'text/markdown;charset=utf-8;');
}

export function downloadJsonReport(filename, payload) {
  triggerDownload(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8;');
}
