import { ResumeTheme } from '@/types/resumeTheme';

export const RESUME_THEMES: ResumeTheme[] = [
  // --- Single Column Themes ---
  { id: 'classic-elegant', name: 'Classic Elegant', description: 'Single column', layout: 'single', badge: 'recommended', accentColor: '#1a1a1a', headerStyle: 'plain', headingStyle: 'underline', fontHeading: 'Times-Bold', fontBody: 'Times-Roman' },
  { id: 'clean-minimal', name: 'Clean Minimal', description: 'Single column', layout: 'single', accentColor: '#1a1a1a', headerStyle: 'plain', headingStyle: 'underline', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'white-black-modern', name: 'White & Black Modern', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#111111', headerStyle: 'plain', headingStyle: 'caps-plain', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'black-white-clean', name: 'Black & White Clean', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#000000', headerStyle: 'plain', headingStyle: 'bar', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'yellow-black-modern', name: 'Yellow & Black Modern', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#ca8a04', headerStyle: 'plain', headingStyle: 'boxed-label', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'navy-header-corporate', name: 'Navy Header Corporate', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#1e3a8a', headerStyle: 'dark-banner', headingStyle: 'underline', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'blue-label-row', name: 'Blue Label Row', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#2563eb', headerStyle: 'plain', headingStyle: 'boxed-label', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'blue-geometric-ux', name: 'Blue Geometric UX', description: 'Single column', layout: 'single', badge: 'new', accentColor: '#3b82f6', headerStyle: 'plain', headingStyle: 'underline', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'emerald-green-executive', name: 'Emerald Executive', description: 'Single column', layout: 'single', accentColor: '#047857', headerStyle: 'plain', headingStyle: 'bar', fontHeading: 'Times-Bold', fontBody: 'Times-Roman' },
  { id: 'purple-tech-lead', name: 'Purple Tech Lead', description: 'Single column', layout: 'single', accentColor: '#6d28d9', headerStyle: 'dark-banner', headingStyle: 'caps-plain', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'amber-startup', name: 'Amber Startup', description: 'Single column', layout: 'single', accentColor: '#b45309', headerStyle: 'plain', headingStyle: 'boxed-label', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'crimson-classic', name: 'Crimson Classic', description: 'Single column', layout: 'single', accentColor: '#9f1239', headerStyle: 'plain', headingStyle: 'underline', fontHeading: 'Times-Bold', fontBody: 'Times-Roman' },
  
  // --- Two Column Themes ---
  { id: 'blue-gray-cv', name: 'Blue & Gray CV', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#1e3a8a', headerStyle: 'sidebar-dark', headingStyle: 'bar', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'black-minimalist', name: 'Black Minimalist', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#111111', headerStyle: 'plain', headingStyle: 'caps-plain', sidebarPosition: 'right', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'gray-header-modern', name: 'Gray Header Modern', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#475569', headerStyle: 'color-banner', headingStyle: 'underline', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'bold-2col-divider', name: 'Bold 2-Col Divider', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#111111', headerStyle: 'plain', headingStyle: 'bar', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'circle-timeline', name: 'Circle Timeline', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#000000', headerStyle: 'plain', headingStyle: 'caps-plain', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'navy-sales-2col', name: 'Navy Sales 2-Col', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#1e1b4b', headerStyle: 'dark-banner', headingStyle: 'underline', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'blue-data-scientist', name: 'Blue Data Scientist', description: 'Two column', layout: 'two-column', badge: 'new', accentColor: '#1d4ed8', headerStyle: 'plain', headingStyle: 'bar', sidebarPosition: 'right', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'ruby-red-creative', name: 'Ruby Red Creative', description: 'Two column', layout: 'two-column', accentColor: '#be123c', headerStyle: 'sidebar-dark', headingStyle: 'underline', sidebarPosition: 'right', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' },
  { id: 'slate-professional', name: 'Slate Professional', description: 'Two column', layout: 'two-column', accentColor: '#334155', headerStyle: 'sidebar-dark', headingStyle: 'bar', sidebarPosition: 'left', fontHeading: 'Helvetica-Bold', fontBody: 'Helvetica' }
];
