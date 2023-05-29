import axios from 'axios';

const kpiYearDatasetURL = 'https://data.ssb.no/api/v0/no/table/08184';
const kpiYearQuery = {
  query: [
    {
      code: 'ContentsCode',
      selection: {
        filter: 'item',
        values: ['KpiAar'],
      },
    },
    {
      code: 'Tid',
      selection: {
        filter: 'all',
        values: ['*'],
      },
    },
  ],
  response: {
    format: 'json-stat',
  },
};

export async function fetchKpiYearData() {
  try {
    const response = await axios.post(
      kpiYearDatasetURL,
      JSON.stringify(kpiYearQuery),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const responseData = response.data;
    const cleanedData = cleanYearData(responseData); // Process the response data
    return cleanedData; // Return the cleaned data
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching KPI year data.');
  }
}

const kpiMonthDatasetURL = 'https://data.ssb.no/api/v0/no/table/08981';
const kpiMonthQuery = {
  query: [
    {
      code: 'Maaned',
      selection: {
        filter: 'all',
        values: ['*'],
      },
    },
    {
      code: 'ContentsCode',
      selection: {
        filter: 'item',
        values: ['KpiIndMnd'],
      },
    },
    {
      code: 'Tid',
      selection: {
        filter: 'all',
        values: ['*'],
      },
    },
  ],
  response: {
    format: 'json-stat',
  },
};

export async function fetchKpiMonthData() {
  try {
    const response = await axios.post(
      kpiMonthDatasetURL,
      JSON.stringify(kpiMonthQuery),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const responseData = response.data;
    const cleanedData = cleanMonthData(responseData); // Process the response data
    return cleanedData; // Return the cleaned data
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching KPI month data.');
  }
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

interface MonthData {
  month: string;
  label: string;
  monthKPI: number | null;
}


const cleanYearData = (data: YearKpiData): { year: string; yearKPI: number }[] => {
  const { value } = data.dataset;
  const { index } = data.dataset.dimension.Tid.category;

  return Object.keys(index).map((year) => ({
    year,
    yearKPI: value[index[year]],
  }));
};

const cleanMonthData = (data: MonthKpiData): { [year: string]: MonthData[] } => {
  const { value } = data.dataset;
  const { index } = data.dataset.dimension.Tid.category;
  const { label } = data.dataset.dimension.Maaned.category;

  const kpiByYear: { [year: string]: MonthData[] } = {};

  let yearIndex = 0;
  let monthIndex = 0;

  while (yearIndex < Object.keys(index).length) {
    const yearData: MonthData[] = [];

    for (const month in label) {
      if (monthIndex >= value.length) {
        // All values from the "value" array have been assigned
        break;
      }

      const monthKPIValue = value[monthIndex] !== null ? value[monthIndex] : null;

      const monthData: MonthData = {
        month,
        label: label[month],
        monthKPI: monthKPIValue,
      };

      yearData.push(monthData);

      monthIndex++;
    }

    kpiByYear[parseInt(Object.keys(index)[yearIndex])] = yearData;
    yearIndex++;
  }

  return kpiByYear;
};


