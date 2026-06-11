import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span>✍️</span> PenCraft
        </div>
        <p className="footer-text">
          &copy; {new Date().getFullYear()} PenCraft. Built with passion, React, Node.js and MongoDB.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
