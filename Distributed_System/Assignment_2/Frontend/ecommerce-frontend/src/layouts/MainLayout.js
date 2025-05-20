import React from 'react';
import { Container } from 'react-bootstrap';
import MainNavbar from '../components/common/MainNavbar';

const MainLayout = ({ children }) => {  return (
    <>
      <MainNavbar />
      <Container className="py-4">
        {children}
      </Container>
    </>
  );
};

export default MainLayout;
