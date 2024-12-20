import React from "react";
import { Link } from 'react-router-dom';
import UserProfile from '../userProfile/UserProfile';
import styles from "./navbar.module.css";


const Navbar = () => {


  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Logo" width={200} />
      </div>

      <div className={styles.links}>
        <Link to="/CustomerService">Customer Service</Link>
      </div>

      <div className={styles.user}>
        <UserProfile></UserProfile>
      </div>


    </nav>
  );
};

export default Navbar;