import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sbw = collapsed ? '72px' : '260px';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      '--sbw': sbw,
      background: '#f1f5f9',
    }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        marginLeft: sbw,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left .25s ease',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <Navbar />
        <div style={{
          marginTop: '60px',
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: '#f1f5f9',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}