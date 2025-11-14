"use client";

// page.js

import CustomerService from "@/components/CustomerService/CustomerService";
import Navbar from "@/components/navBar/Navbar";

import "./index.css";
import "./page.css";

export default function Home() {

  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
        <CustomerService />
      </header>
    </div>
  );
}