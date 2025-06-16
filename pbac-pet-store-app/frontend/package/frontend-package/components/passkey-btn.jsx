import React, { useState, useEffect } from 'react';

export default function PasskeyButton() {
  const [passkeyUrl, setPasskeyUrl] = useState('');

  useEffect(() => {
    async function fetchPasskeyUrl() {
      try {
        const response = await fetch('/api/passkey-url');
        const data = await response.json();
        setPasskeyUrl(data.passkeyUrl);
      } catch (error) {
        console.error('Error fetching passkey URL:', error);
      }
    }
    fetchPasskeyUrl();
  }, []);

  return (
    <a href={passkeyUrl} target="_blank" rel="noopener noreferrer">
      <img src="/thumbprint.png" alt="Passkey" height="50" />
    </a>
  );
}