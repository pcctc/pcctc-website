import yaml from 'js-yaml';

// Inline every YAML data file at build time (no runtime fs access).
const raw = import.meta.glob('../data/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function load<T>(name: string): T {
  const key = Object.keys(raw).find((k) => k.endsWith(`/${name}`));
  if (!key) throw new Error(`Data file not found: ${name}`);
  return yaml.load(raw[key]) as T;
}

export interface Service {
  slug: string;
  title: string;
  summary: string;
  points: string[];
}

export interface Study {
  title: string;
  nct?: string;
  url?: string;
  phase?: string;
  note?: string;
  /** Disease area; renderers default to "Prostate cancer" when absent. */
  condition?: string;
  /** Accrual status as the PCCTC Project Matrix records it, e.g. "Open to accrual". */
  status?: string;
}

export interface EngagementModel {
  title: string;
  summary: string;
  points: string[];
}

export interface Registry {
  name: string;
  condition: string;
  /** e.g. "Active" | "In development" — kept as string for YAML friendliness. */
  status: string;
  description: string;
  nct?: string;
  url?: string;
  /** Active substudies, listed on /registries under the platform text. */
  substudies?: { title: string; status?: string }[];
}

export interface Leader {
  name: string;
  credentials?: string;
  role: string;
  photo?: string;
  /** Optional short bio; line breaks become paragraphs. Cards without one aren't expandable. */
  bio?: string;
}

export interface CommitteeMember {
  name: string;
  institution: string;
  chair?: boolean;
}

export interface Publication {
  authors: string;
  title: string;
  journal: string;
  year: number | string;
  url: string;
}

export interface WorkingGroup {
  id: string;
  name: string;
  abbr: string;
  body: string;
  /** Optional; new groups may not have publications yet. */
  publications?: Publication[];
}

export interface ExpertiseSection {
  id: string;
  title: string;
  body: string;
}

export interface Principle {
  title: string;
  body: string;
}

export const services = () => load<Service[]>('services.yaml');
export const engagementModels = () => load<EngagementModel[]>('engagement-models.yaml');
export const registries = () => load<Registry[]>('registries.yaml');
export const featuredStudies = () => load<Study[]>('studies-featured.yaml');
export const activeStudies = () => load<Study[]>('studies-active.yaml');
export const leadership = () => load<Leader[]>('leadership.yaml');
export const committee = () => load<CommitteeMember[]>('committee.yaml');
export const workingGroups = () => load<WorkingGroup[]>('working-groups.yaml');
export const sites = () =>
  load<{ domestic: string[]; international: string[] }>('sites.yaml');
export const stats = () => load<{ value: string; label: string }[]>('stats.yaml');
export const expertise = () => load<ExpertiseSection[]>('expertise.yaml');
export const principles = () => load<Principle[]>('guiding-principles.yaml');

// Long-form text fields are edited in a plain textarea (Pages CMS `text` field); each
// line break there is a paragraph break on the page.
export const paragraphs = (text: string) =>
  text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
