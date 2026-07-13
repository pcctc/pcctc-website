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
}

export interface Leader {
  name: string;
  credentials?: string;
  role: string;
  photo?: string;
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
  publications: Publication[];
}

export const services = () => load<Service[]>('services.yaml');
export const featuredStudies = () => load<Study[]>('studies-featured.yaml');
export const activeStudies = () => load<Study[]>('studies-active.yaml');
export const leadership = () => load<Leader[]>('leadership.yaml');
export const committee = () => load<CommitteeMember[]>('committee.yaml');
export const workingGroups = () => load<WorkingGroup[]>('working-groups.yaml');
export const sites = () =>
  load<{ domestic: string[]; international: string[] }>('sites.yaml');
export const stats = () => load<{ value: string; label: string }[]>('stats.yaml');
