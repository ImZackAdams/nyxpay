document.getElementById('builderForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const label = encodeURIComponent(document.getElementById('label').value.trim());
    const amount = parseFloat(document.getElementById('amount').value.trim());
    const recipient = document.getElementById('recipient').value.trim();
  
    if (!label || !amount || !recipient) return;


  //testing local
    const baseUrl = 'https://tballcheckout-pff9zgb4j-imzackadams-projects.vercel.app';
  

    const link = `${baseUrl}/?recipient=${recipient}&amount=${amount}&label=${label}`;
  
    const output = document.getElementById('output');
    const linkBox = document.getElementById('checkoutLink');
    output.classList.remove('hidden');
    linkBox.value = link;
  });
  
  document.getElementById('copyButton').addEventListener('click', () => {
    const link = document.getElementById('checkoutLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  });
  