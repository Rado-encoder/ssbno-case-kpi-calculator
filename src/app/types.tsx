export interface KpiDataResponse {
  yearData: { year: string; yearKPI: number }[];
  monthData: { [year: string]: MonthData[] };
}

export interface YearKpiData {
  dataset: {
    dimension: {
      ContentsCode: {
        label: string;
        category: {
          index: {
            KpiAar: number;
          };
          label: {
            KpiAar: string;
          };
          unit: {
            KpiAar: {
              base: string;
              decimals: number;
            };
          };
        };
        link: {
          describedby: {
            extension: {
              KpiAar: string;
            };
          }[];
        };
        extension: {
          show: string;
        };
      };
      Tid: {
        label: string;
        category: {
          index: {
            [key: string]: number;
          };
          label: {
            [key: string]: string;
          };
        };
        extension: {
          show: string;
        };
      };
    };
    label: string;
    source: string;
    updated: string;
    value: number[];
    extension: {
      px: {
        infofile: string;
        tableid: string;
        decimals: number;
      };
    };
  };
}

export interface MonthKpiData {
  dataset: {
    status: {
      [key: string]: string;
    };
    dimension: {
      Maaned: {
        label: string;
        category: {
          index: {
            [key: string]: number;
          };
          label: {
            [key: string]: string;
          };
        };
        extension: {
          show: string;
        };
      };
      ContentsCode: {
        label: string;
        category: {
          index: {
            [key: string]: number;
          };
          label: {
            [key: string]: string;
          };
          unit: {
            [key: string]: {
              base: string;
              decimals: number;
            };
          };
        };
        link: {
          describedby: {
            extension: {
              [key: string]: string;
            };
          }[];
        };
        extension: {
          show: string;
        };
      };
      Tid: {
        label: string;
        category: {
          index: {
            [key: string]: number;
          };
          label: {
            [key: string]: string;
          };
        };
        extension: {
          show: string;
        };
      };
    };
    id: string[];
    size: number[];
    role: {
      metric: string[];
      time: string[];
    };
    value: (number | null)[];
  };
  label: string;
  source: string;
  updated: string;
}

export interface MonthData {
  month: string;
  label: string;
  monthKPI: number | null;
}

export interface Option {
  label: string;
}
