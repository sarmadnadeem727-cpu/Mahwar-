export const formatYahooFundamentalsToModel = (fundamentals: any) => {
  if (!fundamentals) return null;

  const { incomeStatement, balanceSheet, cashFlow, financialData, keyStatistics } = fundamentals;

  // We need the most recent data
  const latestIS = incomeStatement?.[0] || {};
  const latestBS = balanceSheet?.[0] || {};
  const latestCF = cashFlow?.[0] || {};

  return {
    revenue: latestIS.totalRevenue || 0,
    costOfRevenue: latestIS.costOfRevenue || 0,
    grossProfit: latestIS.grossProfit || 0,
    operatingExpenses: latestIS.operatingExpense || 0,
    ebit: latestIS.ebit || latestIS.operatingIncome || 0,
    ebitda: latestIS.ebitda || latestIS.normalizedEBITDA || 0,
    netIncome: latestIS.netIncome || 0,
    taxProvision: latestIS.taxProvision || 0,
    interestExpense: latestIS.interestExpense || 0,

    totalAssets: latestBS.totalAssets || 0,
    totalLiabilities: latestBS.totalLiabilitiesNetMinorityInterest || latestBS.totalLiabilities || 0,
    totalDebt: latestBS.totalDebt || financialData?.totalDebt || 0,
    cashAndEquivalents: latestBS.cashAndCashEquivalents || financialData?.totalCash || 0,
    totalEquity: latestBS.stockholdersEquity || latestBS.totalEquityGrossMinorityInterest || 0,

    operatingCashFlow: latestCF.operatingCashFlow || financialData?.operatingCashflow || 0,
    capitalExpenditures: latestCF.capitalExpenditure || 0,
    freeCashFlow: latestCF.freeCashFlow || financialData?.freeCashflow || 0,

    sharesOutstanding: keyStatistics?.sharesOutstanding || 0,
    currentPrice: financialData?.currentPrice || 0,
  };
};

