export interface ResumeTheme {
  id: string;
  name: string;
  description: string;
  layout: 'single' | 'two-column';
  badge?: 'recommended' | 'new';
  accentColor: string;
  headerStyle: 'plain' | 'dark-banner' | 'color-banner' | 'sidebar-dark';
  headingStyle: 'underline' | 'bar' | 'boxed-label' | 'caps-plain';
  fontHeading: string;
  fontBody: string;
  sidebarPosition?: 'left' | 'right';
}
