export interface OpenSanctionsEntity {
  id: string;
  caption: string;
  schema: string;
  properties: {
    name: string[];
    alias?: string[];
    country?: string[];
    birthDate?: string[];
    topics?: string[];
  };
  datasets: string[];
  score: number;
}

export interface OpenSanctionsDataset {
  name: string;
  title: string;
}

export interface OpenSanctionsResponse {
  results: OpenSanctionsEntity[];
  total: { value: number };
  datasets: OpenSanctionsDataset[];
}
