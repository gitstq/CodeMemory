import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiPlusCircle, 
  FiCode,
  FiServer,
  FiGithub
} from 'react-icons/fi';
import { healthCheck } from '../utils/api';
import './Layout.css';

const Layout: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    const status = await healthCheck();
    setServerStatus(status);
  };

  const navItems = [
    { path: '/', icon: FiHome, label: '首页' },
    { path: '/search', icon: FiSearch, label: '搜索' },
    { path: '/add', icon: FiPlusCircle, label: '添加' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FiCode className="logo-icon" />
            <span className="logo-text">CodeMemory</span>
          </div>
          <div className={`server-status ${serverStatus ? 'online' : 'offline'}`}>
            <FiServer />
            <span>{serverStatus ? '在线' : '离线'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a 
            href="https://github.com/gitstq/codememory" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
          >
            <FiGithub />
            <span>GitHub</span>
          </a>
          <p className="version">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
