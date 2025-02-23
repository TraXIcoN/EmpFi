import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_investment_portfolio_data():
    # Read existing FRED and Census data for realistic baseline patterns
    fred_data = pd.read_csv('API_scripts/Fred/employment.csv')
    census_data = pd.read_csv('DataCollection/census_data_csv/census_data_county_2014.csv')
    
    # Generate date range from 1990 to 2023 (monthly)
    date_range = pd.date_range(start='1990-01-01', end='2023-12-31', freq='M')
    
    # Create synthetic companies
    companies = [
        'TechGrowth Fund', 'GreenEnergy Portfolio', 'HealthCare Innovation',
        'Infrastructure Development', 'Consumer Retail Index', 'Financial Services Group',
        'Real Estate Investment Trust', 'Manufacturing Excellence', 'Agricultural Resources',
        'Transportation & Logistics'
    ]
    
    # Create base economic factors from FRED data patterns
    unemployment = fred_data['Unemployment_Rate'].dropna()
    labor_participation = fred_data['Labor_Force_Participation'].dropna()
    
    data_frames = []
    
    # Generate data for each state and county
    for state_fips in range(1, 57):  # US state FIPS codes
        if state_fips in [3, 7, 11, 14, 43, 52]:  # Skip invalid FIPS codes
            continue
            
        # Generate state-level trends with realistic correlations
        state_economic_factor = np.random.normal(1, 0.2)  # State-specific economic multiplier
        
        for county_fips in range(1, 200):  # Simplified county range
            county_id = f"{state_fips:02d}{county_fips:03d}"
            
            # County-specific characteristics
            county_growth_factor = np.random.normal(1, 0.15)
            population_factor = np.random.uniform(0.8, 1.2)
            
            for company in companies:
                # Base performance pattern with realistic market behavior
                base_trend = np.cumsum(np.random.normal(0.004, 0.025, len(date_range)))
                
                # Add non-periodic patterns with varying amplitudes
                irregular_cycles = (
                    0.15 * np.sin(np.arange(len(date_range)) * 2 * np.pi / np.random.uniform(8, 16, len(date_range))) +
                    0.1 * np.sin(np.arange(len(date_range)) * 2 * np.pi / np.random.uniform(20, 30, len(date_range)))
                )
                
                # Add economic indicator influences with stronger impact
                economic_impact = (
                    0.4 * np.random.normal(0, 0.12, len(date_range)) +
                    -0.3 * np.interp(np.arange(len(date_range)), 
                                   np.arange(len(unemployment)), 
                                   unemployment.values)
                )
                
                # Generate portfolio values with realistic patterns
                portfolio_values = 100 * np.exp(
                    base_trend + 
                    irregular_cycles + 
                    economic_impact * state_economic_factor * county_growth_factor
                )
                
                # Add major historical financial crises and events
                crisis_points = [
                    (24, 0.85, 18),    # 1991-1992 Recession
                    (104, 0.75, 24),   # 2000-2001 Dot-com bubble
                    (130, 0.85, 12),   # 9/11 Impact
                    (226, 0.55, 30),   # 2008-2009 Financial Crisis
                    (362, 0.70, 6),    # 2020 COVID-19 Crash
                    (384, 0.85, 12),   # 2022 Market Correction
                ]
                
                for month, severity, recovery_period in crisis_points:
                    if month < len(portfolio_values):
                        # Initial sharp decline
                        crash_impact = np.random.uniform(severity-0.1, severity+0.1)
                        portfolio_values[month:month+3] *= np.linspace(1, crash_impact, 3)
                        
                        # Recovery pattern with varying speeds
                        recovery = np.linspace(crash_impact, 1 + np.random.uniform(0.1, 0.3), recovery_period)
                        recovery = recovery * (1 + np.random.normal(0, 0.02, recovery_period))  # Add noise
                        
                        if month + 3 + recovery_period <= len(portfolio_values):
                            portfolio_values[month+3:month+3+recovery_period] *= recovery
                
                # Create DataFrame for this combination
                df = pd.DataFrame({
                    'date': date_range,
                    'state_fips': state_fips,
                    'county_fips': county_id,
                    'company': company,
                    'portfolio_value': portfolio_values,
                    'volume': np.random.uniform(50000, 200000, len(date_range)) * population_factor,
                    'volatility': np.abs(np.random.normal(0.15, 0.05, len(date_range))),
                    'dividend_yield': np.maximum(0, np.random.normal(0.02, 0.005, len(date_range))),
                    'market_cap': portfolio_values * np.random.uniform(1e6, 1e9),
                    'pe_ratio': np.maximum(5, np.random.normal(20, 5, len(date_range))),
                    'beta': np.random.normal(1, 0.2) + np.random.normal(0, 0.05, len(date_range))
                })
                
                data_frames.append(df)
    
    # Combine all data
    final_df = pd.concat(data_frames, ignore_index=True)
    
    # Add some additional derived metrics with constraints
    final_df['risk_adjusted_return'] = (
        final_df['portfolio_value'] / final_df['volatility']
    ).clip(0, 1000)  # Limit to reasonable range
    
    final_df['sharpe_ratio'] = (
        (final_df['portfolio_value'].pct_change() - 0.02) / final_df['volatility']
    ).clip(-4, 4)  # Typical Sharpe ratio range

    # Add data quality checks
    final_df['portfolio_value'] = final_df['portfolio_value'].clip(10, 1000)  # Reasonable portfolio value range
    final_df['volatility'] = final_df['volatility'].clip(0.05, 0.5)  # Typical volatility range
    final_df['pe_ratio'] = final_df['pe_ratio'].clip(5, 100)  # Typical P/E ratio range
    final_df['beta'] = final_df['beta'].clip(0.3, 2.5)  # Typical beta range
    
    return final_df

# Generate and save the data
portfolio_data = generate_investment_portfolio_data()
portfolio_data.to_csv('investment_portfolio_timeseries.csv', index=False)

# Print summary statistics
print("Data Generation Complete!")
print(f"Total records: {len(portfolio_data)}")
print("\nSample of generated data:")
print(portfolio_data.head())
print("\nSummary statistics:")
print(portfolio_data.describe())
