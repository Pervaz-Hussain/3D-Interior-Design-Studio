import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDesignContext } from "@/context/DesignContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SaveDesignModalProps {
  onClose: () => void;
}

const SaveDesignModal: React.FC<SaveDesignModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { currentDesign } = useDesignContext();
  const [designName, setDesignName] = useState(currentDesign?.name || "");
  const [designDescription, setDesignDescription] = useState(currentDesign?.description || "");
  const [createThumbnail, setCreateThumbnail] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast({
        title: "Design name required",
        description: "Please enter a name for your design",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      // Create save payload
      const saveData = {
        name: designName,
        description: designDescription,
        ...currentDesign,
        lastModified: new Date().toISOString()
      };

      // Call API to save design
      await apiRequest('POST', '/api/designs', saveData);

      toast({
        title: "Design Saved",
        description: "Your design has been saved successfully"
      });
      
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save design",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-heading font-bold">Save Your Design</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="design-name" className="text-sm font-medium">Design Name</Label>
            <Input 
              type="text" 
              id="design-name" 
              placeholder="My Modern Living Room" 
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="design-description" className="text-sm font-medium">Description (optional)</Label>
            <Textarea 
              id="design-description" 
              rows={3} 
              placeholder="A modern living room with scandinavian influences..." 
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="design-thumbnail" 
              checked={createThumbnail}
              onCheckedChange={(checked) => setCreateThumbnail(checked as boolean)} 
            />
            <Label htmlFor="design-thumbnail" className="text-sm">Create thumbnail from current view</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDesign}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Design"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaveDesignModal;
