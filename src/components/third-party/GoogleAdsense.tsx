"use client";

import Script from "next/script";

export default function GoogleAdsense() {
  const pId = "ca-pub-5666739187500051";
  
  // The publisher ID without 'ca-' for Funding Choices
  const fcId = "pub-5666739187500051";

  return (
    <>
      {/* Google Funding Choices / Consent Management */}
      <Script
        id="funding-choices"
        src={`https://fundingchoicesmessages.google.com/i/${fcId}?ers=1`}
        strategy="afterInteractive"
      />
      <Script
        id="funding-choices-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function signalGooglefcPresent() {
                if (!window.frames['googlefcPresent']) {
                  if (document.body) {
                    const iframe = document.createElement('iframe');
                    iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                    iframe.style.display = 'none';
                    iframe.name = 'googlefcPresent';
                    document.body.appendChild(iframe);
                  } else {
                    setTimeout(signalGooglefcPresent, 0);
                  }
                }
              }
              signalGooglefcPresent();
            })();
          `,
        }}
      />
    </>
  );
}
