import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { TrendingUp, Flower2, HeartPulse } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * @function CustomTooltip
 * @description A custom tooltip component for Recharts graphs.
 * @param {object} props - The component props.
 * @param {boolean} props.active - Whether the tooltip is active.
 * @param {Array} props.payload - The data payload for the tooltip.
 * @param {string} props.label - The label for the tooltip.
 * @returns {React.ReactElement|null} The rendered tooltip or null.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value.toFixed(1)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * @function Analytics
 * @description Page for displaying data visualizations and analytics.
 * @returns {React.ReactElement} The rendered analytics page.
 */
export default function Analytics() {
  const { gardens, sensorData } = useData();

  const gardenHealthData = useMemo(() => {
    return gardens.map(garden => {
      const gardenReadings = sensorData.filter(d => d.gardenId === garden.id);
      const normalReadings = gardenReadings.filter(d => d.status === 'normal').length;
      const healthScore = gardenReadings.length > 0 ? (normalReadings / gardenReadings.length) * 100 : 100;
      return { name: garden.name, health: healthScore };
    });
  }, [gardens, sensorData]);

  const plantTypeData = useMemo(() => {
    const plantCounts = gardens
      .flatMap(g => g.plants || []) // Ensure g.plants is not undefined
      .filter(plant => plant && plant.type) // Ensure plant and plant.type exist
      .reduce((acc, plant) => {
        acc[plant.type] = (acc[plant.type] || 0) + 1;
        return acc;
      }, {});
    return Object.entries(plantCounts).map(([name, value]) => ({ name, value }));
  }, [gardens]);

  const sensorTrendData = useMemo(() => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentData = sensorData.filter(d => new Date(d.timestamp) > last24h);
    
    const groupedData = recentData.reduce((acc, d) => {
      const hour = new Date(d.timestamp).getHours();
      const key = `${hour}:00`;
      if (!acc[key]) {
        acc[key] = { time: key, temperature: [], soilMoisture: [], lightIntensity: [] };
      }
      if (d.sensorType === 'temperature') acc[key].temperature.push(d.value);
      if (d.sensorType === 'soilMoisture') acc[key].soilMoisture.push(d.value);
      if (d.sensorType === 'lightIntensity') acc[key].lightIntensity.push(d.value);
      return acc;
    }, {});

    return Object.values(groupedData).map(d => ({
      time: d.time,
      Temperature: d.temperature.length ? d.temperature.reduce((a, b) => a + b, 0) / d.temperature.length : null,
      Moisture: d.soilMoisture.length ? d.soilMoisture.reduce((a, b) => a + b, 0) / d.soilMoisture.length : null,
      Light: d.lightIntensity.length ? d.lightIntensity.reduce((a, b) => a + b, 0) / d.lightIntensity.length : null,
    })).sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }, [sensorData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>Analytics - C_Gardens</title>
        <meta name="description" content="Visualize your smart garden data with interactive charts and analytics" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
          Garden Analytics 📈
        </h1>
        <p className="text-muted-foreground mt-2">
          Insights and trends from your smart garden ecosystem
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="glass-effect h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-green-500" />
                <span>Garden Health Overview</span>
              </CardTitle>
              <CardDescription>Health score based on sensor status (last 24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gardenHealthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="health" fill="url(#colorHealth)" name="Health Score" />
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-effect h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flower2 className="w-5 h-5 text-yellow-500" />
                <span>Plant Type Distribution</span>
              </CardTitle>
              <CardDescription>Breakdown of plant types across all gardens</CardDescription>
            </CardHeader>
            <CardContent>
              {plantTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={plantTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {plantTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No plant data available to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>Sensor Trends (Last 24 Hours)</span>
              </CardTitle>
              <CardDescription>Average hourly readings across all gardens</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sensorTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
                  <YAxis yAxisId="left" stroke="#f97316" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Temperature" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="Moisture" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="Light" stroke="#eab308" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}