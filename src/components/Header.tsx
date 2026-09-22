import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header({ light = false }: { light?: boolean }) {
  return (
    <header className={`${styles.header} ${light ? styles.light : ""}`}>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          extract
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          library
        </NavLink>
      </nav>
    </header>
  );
}
