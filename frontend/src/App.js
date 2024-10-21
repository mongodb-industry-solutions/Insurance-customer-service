import logo from './logo.svg';
import './App.css';
import * as Realm from "realm-web";
import CustomerService from './_pages/CustomerService/CustomerService';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './_components/navBar/Navbar';

function App() {


  return (
    <div className="App">
      <header className="App-header">

        <BrowserRouter>
        <Navbar></Navbar>
          <Routes>
            <Route path="/CustomerService" element={<CustomerService />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
