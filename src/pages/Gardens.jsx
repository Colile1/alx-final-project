import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Flower2, 
  MapPin, 
  Calendar,
  Thermometer,
  Droplets,
  Sun,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * @function GardenForm
 * @description A form component for creating or editing a garden.
 * @param {object} props - Component props.
 * @param {object|null} props.garden - The garden object to edit, or null to create a new one.
 * @param {Function} props.onSubmit - The function to call when the form is submitted.
 * @param {Function} props.onCancel - The function to call when the form is cancelled.
 * @returns {React.ReactElement} The rendered garden form.
 */
function GardenForm({ garden, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: garden?.name || '',
    location: garden?.location || '',
    description: garden?.description || ''
  });

  useEffect(() => {
    if (garden) {
      setFormData({
        name: garden.name,
        location: garden.location,
        description: garden.description
      });
    }
  }, [garden]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Garden Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Backyard Vegetable Garden"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g., Johannesburg, JHB"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Brief description of your garden"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{garden ? 'Save Changes' : 'Create Garden'}</Button>
      </DialogFooter>
    </form>
  );
}

/**
 * @function Gardens
 * @description The main page for displaying and managing all user gardens.
 * @returns {React.ReactElement} The rendered gardens page.
 */
export default function Gardens() {
  const navigate = useNavigate();
  const { gardens, addGarden, updateGarden, deleteGarden, sensorData } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGarden, setEditingGarden] = useState(null);

  /**
   * Handles form submission for adding or updating a garden.
   * @param {object} gardenData - The data from the GardenForm.
   */
  const handleFormSubmit = (gardenData) => {
    if (editingGarden) {
      updateGarden(editingGarden.id, gardenData);
    } else {
      addGarden(gardenData);
    }
    setIsFormOpen(false);
    setEditingGarden(null);
  };

  /**
   * Opens the dialog to edit a garden.
   * @param {object} garden - The garden to edit.
   * @param {Event} e - The click event.
   */
  const openEditDialog = (garden, e) => {
    e.stopPropagation();
    setEditingGarden(garden);
    setIsFormOpen(true);
  };

  /**
   * Opens the dialog to add a new garden.
   */
  const openAddDialog = () => {
    setEditingGarden(null);
    setIsFormOpen(true);
  };

  /**
   * Closes the garden form dialog.
   */
  const closeDialog = () => {
    setIsFormOpen(false);
    setEditingGarden(null);
  }

  /**
   * Gets the latest sensor reading for a specific garden and sensor type.
   * @param {string} gardenId - The ID of the garden.
   * @param {string} sensorType - The type of sensor.
   * @returns {object|undefined} The latest sensor reading object or undefined if not found.
   */
  const getLatestSensorReading = (gardenId, sensorType) => {
    const readings = sensorData
      .filter(data => data.gardenId === gardenId && data.sensorType === sensorType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return readings[0];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Helmet>
        <title>Gardens - C_Gardens</title>
        <meta name="description" content="Manage your smart gardens and monitor plant health across multiple locations" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            My Gardens 🌿
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all your smart gardens
          </p>
        </div>

        <Button onClick={openAddDialog} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Garden
        </Button>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGarden ? 'Edit Garden' : 'Create New Garden'}</DialogTitle>
              <DialogDescription>
                {editingGarden ? 'Update the details for your garden.' : 'Add a new garden to your smart monitoring system.'}
              </DialogDescription>
            </DialogHeader>
            <GardenForm garden={editingGarden} onSubmit={handleFormSubmit} onCancel={closeDialog} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {gardens.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flower2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No Gardens Yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start your smart gardening journey by creating your first garden. Monitor plants, track growth, and optimize care with real-time data.
          </p>
          <Button 
            onClick={openAddDialog}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Garden
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {gardens.map((garden) => {
            const moistureReading = getLatestSensorReading(garden.id, 'soilMoisture');
            const tempReading = getLatestSensorReading(garden.id, 'temperature');
            const lightReading = getLatestSensorReading(garden.id, 'lightIntensity');

            return (
              <motion.div key={garden.id} variants={itemVariants}>
                <Card className="garden-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-green-500 transition-colors">
                          {garden.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {garden.location}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => openEditDialog(garden, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                garden and all its associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteGarden(garden.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent 
                    className="space-y-4"
                    onClick={() => navigate(`/gardens/${garden.id}`)}
                  >
                    {garden.description && (
                      <p className="text-sm text-muted-foreground">{garden.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Moisture</p>
                        <p className="text-sm font-semibold">
                          {moistureReading ? `${moistureReading.value.toFixed(1)}%` : '--'}
                        </p>
                      </div>
                      
                      <div className="text-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Temp</p>
                        <p className="text-sm font-semibold">
                          {tempReading ? `${tempReading.value.toFixed(1)}°C` : '--'}
                        </p>
                      </div>
                      
                      <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Sun className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Light</p>
                        <p className="text-sm font-semibold">
                          {lightReading ? `${lightReading.value.toFixed(0)}` : '--'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {new Date(garden.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Flower2 className="w-3 h-3 mr-1" />
                        {garden.plants?.length || 0} plants
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}