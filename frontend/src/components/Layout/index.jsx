import React from 'react';
import { AppKitProvider } from '../../config/appkit-provider.jsx';

export default function Layout({ children }) {
  return (
    <AppKitProvider>
      <div data-testid="app-layout">
        {/* Header / Nav placeholders to mirror cohort project layout */}
        <main>{children}</main>
      </div>
    </AppKitProvider>
  );
}
