import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, RotateCcw, Sparkles, X } from 'lucide-react';

const CUSTOM_ICONS_STORAGE_KEY = 'vizo_custom_course_icons_v1';
const COURSE_ICON_MAP_KEY = 'vizo_course_icon_map_v1';

export const PASTEL_COLOR_OPTIONS = [
  { id: 'yellow', label: 'Kuning Ceria', bg: '#FEF0C7', cardBg: '#FFFBEB', accent: '#D97706' },
  { id: 'blue', label: 'Biru Elektrik', bg: '#CFE2FF', cardBg: '#EAF2FF', accent: '#1D63FF' },
  { id: 'green', label: 'Hijau Mint', bg: '#D1FADF', cardBg: '#ECFDF3', accent: '#059669' },
  { id: 'pink', label: 'Pink Koral', bg: '#FFE4E6', cardBg: '#FFF1F2', accent: '#E11D48' },
  { id: 'purple', label: 'Ungu Lavender', bg: '#E9D5FF', cardBg: '#F3E8FF', accent: '#7C3AED' },
  { id: 'cyan', label: 'Biru Langit', bg: '#CFFAFE', cardBg: '#ECFEFF', accent: '#0891B2' },
];

/**
 * 20 Playful Avatar / Mascot & Subject SVG Presets
 */
export const PLAYFUL_AVATAR_PRESETS = [
  {
    id: 'garuda-pancasila',
    name: 'Garuda Pancasila',
    colorId: 'yellow',
    bg: '#FEF0C7',
    cardBg: '#FFFBEB',
    accent: '#D97706',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FEF0C7" />
        {/* Spread Golden Wings */}
        <path
          d="M24 22 L7 13 C6 19 8 25 13 28 L7 28 C9 32 14 34 19 32 Z"
          fill="#F59E0B"
          stroke="#1E293B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M24 22 L41 13 C42 19 40 25 35 28 L41 28 C39 32 34 34 29 32 Z"
          fill="#F59E0B"
          stroke="#1E293B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Tail Feathers */}
        <path
          d="M19 32 L16 40 L24 37 L32 40 L29 32 Z"
          fill="#D97706"
          stroke="#1E293B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Garuda Head & Crest */}
        <path
          d="M24 6 L21 10 L24 9 L27 10 Z"
          fill="#D97706"
          stroke="#1E293B"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="14.5" r="5.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="22" cy="14" r="1.1" fill="#1E293B" />
        <circle cx="26" cy="14" r="1.1" fill="#1E293B" />
        <polygon points="24,15 22.3,17.3 25.7,17.3" fill="#EA580C" />
        {/* Pancasila Shield on Chest */}
        <path
          d="M17.5 20 H30.5 V27.5 C30.5 31.8 24 34.5 24 34.5 C24 34.5 17.5 31.8 17.5 27.5 Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Red & White Quadrants */}
        <rect x="18.3" y="20.8" width="5.7" height="5.5" fill="#E11D48" />
        <rect x="24" y="26.3" width="5.7" height="5.2" fill="#E11D48" />
        {/* Center Black Shield with Golden Star */}
        <rect x="21.6" y="23.8" width="4.8" height="4.8" rx="1" fill="#1E293B" />
        <circle cx="24" cy="26.2" r="1.4" fill="#FBBF24" />
        {/* Bhinneka Tunggal Ika Ribbon */}
        <path
          d="M12 39 Q24 43 36 39 L35 42.5 Q24 46 13 42.5 Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'algoritma-flow',
    name: 'Algoritma',
    colorId: 'purple',
    bg: '#E9D5FF',
    cardBg: '#F3E8FF',
    accent: '#7C3AED',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#E9D5FF" />
        {/* Connecting Flowchart Lines */}
        <line x1="24" y1="14" x2="24" y2="21" stroke="#1E293B" strokeWidth="2" />
        <line x1="18" y1="27" x2="12" y2="35" stroke="#1E293B" strokeWidth="2" />
        <line x1="30" y1="27" x2="36" y2="35" stroke="#1E293B" strokeWidth="2" />
        {/* Top Start Node */}
        <rect x="16" y="7.5" width="16" height="7" rx="3.5" fill="#22C55E" stroke="#1E293B" strokeWidth="1.6" />
        {/* Center Decision Diamond with Cute Face */}
        <polygon
          points="24,17 34,26 24,35 14,26"
          fill="#7C3AED"
          stroke="#1E293B"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="21.5" cy="25" r="1.4" fill="#FFFFFF" />
        <circle cx="26.5" cy="25" r="1.4" fill="#FFFFFF" />
        <path d="M22 28 Q24 29.8 26 28" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Bottom Left & Right Output Nodes */}
        <rect x="7" y="34" width="11" height="7.5" rx="2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" />
        <rect x="30" y="34" width="11" height="7.5" rx="2" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'komputer-pc',
    name: 'Ilmu Komputer',
    colorId: 'blue',
    bg: '#CFE2FF',
    cardBg: '#EAF2FF',
    accent: '#1D63FF',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFE2FF" />
        {/* Monitor Outer Frame */}
        <rect x="9" y="10" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
        {/* Monitor Glowing Screen */}
        <rect x="12" y="13" width="24" height="16" rx="2" fill="#1D63FF" />
        {/* Cute Eyes & Smile on Screen */}
        <circle cx="20" cy="19.5" r="1.6" fill="#FFFFFF" />
        <circle cx="28" cy="19.5" r="1.6" fill="#FFFFFF" />
        <circle cx="17.5" cy="21.5" r="1.5" fill="#FDA4AF" />
        <circle cx="30.5" cy="21.5" r="1.5" fill="#FDA4AF" />
        <path d="M21.5 22.2 Q24 24.5 26.5 22.2" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Stand & Keyboard Base */}
        <rect x="21" y="32" width="6" height="4" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="13" y="36" width="22" height="5" rx="2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'matematika-calc',
    name: 'Matematika',
    colorId: 'pink',
    bg: '#FFE4E6',
    cardBg: '#FFF1F2',
    accent: '#E11D48',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FFE4E6" />
        {/* Calculator Body */}
        <rect x="12" y="8" width="24" height="32" rx="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
        {/* Cute Smiling Display Screen */}
        <rect x="15" y="11.5" width="18" height="8.5" rx="2" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1.4" />
        <circle cx="21" cy="15" r="1.2" fill="#1E293B" />
        <circle cx="27" cy="15" r="1.2" fill="#1E293B" />
        <path d="M22.2 17.2 Q24 18.6 25.8 17.2" stroke="#1E293B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 4 Colorful Math Symbol Buttons (+, -, ×, =) */}
        <rect x="15" y="22.5" width="8" height="7" rx="1.8" fill="#E11D48" stroke="#1E293B" strokeWidth="1.3" />
        <path d="M19 24.3 V27.7 M17.3 26 H20.7" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="25" y="22.5" width="8" height="7" rx="1.8" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.3" />
        <path d="M27.3 26 H30.7" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="15" y="31" width="8" height="6.5" rx="1.8" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.3" />
        <path d="M17.6 32.8 L20.4 35.6 M20.4 32.8 L17.6 35.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="25" y="31" width="8" height="6.5" rx="1.8" fill="#22C55E" stroke="#1E293B" strokeWidth="1.3" />
        <path d="M27.3 33.2 H30.7 M27.3 35.3 H30.7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'fisika-atom',
    name: 'Fisika & Sains',
    colorId: 'cyan',
    bg: '#CFFAFE',
    cardBg: '#ECFEFF',
    accent: '#0891B2',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFFAFE" />
        {/* Atom Electron Orbits */}
        <ellipse
          cx="24"
          cy="24"
          rx="17"
          ry="6.8"
          transform="rotate(30 24 24)"
          fill="none"
          stroke="#0891B2"
          strokeWidth="1.8"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="17"
          ry="6.8"
          transform="rotate(-30 24 24)"
          fill="none"
          stroke="#1D63FF"
          strokeWidth="1.8"
        />
        <ellipse cx="24" cy="24" rx="6.8" ry="17" fill="none" stroke="#0891B2" strokeWidth="1.6" />
        {/* Orbiting Electrons */}
        <circle cx="10" cy="16" r="2.5" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.3" />
        <circle cx="38" cy="16" r="2.5" fill="#22C55E" stroke="#1E293B" strokeWidth="1.3" />
        <circle cx="24" cy="41" r="2.5" fill="#FF6B6B" stroke="#1E293B" strokeWidth="1.3" />
        {/* Cute Smiling Nucleus */}
        <circle cx="24" cy="24" r="6.8" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.7" />
        <circle cx="22" cy="23.2" r="1.1" fill="#1E293B" />
        <circle cx="26" cy="23.2" r="1.1" fill="#1E293B" />
        <path d="M22.2 25.5 Q24 27 25.8 25.5" stroke="#1E293B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'kimia-lab',
    name: 'Kimia & Lab',
    colorId: 'green',
    bg: '#D1FADF',
    cardBg: '#ECFDF3',
    accent: '#059669',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#D1FADF" />
        {/* Floating Bubbles */}
        <circle cx="21" cy="8.5" r="2.2" fill="#34D399" stroke="#1E293B" strokeWidth="1.3" />
        <circle cx="27.5" cy="6.5" r="1.7" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
        {/* Erlenmeyer Flask Body */}
        <path
          d="M20 12 H28 M21 12 V18 L11 35 C10 37 11.5 39.5 14 39.5 H34 C36.5 39.5 38 37 37 35 L27 18 V12"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glowing Green Potion Liquid Inside */}
        <path
          d="M15.5 27.5 Q24 25.5 32.5 27.5 L36.5 34.8 C37.2 36.5 36 38.5 33.8 38.5 H14.2 C12 38.5 10.8 36.5 11.5 34.8 Z"
          fill="#10B981"
        />
        {/* Cute Face on Flask */}
        <circle cx="21" cy="32" r="1.4" fill="#1E293B" />
        <circle cx="27" cy="32" r="1.4" fill="#1E293B" />
        <circle cx="18.5" cy="33.5" r="1.5" fill="#FDA4AF" />
        <circle cx="29.5" cy="33.5" r="1.5" fill="#FDA4AF" />
        <path d="M22 34.5 Q24 36.2 26 34.5" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'bahasa-indo',
    name: 'Bahasa Indonesia',
    colorId: 'pink',
    bg: '#FFE4E6',
    cardBg: '#FFF1F2',
    accent: '#E11D48',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FFE4E6" />
        {/* Book Cover with Merah Putih Theme */}
        <rect x="11" y="10" width="26" height="28" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
        {/* Red Top Half (Merah Putih) */}
        <path
          d="M11 14 C11 11.8 12.8 10 15 10 H33 C35.2 10 37 11.8 37 14 V22 H11 Z"
          fill="#E11D48"
          stroke="#1E293B"
          strokeWidth="1.7"
        />
        {/* Cute Face on White Bottom Half */}
        <circle cx="20.5" cy="28" r="1.4" fill="#1E293B" />
        <circle cx="27.5" cy="28" r="1.4" fill="#1E293B" />
        <circle cx="18" cy="29.8" r="1.6" fill="#FDA4AF" />
        <circle cx="30" cy="29.8" r="1.6" fill="#FDA4AF" />
        <path d="M22 30.8 Q24 32.5 26 30.8" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* "ID" Badge on Top Red Half */}
        <rect x="18" y="13" width="12" height="6" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.2" />
        <text
          x="24"
          y="17.6"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="800"
          fill="#E11D48"
          fontFamily="sans-serif"
        >
          INA
        </text>
      </svg>
    ),
  },
  {
    id: 'bahasa-inggris',
    name: 'Bahasa Inggris',
    colorId: 'blue',
    bg: '#CFE2FF',
    cardBg: '#EAF2FF',
    accent: '#1D63FF',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFE2FF" />
        {/* Speech Bubble Card */}
        <path
          d="M10 14 C10 11.2 12.2 9 15 9 H33 C35.8 9 38 11.2 38 14 V29 C38 31.8 35.8 34 33 34 H21 L14 39 V34 C11.8 34 10 31.8 10 29 Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Royal Blue Top Header with Red Accent */}
        <path
          d="M10 14 C10 11.2 12.2 9 15 9 H33 C35.8 9 38 11.2 38 14 V19.5 H10 Z"
          fill="#1D63FF"
          stroke="#1E293B"
          strokeWidth="1.7"
        />
        <text
          x="24"
          y="16.2"
          textAnchor="middle"
          fontSize="6"
          fontWeight="800"
          fill="#FFFFFF"
          fontFamily="sans-serif"
        >
          ENG
        </text>
        {/* Cute Smiling Face */}
        <circle cx="20" cy="25" r="1.4" fill="#1E293B" />
        <circle cx="28" cy="25" r="1.4" fill="#1E293B" />
        <circle cx="17.5" cy="26.8" r="1.6" fill="#FDA4AF" />
        <circle cx="30.5" cy="26.8" r="1.6" fill="#FDA4AF" />
        <path d="M21.8 27.8 Q24 29.8 26.2 27.8" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'robo-ai',
    name: 'Robo Pintar',
    colorId: 'blue',
    bg: '#CFE2FF',
    cardBg: '#EAF2FF',
    accent: '#1D63FF',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFE2FF" />
        {/* Antenna */}
        <line x1="24" y1="7" x2="24" y2="13" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="6.5" r="3" fill="#FF6B6B" stroke="#1E293B" strokeWidth="1.5" />
        {/* Ears */}
        <rect x="7" y="20" width="4" height="9" rx="2" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="37" y="20" width="4" height="9" rx="2" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.5" />
        {/* Head */}
        <rect x="11" y="13" width="26" height="22" rx="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
        {/* Visor */}
        <rect x="14.5" y="17" width="19" height="9" rx="4" fill="#1E293B" />
        {/* Glowing Eyes */}
        <circle cx="19.5" cy="21.5" r="2.2" fill="#38BDF8" />
        <circle cx="28.5" cy="21.5" r="2.2" fill="#38BDF8" />
        {/* Rosy Cheeks & Smile */}
        <circle cx="16" cy="29.5" r="2" fill="#FDA4AF" />
        <circle cx="32" cy="29.5" r="2" fill="#FDA4AF" />
        <path d="M20.5 29 Q24 32 27.5 29" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Body */}
        <path d="M15 48 C15 39 33 39 33 48 Z" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'cat-coder',
    name: 'Kucing Koding',
    colorId: 'yellow',
    bg: '#FEF0C7',
    cardBg: '#FFFBEB',
    accent: '#D97706',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FEF0C7" />
        {/* Cat Ears */}
        <polygon points="12,21 14,10 21,16" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.7" strokeLinejoin="round" />
        <polygon points="36,21 34,10 27,16" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.7" strokeLinejoin="round" />
        {/* Cat Head */}
        <circle cx="24" cy="24" r="12.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.7" />
        {/* Glasses */}
        <circle cx="19.5" cy="22.5" r="3.6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="28.5" cy="22.5" r="3.6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
        <line x1="23.1" y1="22.5" x2="24.9" y2="22.5" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="19.5" cy="22.5" r="1.4" fill="#1E293B" />
        <circle cx="28.5" cy="22.5" r="1.4" fill="#1E293B" />
        {/* Cute Cat Nose & Mouth */}
        <polygon points="24,25.5 22.5,27.2 25.5,27.2" fill="#E11D48" />
        <path d="M21 28.5 Q24 30.5 24 27.5 Q24 30.5 27 28.5" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mini Laptop at bottom */}
        <rect x="14" y="34" width="20" height="11" rx="2.5" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="24" cy="39.5" r="1.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'owl-prof',
    name: 'Prof. Burung Hantu',
    colorId: 'green',
    bg: '#D1FADF',
    cardBg: '#ECFDF3',
    accent: '#059669',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#D1FADF" />
        {/* Owl Body/Head */}
        <ellipse cx="24" cy="27" rx="12.5" ry="13.5" fill="#10B981" stroke="#1E293B" strokeWidth="1.7" />
        <ellipse cx="24" cy="31" rx="8.5" ry="8" fill="#ECFDF3" />
        {/* Big Wise Eyes */}
        <circle cx="19.5" cy="22" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="28.5" cy="22" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="19.5" cy="22" r="2" fill="#1E293B" />
        <circle cx="28.5" cy="22" r="2" fill="#1E293B" />
        {/* Beak */}
        <polygon points="24,24 21.8,27.5 26.2,27.5" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.3" strokeLinejoin="round" />
        {/* Graduation Cap */}
        <polygon points="24,7 10,13 24,18 38,13" fill="#1E293B" />
        <rect x="17" y="15" width="14" height="3.5" rx="1" fill="#1D63FF" />
        <line x1="35" y1="13.5" x2="37" y2="20" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'rocket-lab',
    name: 'Roket Eksplorasi',
    colorId: 'pink',
    bg: '#FFE4E6',
    cardBg: '#FFF1F2',
    accent: '#E11D48',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FFE4E6" />
        {/* Stars */}
        <circle cx="11" cy="14" r="1.8" fill="#F59E0B" />
        <circle cx="37" cy="12" r="2.2" fill="#1D63FF" />
        <circle cx="38" cy="28" r="1.5" fill="#F59E0B" />
        {/* Rocket Fins */}
        <path d="M16 28 L10 35 L17 35 Z" fill="#FF6B6B" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M32 28 L38 35 L31 35 Z" fill="#FF6B6B" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Rocket Body */}
        <path d="M24 8 C17 15 16 25 16 35 L32 35 C32 25 31 15 24 8 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M24 8 C20.5 11.5 18.5 15 17.8 18 L30.2 18 C29.5 15 27.5 11.5 24 8 Z" fill="#E11D48" stroke="#1E293B" strokeWidth="1.6" />
        {/* Cute Face Window */}
        <circle cx="24" cy="25" r="5" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="22.3" cy="24.5" r="1" fill="#1E293B" />
        <circle cx="25.7" cy="24.5" r="1" fill="#1E293B" />
        <path d="M22.5 26.8 Q24 28 25.5 26.8" stroke="#1E293B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Flame */}
        <path d="M20 35 Q24 44 28 35 Z" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 'student-boy',
    name: 'Avatar Mahasiswa',
    colorId: 'green',
    bg: '#D1FADF',
    cardBg: '#ECFDF3',
    accent: '#059669',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#D1FADF" />
        <path d="M10 48 C10 36 38 36 38 48 Z" fill="#1E293B" />
        <path d="M18 38 L24 45 L30 38 Z" fill="#FF6B6B" />
        <rect x="21" y="29" width="6" height="7" rx="2.5" fill="#FDBA94" />
        <circle cx="24" cy="21" r="9.5" fill="#FDBA94" stroke="#1E293B" strokeWidth="1.4" />
        <path d="M14.5 19.5 C14.5 12 19 9.5 24.5 9.5 C30 9.5 33.5 12.5 33.5 19 C31.5 15.5 27.5 14.5 23 15 C18.5 15.5 16 17.5 14.5 19.5 Z" fill="#7C2D12" />
        <circle cx="20.8" cy="21" r="1.2" fill="#1E293B" />
        <circle cx="27.2" cy="21" r="1.2" fill="#1E293B" />
        <circle cx="18.5" cy="23.2" r="1.6" fill="#FDA4AF" />
        <circle cx="29.5" cy="23.2" r="1.6" fill="#FDA4AF" />
        <path d="M21.2 24.8 Q24 27 26.8 24.8" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'student-girl',
    name: 'Avatar Mahasiswi',
    colorId: 'pink',
    bg: '#FFE4E6',
    cardBg: '#FFF1F2',
    accent: '#E11D48',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FFE4E6" />
        {/* Back Hair */}
        <path d="M12 22 C11 33 14 40 24 40 C34 40 37 33 36 22 Z" fill="#31102F" />
        {/* Shirt */}
        <path d="M11 48 C11 37 37 37 37 48 Z" fill="#E11D48" stroke="#1E293B" strokeWidth="1.4" />
        <rect x="21" y="29" width="6" height="6" rx="2.5" fill="#FDBA94" />
        {/* Face */}
        <circle cx="24" cy="21.5" r="9" fill="#FDBA94" stroke="#1E293B" strokeWidth="1.4" />
        {/* Bangs */}
        <path d="M14.5 20 C15 11.5 20 9.5 24 9.5 C28 9.5 33 11.5 33.5 20 C31 15.5 27 14.5 24 15.5 C20 14.5 16.5 16 14.5 20 Z" fill="#31102F" />
        {/* Eyes & Smile */}
        <circle cx="20.8" cy="21.5" r="1.2" fill="#1E293B" />
        <circle cx="27.2" cy="21.5" r="1.2" fill="#1E293B" />
        <circle cx="18.5" cy="23.5" r="1.6" fill="#FDA4AF" />
        <circle cx="29.5" cy="23.5" r="1.6" fill="#FDA4AF" />
        <path d="M21.5 25 Q24 27.2 26.5 25" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'brain-spark',
    name: 'Otak Cerdas',
    colorId: 'purple',
    bg: '#E9D5FF',
    cardBg: '#F3E8FF',
    accent: '#7C3AED',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#E9D5FF" />
        {/* Lightbulb rays */}
        <line x1="24" y1="6" x2="24" y2="9" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="9" x2="17" y2="11" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="33" y1="9" x2="31" y2="11" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        {/* Cute Cloud/Brain */}
        <path d="M15 29 C11.5 29 9.5 26 10.5 22.5 C9.5 18.5 13 15 17 16 C19 13 24 12.5 26.5 15 C30 13 35 15.5 35.5 19.5 C38.5 21.5 38 26.5 34.5 28.5 C34 32 30 33.5 26.5 32.5 C23.5 34 18 33 16.5 30 Z" fill="#F472B6" stroke="#1E293B" strokeWidth="1.7" strokeLinejoin="round" />
        {/* Cute Glasses & Smile */}
        <circle cx="20" cy="23" r="2.8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="28" cy="23" r="2.8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="20" cy="23" r="1.2" fill="#1E293B" />
        <circle cx="28" cy="23" r="1.2" fill="#1E293B" />
        <path d="M21.8 27.5 Q24 29.5 26.2 27.5" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cyber-globe',
    name: 'Jaringan Global',
    colorId: 'cyan',
    bg: '#CFFAFE',
    cardBg: '#ECFEFF',
    accent: '#0891B2',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFFAFE" />
        {/* Planet Ring */}
        <ellipse cx="24" cy="25" rx="18" ry="6" transform="rotate(-18 24 25)" fill="none" stroke="#F59E0B" strokeWidth="2.4" />
        {/* Earth Body */}
        <circle cx="24" cy="24" r="12" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.8" />
        {/* Continents */}
        <path d="M16 18 C19 18 21 21 19 24 C17 26 14 25 13 22 Z" fill="#34D399" />
        <path d="M27 16 C31 17 34 21 32 26 C30 29 27 27 26 23 Z" fill="#34D399" />
        {/* Cute Face */}
        <circle cx="20.5" cy="23" r="1.5" fill="#1E293B" />
        <circle cx="27.5" cy="23" r="1.5" fill="#1E293B" />
        <circle cx="18" cy="25.2" r="1.8" fill="#FDA4AF" />
        <circle cx="30" cy="25.2" r="1.8" fill="#FDA4AF" />
        <path d="M21.8 26.2 Q24 28.2 26.2 26.2" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'data-bot',
    name: 'Basis Data Bot',
    colorId: 'blue',
    bg: '#CFE2FF',
    cardBg: '#EAF2FF',
    accent: '#1D63FF',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#CFE2FF" />
        {/* Server Stack */}
        <rect x="12" y="11" width="24" height="9" rx="3.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.7" />
        <rect x="12" y="21" width="24" height="9" rx="3.5" fill="#1D63FF" stroke="#1E293B" strokeWidth="1.7" />
        <rect x="12" y="31" width="24" height="8" rx="3.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.7" />
        {/* Cute Eyes on Middle Layer */}
        <circle cx="20" cy="25.5" r="1.6" fill="#FFFFFF" />
        <circle cx="28" cy="25.5" r="1.6" fill="#FFFFFF" />
        <path d="M22 27.2 Q24 28.6 26 27.2" stroke="#FFFFFF" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* Blinking Lights */}
        <circle cx="16.5" cy="15.5" r="1.5" fill="#22C55E" />
        <circle cx="21" cy="15.5" r="1.5" fill="#F59E0B" />
        <circle cx="16.5" cy="35" r="1.5" fill="#FF6B6B" />
        <circle cx="21" cy="35" r="1.5" fill="#22C55E" />
      </svg>
    ),
  },
  {
    id: 'gamepad-joy',
    name: 'Kreatif & Gim',
    colorId: 'yellow',
    bg: '#FEF0C7',
    cardBg: '#FFFBEB',
    accent: '#D97706',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#FEF0C7" />
        <path d="M12 20 C9 20 8 31 12 34 C15 36 17 31 20 31 L28 31 C31 31 33 36 36 34 C40 31 39 20 36 20 C33 17 15 17 12 20 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
        {/* D-Pad */}
        <path d="M15 23 H18 V26 H15 Z M16.5 21.5 V27.5" stroke="#1D63FF" strokeWidth="2.2" strokeLinecap="round" />
        {/* Buttons */}
        <circle cx="32" cy="23" r="1.8" fill="#FF6B6B" />
        <circle cx="34.5" cy="25.5" r="1.8" fill="#22C55E" />
        {/* Cute Eyes & Smile in Center */}
        <circle cx="22" cy="23.5" r="1.2" fill="#1E293B" />
        <circle cx="26" cy="23.5" r="1.2" fill="#1E293B" />
        <path d="M22.2 26.2 Q24 27.8 25.8 26.2" stroke="#1E293B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'shield-guard',
    name: 'Perisai Siber',
    colorId: 'green',
    bg: '#D1FADF',
    cardBg: '#ECFDF3',
    accent: '#059669',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#D1FADF" />
        <path d="M24 10 L36 15 V24 C36 32 30.5 37.5 24 40 C17.5 37.5 12 32 12 24 V15 L24 10 Z" fill="#22C55E" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M24 13.5 L32.5 17.2 V23.8 C32.5 29.8 28.5 34 24 36.2 C19.5 34 15.5 29.8 15.5 23.8 V17.2 L24 13.5 Z" fill="#FFFFFF" />
        {/* Cute Face */}
        <circle cx="20.5" cy="23" r="1.5" fill="#1E293B" />
        <circle cx="27.5" cy="23" r="1.5" fill="#1E293B" />
        <circle cx="18" cy="25" r="1.6" fill="#FDA4AF" />
        <circle cx="30" cy="25" r="1.6" fill="#FDA4AF" />
        <path d="M21.5 26.5 Q24 28.8 26.5 26.5" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'bear-algo',
    name: 'Beruang Algoritma',
    colorId: 'purple',
    bg: '#E9D5FF',
    cardBg: '#F3E8FF',
    accent: '#7C3AED',
    renderSvg: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#E9D5FF" />
        {/* Bear Ears */}
        <circle cx="14" cy="14" r="4.5" fill="#B45309" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="14" cy="14" r="2.2" fill="#FDE68A" />
        <circle cx="34" cy="14" r="4.5" fill="#B45309" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="34" cy="14" r="2.2" fill="#FDE68A" />
        {/* Bear Head */}
        <circle cx="24" cy="25" r="12.5" fill="#D97706" stroke="#1E293B" strokeWidth="1.7" />
        {/* Snout */}
        <ellipse cx="24" cy="28" rx="5.5" ry="4.2" fill="#FEF3C7" />
        <ellipse cx="24" cy="26.5" rx="2.2" ry="1.5" fill="#1E293B" />
        <path d="M22 29.2 Q24 31 26 29.2" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Eyes & Glasses */}
        <circle cx="19" cy="22" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.4" />
        <circle cx="29" cy="22" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.4" />
        <circle cx="19" cy="22" r="1.3" fill="#1E293B" />
        <circle cx="29" cy="22" r="1.3" fill="#1E293B" />
      </svg>
    ),
  },
];

export function getCustomIconsList() {
  try {
    const raw = localStorage.getItem(CUSTOM_ICONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomIconsList(list) {
  try {
    localStorage.setItem(CUSTOM_ICONS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getLocalCourseIconMap() {
  try {
    const raw = localStorage.getItem(COURSE_ICON_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalCourseIcon(courseId, iconId) {
  if (courseId === undefined || courseId === null) return;
  try {
    const key = String(courseId);
    const map = getLocalCourseIconMap();
    if (!iconId) {
      delete map[key];
    } else {
      map[key] = iconId;
    }
    localStorage.setItem(COURSE_ICON_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Encode/Decode `[VIZO_ICON:iconId]` inside `course.description` so it persists in DB
 */
export function extractIconFromDescription(description = '') {
  if (!description) return { iconId: null, cleanDescription: '' };
  const match = description.match(/\[VIZO_ICON:([^\]]+)\]/);
  const iconId = match ? match[1].trim() : null;
  const cleanDescription = description.replace(/\[VIZO_ICON:[^\]]+\]\s*/g, '').trim();
  return { iconId, cleanDescription };
}

export function embedIconInDescription(cleanDescription = '', iconId = null) {
  const cleaned = (cleanDescription || '').replace(/\[VIZO_ICON:[^\]]+\]\s*/g, '').trim();
  if (!iconId) return cleaned;
  return `[VIZO_ICON:${iconId}] ${cleaned}`.trim();
}

function getDeterministicCoursePresetIndex(course) {
  if (course?.id !== undefined && course?.id !== null) {
    const numId = Number(course.id);
    if (!Number.isNaN(numId)) {
      return Math.abs(numId) % PLAYFUL_AVATAR_PRESETS.length;
    }
  }
  const seed = String(course?.code || course?.name || '');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PLAYFUL_AVATAR_PRESETS.length;
}

function matchCourseSubjectIconId(course) {
  const text = `${course?.code || ''} ${course?.name || ''}`.toLowerCase();
  if (!text.trim()) return null;

  if (
    text.includes('pancasila') ||
    text.includes('kewarganegaraan') ||
    text.includes('pkn') ||
    text.includes('kwn')
  ) {
    return 'garuda-pancasila';
  }
  if (
    text.includes('algoritma') ||
    text.includes('struktur data') ||
    text.includes('alpro') ||
    text.includes('asd')
  ) {
    if (text.includes('1b') || text.includes('-b')) return 'cat-coder';
    if (text.includes('1c') || text.includes('-c')) return 'robo-ai';
    return 'algoritma-flow';
  }
  if (
    text.includes('matematika') ||
    text.includes('kalkulus') ||
    text.includes('aljabar') ||
    text.includes('statistik') ||
    text.includes('diskrit') ||
    text.includes('numerik')
  ) {
    if (text.includes('informatika') || text.includes('matif')) return 'brain-spark';
    return 'matematika-calc';
  }
  if (
    text.includes('fisika') ||
    text.includes('elektronika') ||
    text.includes('mekanika')
  ) {
    if (text.includes('1b') || text.includes('-b')) return 'kimia-lab';
    return 'fisika-atom';
  }
  if (text.includes('kimia') || text.includes('biokimia')) {
    return 'kimia-lab';
  }
  if (
    text.includes('indonesia') ||
    text.includes('bindo') ||
    text.includes('tata tulis') ||
    text.includes('karya ilmiah')
  ) {
    return 'bahasa-indo';
  }
  if (
    text.includes('inggris') ||
    text.includes('english') ||
    text.includes('toefl') ||
    text.includes('bing')
  ) {
    return 'bahasa-inggris';
  }
  if (
    text.includes('komputer') ||
    text.includes('arsitektur') ||
    text.includes('sistem operasi') ||
    text.includes('pti') ||
    text.includes('ptki') ||
    text.includes('peng. tekno') ||
    text.includes('pengantar teknologi')
  ) {
    if (text.includes(' b') || text.includes('-b')) return 'cyber-globe';
    if (text.includes(' c') || text.includes('-c')) return 'data-bot';
    return 'komputer-pc';
  }
  if (text.includes('basis data') || text.includes('database') || text.includes('sql')) {
    return 'data-bot';
  }
  if (text.includes('jaringan') || text.includes('network') || text.includes('web')) {
    return 'cyber-globe';
  }
  if (text.includes('keamanan') || text.includes('security') || text.includes('siber')) {
    return 'shield-guard';
  }
  return null;
}

export function resolveCourseAvatar(course) {
  const { iconId: dbIconId } = extractIconFromDescription(course?.description);
  const localMap = getLocalCourseIconMap();
  const courseKey = course?.id !== undefined && course?.id !== null ? String(course.id) : null;
  const chosenId = (courseKey ? localMap[courseKey] : null) || dbIconId;

  const customList = getCustomIconsList();
  const allIcons = [...PLAYFUL_AVATAR_PRESETS, ...customList];

  if (chosenId) {
    const found = allIcons.find((item) => item.id === chosenId);
    if (found) return found;
  }

  const matchedSubjectId = matchCourseSubjectIconId(course);
  if (matchedSubjectId) {
    const foundSubject = PLAYFUL_AVATAR_PRESETS.find((item) => item.id === matchedSubjectId);
    if (foundSubject) return foundSubject;
  }

  const presetIndex = getDeterministicCoursePresetIndex(course);
  return PLAYFUL_AVATAR_PRESETS[presetIndex];
}

/**
 * Playful Avatar Icon Component for Course Cards
 */
export default function CourseAvatarIcon({
  course,
  iconOverride = null,
  size = 'md',
  editable = false,
  onClickEdit,
}) {
  const resolved = iconOverride
    ? [...PLAYFUL_AVATAR_PRESETS, ...getCustomIconsList()].find(
        (i) => i.id === iconOverride
      ) || resolveCourseAvatar(course)
    : resolveCourseAvatar(course);

  const sizeClasses =
    size === 'lg'
      ? 'w-[52px] h-[52px] rounded-[14px]'
      : size === 'sm'
      ? 'w-[40px] h-[40px] rounded-[10px]'
      : 'w-[44px] h-[44px] rounded-[12px]';

  const content = resolved.renderSvg ? (
    resolved.renderSvg()
  ) : (
    <div
      className="w-full h-full flex items-center justify-center text-[22px] select-none"
      style={{ backgroundColor: resolved.bg || '#CFE2FF' }}
    >
      {resolved.emoji || '🎓'}
    </div>
  );

  if (editable && onClickEdit) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClickEdit(course, resolved);
        }}
        title="Klik untuk ganti / kelola icon mata kuliah"
        className={`relative ${sizeClasses} overflow-hidden shrink-0 border border-black/5 shadow-sm group/icon focus:outline-none transition-transform hover:scale-105`}
      >
        {content}
        <span className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover/icon:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Edit3 className="w-3.5 h-3.5" />
        </span>
      </button>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses} overflow-hidden shrink-0 border border-black/5 shadow-sm`}
    >
      {content}
    </div>
  );
}

/**
 * Full CRUD Modal for Managing & Selecting Playful Course Avatar Icons
 */
export function CourseIconCrudModal({
  open,
  course,
  selectedIconId,
  onClose,
  onSaveIcon,
  saving = false,
}) {
  const [customIcons, setCustomIcons] = useState(() => getCustomIconsList());
  const [activeId, setActiveId] = useState(selectedIconId || 'robo-ai');

  // CRUD Form State for Custom Playful Icon
  const [formMode, setFormMode] = useState(null); // null | 'CREATE' | 'EDIT'
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🦊');
  const [customColorId, setCustomColorId] = useState('yellow');

  useEffect(() => {
    if (open) {
      setCustomIcons(getCustomIconsList());
      const resolvedAvatar = resolveCourseAvatar(course);
      setActiveId(selectedIconId || resolvedAvatar.id);
      setFormMode(null);
    }
  }, [open, course, selectedIconId]);

  if (!open) return null;

  const EMOJI_SUGGESTIONS = [
    '🦊',
    '🐼',
    '🦁',
    '🐸',
    '🦄',
    '🐙',
    '🦋',
    '🦖',
    '👾',
    '🤖',
    '🚀',
    '⚡',
    '🎨',
    '🧬',
    '📐',
    '🌐',
  ];

  const handleStartCreate = () => {
    setFormMode('CREATE');
    setEditingCustomId(null);
    setCustomName('');
    setCustomEmoji('🦊');
    setCustomColorId('yellow');
  };

  const handleStartEditCustom = (item) => {
    setFormMode('EDIT');
    setEditingCustomId(item.id);
    setCustomName(item.name);
    setCustomEmoji(item.emoji || '🦊');
    setCustomColorId(item.colorId || 'yellow');
  };

  const handleSaveCustomForm = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const colorObj =
      PASTEL_COLOR_OPTIONS.find((c) => c.id === customColorId) ||
      PASTEL_COLOR_OPTIONS[0];

    if (formMode === 'CREATE') {
      const newItem = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        emoji: customEmoji || '🎓',
        colorId: colorObj.id,
        bg: colorObj.bg,
        cardBg: colorObj.cardBg,
        accent: colorObj.accent,
        isCustom: true,
      };
      const next = [...customIcons, newItem];
      setCustomIcons(next);
      saveCustomIconsList(next);
      setActiveId(newItem.id);
    } else if (formMode === 'EDIT' && editingCustomId) {
      const next = customIcons.map((item) =>
        item.id === editingCustomId
          ? {
              ...item,
              name: customName.trim(),
              emoji: customEmoji || '🎓',
              colorId: colorObj.id,
              bg: colorObj.bg,
              cardBg: colorObj.cardBg,
              accent: colorObj.accent,
            }
          : item
      );
      setCustomIcons(next);
      saveCustomIconsList(next);
      setActiveId(editingCustomId);
    }

    setFormMode(null);
    setEditingCustomId(null);
  };

  const handleDeleteCustom = (id) => {
    const next = customIcons.filter((item) => item.id !== id);
    setCustomIcons(next);
    saveCustomIconsList(next);
    if (activeId === id) {
      setActiveId(PLAYFUL_AVATAR_PRESETS[0].id);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <CourseAvatarIcon
              course={course}
              iconOverride={activeId}
              size="md"
            />
            <div>
              <h2 className="text-[16px] font-bold text-[#1E293B]">
                Kelola Icon Avatar Mata Kuliah
              </h2>
              <p className="text-[12px] text-[#64748B]">
                {course?.name
                  ? `Pilih atau buat icon playful untuk "${course.name}"`
                  : 'Pilih karakter avatar atau kelola koleksi icon custom'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Preset Playful Avatar Icons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-[#1E293B] uppercase tracking-wider">
              Koleksi Avatar Playful ({PLAYFUL_AVATAR_PRESETS.length})
            </label>
            <button
              type="button"
              onClick={() => onSaveIcon(null)}
              className="text-[11.5px] font-semibold text-[#64748B] hover:text-[#1D63FF] inline-flex items-center gap-1"
              title="Reset ke icon otomatis"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {PLAYFUL_AVATAR_PRESETS.map((preset) => {
              const isSelected = activeId === preset.id;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setActiveId(preset.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all relative ${
                    isSelected
                      ? 'bg-[#EAF2FF] border-[#1D63FF] ring-2 ring-[#1D63FF]/20'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-black/5">
                    {preset.renderSvg()}
                  </div>
                  <span className="text-[11px] font-semibold text-[#1E293B] truncate w-full">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1D63FF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Playful Icons (CRUD: Create, Read, Update, Delete) */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[12px] font-bold text-[#1E293B] uppercase tracking-wider block">
                Icon Avatar Custom ({customIcons.length})
              </label>
              <p className="text-[11px] text-[#64748B]">
                Buat, ubah, atau hapus karakter icon mata kuliah kustom kamu sendiri
              </p>
            </div>

            {!formMode && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#CFE2FF] text-[#1D63FF] text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Icon Baru</span>
              </button>
            )}
          </div>

          {/* Create / Edit Custom Icon Form */}
          {formMode && (
            <form
              onSubmit={handleSaveCustomForm}
              className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#CFE2FF] space-y-3.5 text-[12.5px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1D63FF] text-[12px] uppercase">
                  {formMode === 'CREATE'
                    ? 'Buat Icon Playful Baru'
                    : 'Ubah Icon Playful Custom'}
                </span>
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="text-[11px] font-semibold text-[#64748B] hover:text-[#E11D48]"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1E293B] mb-1">
                    Nama Karakter / Icon
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rubah Siber"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1E293B] mb-1">
                    Simbol / Karakter Emoji
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#1D63FF] focus:outline-none text-center text-[16px]"
                  />
                </div>
              </div>

              {/* Quick Emoji Picker */}
              <div>
                <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                  Pilih Karakter Playful Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_SUGGESTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setCustomEmoji(em)}
                      className={`w-8 h-8 rounded-lg text-[16px] flex items-center justify-center border transition-all ${
                        customEmoji === em
                          ? 'bg-[#1D63FF] border-[#1D63FF] scale-110'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pastel Background Theme Picker */}
              <div>
                <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                  Warna Latar Pastel:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PASTEL_COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCustomColorId(c.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
                        customColorId === c.id
                          ? 'border-[#1E293B] bg-white shadow-sm'
                          : 'border-transparent bg-white/60 text-[#64748B]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: c.bg }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors"
                >
                  {formMode === 'CREATE' ? 'Simpan ke Koleksi' : 'Perbarui Icon'}
                </button>
              </div>
            </form>
          )}

          {/* Custom Icons Grid */}
          {customIcons.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center text-[12px] text-[#64748B]">
              Belum ada icon custom. Klik <strong>+ Tambah Icon Baru</strong> untuk membuat karakter matkul sendiri.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {customIcons.map((item) => {
                const isSelected = activeId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-2 cursor-pointer transition-all relative group ${
                      isSelected
                        ? 'bg-[#EAF2FF] border-[#1D63FF] ring-2 ring-[#1D63FF]/20'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shadow-sm border border-black/5"
                      style={{ backgroundColor: item.bg }}
                    >
                      {item.emoji}
                    </div>
                    <span className="text-[11px] font-semibold text-[#1E293B] truncate w-full">
                      {item.name}
                    </span>

                    {/* Edit & Delete Actions on Custom Icon */}
                    <div
                      className="flex items-center gap-1 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleStartEditCustom(item)}
                        className="p-1 rounded bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1D63FF]"
                        title="Edit Icon Custom"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(item.id)}
                        className="p-1 rounded bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#E11D48]"
                        title="Hapus Icon Custom"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => onSaveIcon(activeId)}
            className="px-5 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Gunakan Icon Ini'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
