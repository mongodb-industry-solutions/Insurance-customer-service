import logo from './logo.svg';
import './App.css';
import * as Realm from "realm-web";
import ImageSearch from './_pages/ImageSearch/ImageSearch';
import AskLeafy from './_pages/AskLeafy/AskLeafy';
import AskThePDF from './_pages/AskThePDF/AskThePDF';
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
            <Route path="/imageSearch" element={<ImageSearch />} />
            <Route path="/askLeafy" element={<AskLeafy />} />
            <Route path="/askthepdf" element={<AskThePDF />} />
            <Route path="/CustomerService" element={<CustomerService />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
