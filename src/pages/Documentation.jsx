import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, LifeBuoy, Code, FileText, Bot } from 'lucide-react';

/**
 * @function Documentation
 * @description A page that provides user and technical documentation for the application.
 * @returns {React.ReactElement} The rendered documentation page.
 */
export default function Documentation() {
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
        <title>Documentation - C_Gardens</title>
        <meta name="description" content="User and technical documentation for the C_Gardens smart plant care system." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
          Documentation & Help
        </h1>
        <p className="text-muted-foreground mt-2">
          Find guides, tutorials, and technical information about C_Gardens.
        </p>
      </motion.div>

      <Tabs defaultValue="user-guide" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="user-guide"><LifeBuoy className="w-4 h-4 mr-2" />User Guide</TabsTrigger>
          <TabsTrigger value="tech-docs"><Code className="w-4 h-4 mr-2" />Tech Docs</TabsTrigger>
          <TabsTrigger value="release-notes"><FileText className="w-4 h-4 mr-2" />Release Notes</TabsTrigger>
          <TabsTrigger value="ai-assistant"><Bot className="w-4 h-4 mr-2" />AI Assistant</TabsTrigger>
        </TabsList>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <TabsContent value="user-guide" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>A quick walkthrough of the main features.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <ol>
                    <li><strong>Dashboard:</strong> Your central hub for at-a-glance information about all your gardens, devices, and any active alerts.</li>
                    <li><strong>Gardens:</strong> Create, view, and manage your gardens. Click on a garden card to see its detailed view.</li>
                    <li><strong>Devices:</strong> Add, configure, and monitor your physical sensors and actuators. Assign them to specific gardens.</li>
                    <li><strong>Analytics:</strong> Dive deep into your data with interactive charts showing garden health, plant distribution, and sensor trends over time.</li>
                    <li><strong>Settings:</strong> Customize your profile, notifications, and application preferences.</li>
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tech-docs" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Application Architecture</CardTitle>
                  <CardDescription>A high-level overview of the tech stack.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <ul>
                    <li><strong>Frontend Framework:</strong> React 18 with Vite for a fast and modern development experience.</li>
                    <li><strong>UI Components:</strong> Built with shadcn/ui on top of Radix UI primitives for accessibility and easy customization.</li>
                    <li><strong>Styling:</strong> TailwindCSS for a utility-first CSS workflow.</li>
                    <li><strong>Animations:</strong> Framer Motion for fluid and delightful user interface animations.</li>
                    <li><strong>State Management:</strong> React Context API for managing global state like user authentication, theme, and garden data.</li>
                    <li><strong>Data Persistence:</strong> Currently uses Browser `localStorage` for rapid, client-side prototyping. Can be migrated to a cloud backend like Supabase.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="release-notes" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Version 1.2.0 (Current)</CardTitle>
                  <CardDescription>Published on July 9, 2025</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <h4>✨ New Features</h4>
                  <ul>
                    <li><strong>Analytics Page:</strong> Introduced a new page with interactive charts for garden health, plant types, and sensor trends.</li>
                    <li><strong>Device Details View:</strong> Added a dedicated page to view details and data for a specific device.</li>
                    <li><strong>Documentation Page:</strong> This very page was added to help users and developers.</li>
                  </ul>
                  <h4>🚀 Improvements</h4>
                  <ul>
                    <li>Dashboard summary cards are now clickable, navigating to the respective pages.</li>
                    <li>Enhanced the "Add Device" flow with a multi-step wizard.</li>
                    <li>Refactored large components for better performance and maintainability.</li>
                  </ul>
                   <h4>🐛 Bug Fixes</h4>
                  <ul>
                    <li>Fixed a crash on the Analytics page when gardens had no plants.</li>
                    <li>Stabilized the weather data fetching to prevent excessive refreshes.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot /> Using Your AI Assistant</CardTitle>
                  <CardDescription>Get the most out of me, Hostinger Horizons!</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p>I'm here to help you build, modify, and improve your C_Gardens application in real-time. Just tell me what you need in plain English!</p>
                  <h4>How It Works</h4>
                  <ol>
                    <li><strong>Give a Prompt:</strong> Ask for a new feature, a change, or a bug fix. For example: "Add a new chart to the analytics page showing average humidity" or "Change the color of the primary buttons to orange."</li>
                    <li><strong>Review My Plan:</strong> I'll outline the steps I'm about to take to fulfill your request.</li>
                    <li><strong>See the Magic:</strong> I'll write and apply the code instantly. You'll see the changes reflected in the app preview immediately.</li>
                    <li><strong>Iterate:</strong> Don't like something? Want to add more? Just give me another prompt! We can build this app together, one request at a time.</li>
                  </ol>
                  <h4>Tips for Great Prompts</h4>
                  <ul>
                    <li><strong>Be Specific:</strong> Instead of "change the style," try "make the card headers bold and use a larger font."</li>
                    <li><strong>One Request at a Time:</strong> It's easier to focus on one major feature or change per prompt.</li>
                    <li><strong>Provide Examples:</strong> If you have an idea, describe it! "When I click the device, show a popup with its battery life and signal strength."</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}