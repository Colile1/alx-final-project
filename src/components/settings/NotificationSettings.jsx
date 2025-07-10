import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    alerts: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved!",
      description: "Your notification preferences have been updated.",
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
            <Bell className="w-5 h-5 text-blue-500" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about your garden activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="email-notifications" className="font-medium cursor-pointer">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your gardens via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="push-notifications" className="font-medium cursor-pointer">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts on your device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="alerts-notifications" className="font-medium cursor-pointer">Critical Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for plant health issues
                </p>
              </div>
              <Switch
                id="alerts-notifications"
                checked={notifications.alerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, alerts: checked })}
              />
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