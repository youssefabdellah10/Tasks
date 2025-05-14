import React from 'react';
import { Container } from 'react-bootstrap';
import MainNavbar from '../components/common/MainNavbar';

const MainLayout = ({ children }) => {
  return (
    <>
      <MainNavbar />
      <Container className="py-4">
        {children}
      </Container>
      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <p className="mb-0">© {new Date().getFullYear()} Food Ordering System</p>
        </Container>
      </footer>
    </>
  );
};

export default MainLayout;
