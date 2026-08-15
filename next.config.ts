import type { NextConfig } from 'next'

const config: NextConfig = {
  // Next's dev server refuses to serve /_next/* chunks to a browser whose origin
  // isn't localhost. Viewing the dev site from another machine on the LAN then
  // gets the HTML but none of the JS, and because every revealed section ships
  // at opacity:0 the page renders blank. Listing the hosts here fixes that.
  //
  // Development only — this has no effect on a production build.
  allowedDevOrigins: [
    '192.168.1.4', // Wi-Fi
    '100.74.19.84', // Tailscale
  ],
}

export default config
