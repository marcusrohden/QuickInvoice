# Roulette Simulator

A powerful simulation tool for analyzing roulette game statistics from the house's perspective, with a focus on profitability metrics and break-based statistics.

## Features

- **Multiple Simulation Modes**:
  - Normal Mode: Standard spin-by-spin simulation
  - Remove Hit Slots Mode: Break-based simulations that continue until all specified prizes are hit

- **Flexible Prize Configuration**:
  - Create custom prize configurations with different prize values and slot allocations
  - Configure prize hit behaviors with "Stop When Hit" options in break mode
  - Default prize fallback for remaining slots

- **Comprehensive Statistics**:
  - House earnings tracking (total, per spin, profit rate)
  - Short-term risk assessment showing probability of negative profits
  - Break performance analytics (best and worst breaks)
  - Probability calculations for break sequences and spin sequences

- **User Experience**:
  - Save and load configurations
  - Detailed simulation history
  - Multiple simulation run options (1x, 10x, 100x, 1000x)
  - Color-coded statistics for easy interpretation

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: React Context, Custom hooks
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js

## Project Structure

```
├── app/                        # Next.js app router
├── components/                 # React components
│   ├── simulation/            # Simulation-specific components
│   └── ui/                    # UI components
├── lib/                       # Library code
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
└── public/                    # Static assets
```

## Key Modules

### Components

- **GameParameters**: Controls for setting up the game parameters (slots, costs, prizes)
- **PrizeForm**: Interface for managing prize configurations
- **SimulationControls**: Buttons for running simulations
- **HouseStats**: Displays house statistics and performance metrics
- **SimulationHistory**: Table showing history of spins
- **SimulationResults**: Summary of simulation results

### Services

- **simulationService**: Core logic for simulation calculations
- **configurationService**: Handles saving and loading configurations

### Hooks

- **useSimulation**: Manages simulation state and logic
- **usePrizeConfigurations**: Manages prize configuration state

## Understanding Simulation Modes

### Normal Mode

In normal mode, each simulation runs for a specified number of spins, with each spin randomly selecting a slot number between 1 and the total number of slots. Prizes are awarded based on which prize configuration the slot number falls within.

### Remove Hit Slots Mode

In this mode, a "break" continues until all prizes marked with "Stop When Hit" have been hit at least once. This simulates scenarios where certain special prizes must be awarded before a break is considered complete. Statistics track performance across multiple breaks.

## Key Statistical Metrics

### Short-Term Risk

Represents the probability of going negative in the next break based on current earnings. This metric helps assess the immediate financial risk to the house.

### Break Performance

In Remove Hit Slots mode, the system tracks:

- **Best Break**: Most profitable break sequence (highest profit per spin)
- **Worst Break**: Least profitable break sequence (lowest profit per spin)
- **Break Sequence Probability**: Likelihood of encountering similar break sequences
- **Spin Sequence Probability**: Likelihood of specific spin sequences

## Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Initialize the database: `npm run db:push`
5. Start the development server: `npm run dev`

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: URL for NextAuth.js

## Best Practices

- Use the context provider for accessing global simulation state
- Keep UI components focused on presentation, with logic in hooks and services
- Utilize TypeScript types for all data structures
- Format currency and probability values using the utility functions
