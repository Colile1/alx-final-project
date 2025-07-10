import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/use-toast';

export default function PreferenceSettings() {
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    units: 'metric',
    language: 'en',
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved!",
      description: "Your app preferences have been updated.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-green-500" />
            <span>App Preferences</span>
          </CardTitle>
          <CardDescription>
            Customize your C_Gardens experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-2 w-[80px]"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <h4 className="font-medium">Units</h4>
                <p className="text-sm text-muted-foreground">
                  Temperature and measurement units
                </p>
              </div>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={preferences.units}
                onChange={(e) => setPreferences({ ...preferences, units: e.target.value })}
              >
                <option value="metric">Metric (°C, cm)</option>
                <option value="imperial">Imperial (°F, in)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <h4 className="font-medium">Language</h4>
                <p className="text-sm text-muted-foreground">
                  Interface language
                </p>
              </div>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}