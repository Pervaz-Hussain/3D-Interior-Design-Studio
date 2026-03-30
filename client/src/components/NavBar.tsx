import React from "react";
import { Link } from "wouter";

const NavBar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between h-14 px-4 border-b border-border bg-card text-card-foreground">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold text-xl text-primary">
              Interior Designer
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
