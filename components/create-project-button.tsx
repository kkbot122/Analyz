"use client";

import { useState } from "react";
import { NewProjectModal } from "./new-project-modal";

interface CreateProjectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function CreateProjectButton({ children, className, ...props }: CreateProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
        {...props}
      >
        {children}
      </button>
      
      <NewProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}