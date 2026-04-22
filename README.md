# PredictiTrend Analytics 📈

PredictiTrend is a powerful, web-based predictive modeling platform designed to help you transform historical data into actionable future insights. Whether you're tracking retail sales, stock market fluctuations, or IoT sensor data, PredictiTrend provides the tools to clean, model, and visualize your data with ease.

## 🚀 Key Features

- **Intuitive Data Ingestion**: Drag-and-drop CSV uploader with automatic column and type detection.
- **Advanced Forecasting Models**:
  - **Linear Regression**: Ideal for identifying long-term growth or decline trends.
  - **Simple Moving Average (SMA)**: Perfect for smoothing volatile data and spotting cyclical patterns.
- **Interactive Visualizations**: High-fidelity charts powered by Recharts that overlay historical facts with projected trends.
- **Statistical Accuracy Metrics**: Real-time calculation of R-Squared (Goodness of Fit) and Mean Absolute Error (MAE) to evaluate model reliability.
- **AI-Powered Insights**: Integrated Gemini AI that analyzes your statistical results and provides executive summaries of data trends.
- **Data Export**: Download your combined historical and predicted datasets as a single CSV file for further analysis.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (formerly Framer Motion)
- **Charts**: Recharts
- **Mathematics**: Simple-Statistics
- **Data Parsing**: PapaParse
- **AI Engine**: Google Gemini API (@google/genai)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/predictive-analytics-app.git
   cd predictive-analytics-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📊 Usage

1. **Explore samples**: Click the "Explore with Sample Data" cards on the landing page to see an instant demonstration.
2. **Upload your own**: Drag a CSV file into the uploader.
3. **Configure axes**: Pick your Time (X-Axis) and Value (Y-Axis) columns.
4. **Choose a model**: Select the regression or moving average model that best fits your data.
5. **Analyze**: Click "Run Model Analysis" to generate the forecast and AI insights.

## 📄 License

This project is licensed under the Apache-2.0 License.
