import React, { useState } from 'react';
import { Plus, Flower2, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { PlantForm } from './PlantForm';

/**
 * @function PlantsTab
 * @description Renders the "Plants" tab content for a garden, allowing management of plants.
 * @param {object} props - Component props.
 * @param {object} props.garden - The current garden object.
 * @param {Function} props.onAddPlant - Function to add a plant.
 * @param {Function} props.onUpdatePlant - Function to update a plant.
 * @param {Function} props.onDeletePlant - Function to delete a plant.
 * @returns {React.ReactElement} The rendered plants tab.
 */
export function PlantsTab({ garden, onAddPlant, onUpdatePlant, onDeletePlant }) {
  const [isPlantFormOpen, setIsPlantFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);

  const handlePlantFormSubmit = (plantData) => {
    if (editingPlant) {
      onUpdatePlant(garden.id, editingPlant.id, plantData);
    } else {
      onAddPlant(garden.id, plantData);
    }
    closePlantForm();
  };

  const openAddPlantForm = () => {
    setEditingPlant(null);
    setIsPlantFormOpen(true);
  };

  const openEditPlantForm = (plant, e) => {
    e.stopPropagation();
    setEditingPlant(plant);
    setIsPlantFormOpen(true);
  };

  const closePlantForm = () => {
    setIsPlantFormOpen(false);
    setEditingPlant(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plants in {garden.name}</h2>
          <p className="text-muted-foreground">Manage your plants and track their growth</p>
        </div>
        <Button onClick={openAddPlantForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Plant
        </Button>
      </div>

      {garden.plants && garden.plants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {garden.plants.map((plant) => (
            <Card key={plant.id} className="garden-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <CardDescription>{plant.type}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => openEditPlantForm(plant, e)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {plant.name} from your garden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeletePlant(garden.id, plant.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  Planted {new Date(plant.plantedDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <Flower2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Plants Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your plants to monitor their growth and health.
            </p>
            <Button onClick={openAddPlantForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Plant
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isPlantFormOpen} onOpenChange={setIsPlantFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlant ? 'Edit Plant' : 'Add New Plant'}</DialogTitle>
            <DialogDescription>
              {editingPlant ? 'Update the details for your plant.' : 'Add a new plant to this garden.'}
            </DialogDescription>
          </DialogHeader>
          <PlantForm plant={editingPlant} onSubmit={handlePlantFormSubmit} onCancel={closePlantForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
