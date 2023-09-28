export const extractKPIValue = (
  year: string,
  month: string,
  yearData: any[],
  monthData: any
): number | null => {
  const monthDataYears = Object.keys(monthData);
  const isInMonthData = monthDataYears.includes(year);

  if (isInMonthData && month) {
    const yearDataObj = monthData[year as keyof typeof monthData];
    const monthDataObj = yearDataObj.find(
      (data: any) => data.label.toLowerCase() === month.toLowerCase()
    );
    if (monthDataObj && monthDataObj.monthKPI !== null) {
      return monthDataObj.monthKPI;
    }

    const nextNonNullMonthData = yearDataObj.find(
      (data: any) => data.monthKPI !== null
    );
    return nextNonNullMonthData ? nextNonNullMonthData.monthKPI : null;
  } else {
    const yearDataObj = yearData.find((data: any) => data.year === year);
    return yearDataObj ? yearDataObj.yearKPI : null;
  }
};

export const calculateChanges = (
  amount: number,
  fromDateKPI: number,
  toDateKPI: number
) => {
  const pointChange = Math.round(toDateKPI - fromDateKPI);
  const percentageChange = Math.round((pointChange * 100) / fromDateKPI);
  const newAmount = Math.round((amount * toDateKPI) / fromDateKPI);

  return { percentageChange, newAmount };
};

export const getChartData = (
  yearData: any[],
  fromYear: string,
  toYear: string
) => {
  return yearData.reduce((data: any[], year: any) => {
    const yearValue = year.year;
    if (
      (parseInt(fromYear) <= parseInt(toYear) &&
        parseInt(yearValue) >= parseInt(fromYear) &&
        parseInt(yearValue) <= parseInt(toYear)) ||
      (parseInt(fromYear) > parseInt(toYear) &&
        parseInt(yearValue) >= parseInt(toYear) &&
        parseInt(yearValue) <= parseInt(fromYear))
    ) {
      data.push({
        label: yearValue,
        yearKPI: year.yearKPI,
      });
    }
    return data;
  }, []);
};
