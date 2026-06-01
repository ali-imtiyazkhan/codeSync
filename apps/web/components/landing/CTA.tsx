"use client";

import React from "react";
import { Plus } from "lucide-react";

interface CTAProps {
  createRoom: () => void;
}

export const CTA: React.FC<CTAProps> = ({ createRoom }) => {
  return (
    <section className="lp-cta-band">
      <div className="landing-container">
        <h2>Ready to pair?</h2>
        <p>Free to use. Create a room and invite your teammate now.</p>
        <button type="button" className="lp-btn lp-btn-primary" onClick={createRoom}>
          <Plus size={16} />
          Create your room
        </button>
      </div>
    </section>
  );
};
