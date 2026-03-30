import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDesignContext } from "@/context/DesignContext";
import { useToast } from "@/hooks/use-toast";
import { RoomDesign } from "@shared/schema";
import { format } from "date-fns";

interface LoadDesignModalProps {
  designs: RoomDesign[];
  onClose: () => void;
}

const LoadDesignModal: React.FC<LoadDesignModalProps> = ({ designs, onClose }) => {
  const { toast } = useToast();
  const { loadDesign } = useDesignContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter designs based on search query
  const filteredDesigns = searchQuery 
    ? designs.filter(design => 
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (design.description && design.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : designs;

  const handleSelectDesign = (id: number) => {
    setSelectedDesignId(id);
  };

  const handleLoadDesign = async () => {
    if (!selectedDesignId) {
      toast({
        title: "No Design Selected",
        description: "Please select a design to load",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const selectedDesign = designs.find(design => design.id === selectedDesignId);
      
      if (!selectedDesign) {
        throw new Error("Design not found");
      }
      
      loadDesign(selectedDesign);
      
      toast({
        title: "Design Loaded",
        description: `Successfully loaded "${selectedDesign.name}"`
      });
      
      onClose();
    } catch (error) {
      console.error("Load error:", error);
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "Failed to load design",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-heading font-bold">Load Saved Design</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="mb-4">
          <Input 
            type="text" 
            placeholder="Search saved designs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map((design) => (
              <div 
                key={design.id}
                className={`bg-card dark:bg-gray-700 rounded-md shadow-sm hover:shadow transition-shadow cursor-pointer ${
                  selectedDesignId === design.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectDesign(design.id)}
              >
                <div className="aspect-video rounded-t-md overflow-hidden">
                  <img 
                    src={design.thumbnail} 
                    alt={design.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{design.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last modified: {formatDate(design.lastModified)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchQuery ? "No designs match your search" : "No saved designs found"}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLoadDesign}
            disabled={!selectedDesignId || isLoading}
          >
            {isLoading ? "Loading..." : "Load Selected Design"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoadDesignModal;
