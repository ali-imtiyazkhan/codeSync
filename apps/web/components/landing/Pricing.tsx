"use client";

import React from "react";
import { Check } from "lucide-react";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "/month",
        features: [
            "Up to 3 collaborators",
            "10 rooms per month",
            "Basic syntax highlighting",
            "Community support",
        ],
        cta: "Get Started",
        highlight: false,
    },
    {
        name: "Pro",
        price: "$12",
        period: "/month",
        features: [
            "Unlimited collaborators",
            "Unlimited rooms",
            "All 50+ languages",
            "Code snapshots",
            "Priority support",
        ],
        cta: "Start Free Trial",
        highlight: true,
    },
    {
        name: "Team",
        price: "$49",
        period: "/month",
        features: [
            "Everything in Pro",
            "Team workspace",
            "Admin controls",
            "SSO / SAML",
            "Dedicated support",
        ],
        cta: "Contact Sales",
        highlight: false,
    },
];

export const Pricing: React.FC = () => {
    return (
        <section id="pricing" style={{ padding: "100px 32px", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
                <div
                    style={{
                        fontSize: "11px",
                        color: "#ffffff",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                    }}
                >
          // PRICING
                </div>
                <h2
                    style={{
                        fontSize: "clamp(28px, 4vw, 44px)",
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Simple, transparent pricing.
                </h2>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "20px",
                    alignItems: "stretch",
                }}
            >
                {PLANS.map((plan, i) => (
                    <div
                        key={i}
                        style={{
                            background: plan.highlight ? "#0a0a0a" : "#000000",
                            border: `1px solid ${plan.highlight ? "#ffffff" : "#1a1a1a"}`,
                            borderRadius: "14px",
                            padding: "32px",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: plan.highlight ? "0 20px 60px rgba(255,255,255,0.15)" : "none",
                        }}
                    >
                        {plan.highlight && (
                            <>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: "20%",
                                        right: "20%",
                                        height: "1px",
                                        background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "14px",
                                        right: "14px",
                                        background: "#ffffff",
                                        color: "#fff",
                                        fontSize: "10px",
                                        fontWeight: 800,
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    POPULAR
                                </div>
                            </>
                        )}
                        <div
                            style={{
                                fontSize: "13px",
                                color: "#737373",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "16px",
                            }}
                        >
                            {plan.name}
                        </div>
                        <div
                            style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "28px" }}
                        >
                            <span
                                style={{
                                    fontSize: "42px",
                                    fontWeight: 900,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                {plan.price}
                            </span>
                            <span style={{ fontSize: "13px", color: "#525252" }}>{plan.period}</span>
                        </div>
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: "0 0 28px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {plan.features.map((feat, j) => (
                                <li
                                    key={j}
                                    style={{ display: "flex", gap: "10px", fontSize: "13px", color: "#737373" }}
                                >
                                    <span style={{ color: "#ffffff", flexShrink: 0, marginTop: "2px" }}>
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <button
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: plan.highlight ? "none" : "1px solid #1f1f1f",
                                background: plan.highlight
                                    ? "linear-gradient(135deg, #ffffff 0%, #d4d4d4 100%)"
                                    : "transparent",
                                color: plan.highlight ? "#fff" : "#737373",
                                fontWeight: 700,
                                fontSize: "13px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                letterSpacing: "0.06em",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                if (!plan.highlight) {
                                    e.currentTarget.style.borderColor = "#ffffff";
                                    e.currentTarget.style.color = "#ffffff";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!plan.highlight) {
                                    e.currentTarget.style.borderColor = "#1f1f1f";
                                    e.currentTarget.style.color = "#737373";
                                }
                            }}
                        >
                            {plan.cta.toUpperCase()}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};
