// Grab DOM elements once
const form = document.getElementById('builderForm');
const labelInput = document.getElementById('label');
const amountInput = document.getElementById('amount');
const recipientInput = document.getElementById('recipient');
const outputSection = document.getElementById('output');
const checkoutLinkInput = document.getElementById('checkoutLink');
const embedSection = document.getElementById('buttonEmbed');
const embedTextarea = document.getElementById('buttonCode');
const preview = document.getElementById('buttonPreview');

// Generate a relative link to the local checkout file
function getCheckoutPathRelativeToBuilder() {
  return '../nyxpay-sdk/examples/checkout/index.html';
}

// Assemble a payment link with query params
function buildPaymentLink({ recipient, amount, label }) {
  const labelEncoded = encodeURIComponent(label);
  const checkoutPath = getCheckoutPathRelativeToBuilder();
  return `${checkoutPath}?recipient=${recipient}&amount=${amount}&label=${labelEncoded}&tokenMint=SOL`;
}

// Build embeddable HTML for the link
function buildEmbedButton(link, label, amount) {
  return `
    <a href="${link}" target="_blank" rel="noopener noreferrer"
       style="padding: 10px 16px; background: #FEB02E; color: black;
              text-decoration: none; border-radius: 6px; font-weight: bold;
              font-family: sans-serif;">
      ${label || 'Pay'} – ${amount} SOL
    </a>`.trim();
}

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const label = labelInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const recipient = recipientInput.value.trim();

  if (!label || !recipient || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid label, amount, and recipient address.');
    return;
  }

  const link = buildPaymentLink({ recipient, amount, label });
  const embedHTML = buildEmbedButton(link, label, amount);

  // Display generated checkout link
  checkoutLinkInput.value = link;
  outputSection.classList.remove('hidden');

  // Show embeddable HTML and preview
  embedTextarea.value = embedHTML;
  embedSection.classList.remove('hidden');
  preview.innerHTML = embedHTML;
});

// Copy to clipboard: checkout link
document.getElementById('copyButton').addEventListener('click', () => {
  checkoutLinkInput.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
});

// Copy to clipboard: embed code
document.getElementById('copyEmbed').addEventListener('click', () => {
  embedTextarea.select();
  document.execCommand('copy');
  alert('Embed code copied to clipboard!');
});
