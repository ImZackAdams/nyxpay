document.getElementById('builderForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const labelRaw = document.getElementById('label').value.trim();
    const amount = parseFloat(document.getElementById('amount').value.trim());
    const recipient = document.getElementById('recipient').value.trim();
  
    if (!labelRaw || !amount || !recipient) return;
  
    const label = encodeURIComponent(labelRaw);
    const baseUrl = 'https://tballcheckout.vercel.app';
    const link = `${baseUrl}/?recipient=${recipient}&amount=${amount}&label=${label}`;
  
    // Show checkout link
    const output = document.getElementById('output');
    const linkBox = document.getElementById('checkoutLink');
    output.classList.remove('hidden');
    linkBox.value = link;
  
    // Generate embed code with price included in the button
    const embedSection = document.getElementById('buttonEmbed');
    const embedTextarea = document.getElementById('buttonCode');
    const embedHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer" style="padding: 10px 16px; background: #FEB02E; color: black; text-decoration: none; border-radius: 6px; font-weight: bold;">${labelRaw || 'Pay'} – ${amount} TBALL</a>`;
  
    embedTextarea.value = embedHTML;
    embedSection.classList.remove('hidden');
  
    // Show live preview of the button
    const preview = document.getElementById('buttonPreview');
    preview.innerHTML = embedHTML;
  });
  
  document.getElementById('copyButton').addEventListener('click', () => {
    const link = document.getElementById('checkoutLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  });
  
  document.getElementById('copyEmbed').addEventListener('click', () => {
    const embedTextarea = document.getElementById('buttonCode');
    embedTextarea.select();
    document.execCommand('copy');
    alert('Embed code copied to clipboard!');
  });
  