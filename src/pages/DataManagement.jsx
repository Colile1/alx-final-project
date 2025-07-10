import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Download, 
  Upload, 
  FileText, 
  Database,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

export default function DataManagement() {
  const { gardens, sensorData, exportData, importData } = useData();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const handleExport = () => {
    exportData(selectedFormat);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importData(file);
      event.target.value = '';
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report...",
      description: "Your monthly report is being prepared. This is a simulation.",
    });
    setTimeout(() => {
      toast({
        title: "Report Ready!",
        description: "Monthly report has been generated and is ready for download.",
      });
    }, 2000);
  };

  const handleDataSync = () => {
    toast({
      title: "Syncing with Cloud...",
      description: "Your data is being synchronized with the cloud. This is a simulation.",
    });
     setTimeout(() => {
      toast({
        title: "Sync Complete!",
        description: "Your data is now up-to-date.",
      });
    }, 2000);
  };

  const getDataStats = () => {
    const totalReadings = sensorData.length;
    const uniqueSensors = [...new Set(sensorData.map(d => d.sensorType))].length;
    const dateRange = sensorData.length > 0 ? {
      oldest: new Date(Math.min(...sensorData.map(d => new Date(d.timestamp)))),
      newest: new Date(Math.max(...sensorData.map(d => new Date(d.timestamp))))
    } : null;

    return {
      totalReadings,
      uniqueSensors,
      dateRange
    };
  };

  const stats = getDataStats();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>Data Management - C_Gardens</title>
        <meta name="description" content="Import, export, and manage your smart garden data with comprehensive analytics" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Data Management 📊
          </h1>
          <p className="text-muted-foreground mt-2">
            Import, export, and analyze your garden data
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-effect border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReadings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Sensor data points
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gardens</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gardens.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring locations
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensor Types</CardTitle>
            <Filter className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueSensors}</div>
            <p className="text-xs text-muted-foreground">
              Different measurements
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Range</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.dateRange ? Math.ceil((stats.dateRange.newest - stats.dateRange.oldest) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Days of data
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-blue-500" />
                  <span>Export Garden Data</span>
                </CardTitle>
                <CardDescription>
                  Download your garden data in various formats for backup or analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="format">Export Format</Label>
                      <select
                        id="format"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        <option value="json">JSON (Complete Data)</option>
                        <option value="csv">CSV (Sensor Data Only)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range (Optional)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Start date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <Input
                          type="date"
                          placeholder="End date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Export Preview</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• {gardens.length} gardens</p>
                        <p>• {stats.totalReadings} sensor readings</p>
                        <p>• Format: {selectedFormat.toUpperCase()}</p>
                        <p>• Size: ~{Math.round(stats.totalReadings * 0.1)}KB</p>
                      </div>
                    </div>

                    <Button onClick={handleExport} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-green-500" />
                  <span>Import Garden Data</span>
                </CardTitle>
                <CardDescription>
                  Upload historical data or restore from a backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="importFile">Select File</Label>
                      <Input
                        id="importFile"
                        type="file"
                        accept=".json,.csv"
                        onChange={handleImport}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: JSON, CSV
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                      <h4 className="font-medium mb-2 text-yellow-600">Import Guidelines</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• JSON files should match the export format</li>
                        <li>• CSV files should contain sensor data columns</li>
                        <li>• Large files may take time to process</li>
                        <li>• Duplicate data will be merged automatically</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Sample CSV Format</h4>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
{`Garden,Sensor Type,Value,Unit,Timestamp,Status
My Garden,soilMoisture,45,%,2024-01-15T10:30:00Z,normal
My Garden,temperature,22,°C,2024-01-15T10:30:00Z,normal`}
                      </pre>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleDataSync}>
                      <Cloud className="w-4 h-4 mr-2" />
                      Sync with Cloud
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span>Data Analytics</span>
                </CardTitle>
                <CardDescription>
                  Generate insights and reports from your garden data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateReport}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Monthly Report
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateReport}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Sensor Performance Analysis
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateReport}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Growth Trend Analysis
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Quick Stats</h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Temperature:</span>
                          <span className="font-medium">
                            {sensorData.filter(d => d.sensorType === 'temperature').length > 0
                              ? Math.round(sensorData.filter(d => d.sensorType === 'temperature')
                                  .reduce((sum, d) => sum + d.value, 0) / 
                                  sensorData.filter(d => d.sensorType === 'temperature').length * 10) / 10
                              : 0}°C
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Moisture:</span>
                          <span className="font-medium">
                            {sensorData.filter(d => d.sensorType === 'soilMoisture').length > 0
                              ? Math.round(sensorData.filter(d => d.sensorType === 'soilMoisture')
                                  .reduce((sum, d) => sum + d.value, 0) / 
                                  sensorData.filter(d => d.sensorType === 'soilMoisture').length * 10) / 10
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Quality:</span>
                          <span className="font-medium text-green-500">98.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}