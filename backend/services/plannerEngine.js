/**
 * Investment Planning Calculation Engine
 * Generates tailored asset allocation models, SIP distributions, and wealth projections.
 */

export const ASSET_MODELS = {
  Conservative: {
    title: 'Conservative Wealth Preservation',
    description: 'Prioritizes safety of principal with low volatility and stable recurring income.',
    blendedReturn: 7.2,
    allocation: [
      {
        assetClass: 'Government & Corporate Bonds',
        category: 'Debt',
        percentage: 55,
        expectedReturn: 6.8,
        color: '#3b82f6',
        description: 'High-grade debt instruments offering stable, predictable yields.'
      },
      {
        assetClass: 'Large-Cap Index Equities',
        category: 'Equity',
        percentage: 20,
        expectedReturn: 10.5,
        color: '#10b981',
        description: 'Top-tier blue-chip companies for steady equity participation.'
      },
      {
        assetClass: 'Gold & Precious Metals',
        category: 'Commodities',
        percentage: 15,
        expectedReturn: 8.0,
        color: '#f59e0b',
        description: 'Hedge against currency devaluation and inflation surges.'
      },
      {
        assetClass: 'Liquid Cash & Short-Term Treasuries',
        category: 'Cash',
        percentage: 10,
        expectedReturn: 4.5,
        color: '#64748b',
        description: 'Instant liquidity for rebalancing and near-term security.'
      }
    ]
  },
  Moderate: {
    title: 'Balanced Growth Strategy',
    description: 'Strikes an optimal balance between market growth and downside cushioning.',
    blendedReturn: 10.4,
    allocation: [
      {
        assetClass: 'Large-Cap & Core Index Funds',
        category: 'Equity',
        percentage: 35,
        expectedReturn: 12.0,
        color: '#10b981',
        description: 'Foundation for steady long-term capital compounding.'
      },
      {
        assetClass: 'Mid-Cap Growth Funds',
        category: 'Equity',
        percentage: 20,
        expectedReturn: 14.0,
        color: '#06b6d4',
        description: 'Emerging market leaders with superior expansion potential.'
      },
      {
        assetClass: 'Fixed Income & Bond Funds',
        category: 'Debt',
        percentage: 30,
        expectedReturn: 7.2,
        color: '#3b82f6',
        description: 'Provides stability and portfolio buffering against equity pullbacks.'
      },
      {
        assetClass: 'Gold & Sovereign Commodities',
        category: 'Commodities',
        percentage: 10,
        expectedReturn: 8.0,
        color: '#f59e0b',
        description: 'Portfolio diversifier and systemic market hedge.'
      },
      {
        assetClass: 'Liquid Reserves',
        category: 'Cash',
        percentage: 5,
        expectedReturn: 4.5,
        color: '#64748b',
        description: 'Readily accessible reserves for tactical market opportunities.'
      }
    ]
  },
  Aggressive: {
    title: 'High-Alpha Capital Expansion',
    description: 'Maximizes long-term compound wealth through concentrated equity allocation.',
    blendedReturn: 13.2,
    allocation: [
      {
        assetClass: 'Large-Cap Index & Blue-chips',
        category: 'Equity',
        percentage: 35,
        expectedReturn: 12.0,
        color: '#10b981',
        description: 'High liquidity enterprise equities.'
      },
      {
        assetClass: 'Mid & Small-Cap High Growth',
        category: 'Equity',
        percentage: 35,
        expectedReturn: 16.0,
        color: '#8b5cf6',
        description: 'High-beta market opportunities with exponential upside.'
      },
      {
        assetClass: 'International & Thematic Tech Equities',
        category: 'Equity',
        percentage: 15,
        expectedReturn: 13.5,
        color: '#ec4899',
        description: 'Global innovation and technology exposure.'
      },
      {
        assetClass: 'High-Yield Debt & Dynamic Bonds',
        category: 'Debt',
        percentage: 10,
        expectedReturn: 8.5,
        color: '#3b82f6',
        description: 'Opportunistic credit yield.'
      },
      {
        assetClass: 'Gold & Alternatives',
        category: 'Commodities',
        percentage: 5,
        expectedReturn: 8.0,
        color: '#f59e0b',
        description: 'Selective alternative asset exposure.'
      }
    ]
  }
};

/**
 * Calculate future projections using compound interest with regular monthly SIP
 * @param {number} initialLumpSum 
 * @param {number} monthlyContribution 
 * @param {number} annualReturnRate 
 * @param {number[]} milestoneYears 
 */
export const calculateProjections = (
  initialLumpSum = 0,
  monthlyContribution = 0,
  annualReturnRate = 10,
  milestoneYears = [1, 3, 5, 10, 15, 20, 25, 30]
) => {
  const monthlyRate = annualReturnRate / 100 / 12;

  return milestoneYears.map((years) => {
    const months = years * 12;
    const totalPrincipal = Math.round(initialLumpSum + monthlyContribution * months);

    let futureValue = 0;
    if (monthlyRate > 0) {
      const lumpSumFV = initialLumpSum * Math.pow(1 + monthlyRate, months);
      const sipFV =
        monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
      futureValue = Math.round(lumpSumFV + sipFV);
    } else {
      futureValue = totalPrincipal;
    }

    const wealthGained = Math.max(0, futureValue - totalPrincipal);

    return {
      years,
      totalInvested: totalPrincipal,
      futureValue,
      wealthGained
    };
  });
};

/**
 * Generate full investment plan for a given financial profile and goals
 */
export const generatePlan = (profile, goals = []) => {
  const riskTolerance = profile?.riskProfile?.tolerance || 'Moderate';
  const model = ASSET_MODELS[riskTolerance] || ASSET_MODELS.Moderate;
  const monthlySavings = profile?.calculatedMetrics?.monthlySavings || 0;
  const existingInvestments = profile?.currentSavings?.existingInvestments || 0;

  // Breakdown of monthly contribution per asset class
  const allocationWithAmounts = model.allocation.map((item) => {
    const monthlyAmount = Math.round((monthlySavings * item.percentage) / 100);
    return {
      ...item,
      monthlyAmount
    };
  });

  // Calculate projections based on profile's disposable savings
  const projections = calculateProjections(
    existingInvestments,
    monthlySavings,
    model.blendedReturn
  );

  // Goal feasibility calculation
  const totalGoalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalGoalCurrent = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalRequiredMonthlySIP = goals.reduce(
    (acc, g) => acc + (g.monthlyRequiredSavings || 0),
    0
  );

  const goalFundingStatus = {
    totalGoalTarget,
    totalGoalCurrent,
    totalRequiredMonthlySIP,
    surplusOrDeficit: monthlySavings - totalRequiredMonthlySIP,
    isFullyFundable: monthlySavings >= totalRequiredMonthlySIP
  };

  return {
    strategyName: model.title,
    riskTolerance,
    description: model.description,
    blendedAnnualReturn: model.blendedReturn,
    monthlySavingsBudget: monthlySavings,
    assetAllocation: allocationWithAmounts,
    projections,
    goalFundingStatus
  };
};
