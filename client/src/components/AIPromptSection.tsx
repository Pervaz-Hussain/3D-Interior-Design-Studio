import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RoomType } from "@shared/schema";

interface RecentGeneration {
  id: string;
  thumbnail: string;
  prompt: string;
}

interface AIPromptSectionProps {
  roomPrompt: string;
  setRoomPrompt: (value: string) => void;
  roomType: RoomType;
  setRoomType: (value: RoomType) => void;
  roomStyle: string;
  setRoomStyle: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  recentGenerations: RecentGeneration[];
  onLoadGeneration: (id: string) => void;
}

const AIPromptSection: React.FC<AIPromptSectionProps> = ({
  roomPrompt,
  setRoomPrompt,
  roomType,
  setRoomType,
  roomStyle,
  setRoomStyle,
  onGenerate,
  isGenerating,
  recentGenerations,
  onLoadGeneration
}) => {
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-medium text-lg flex items-center">
        <span className="material-icons mr-2 text-primary">auto_awesome</span>
         Room Generation
      </h2>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="room-prompt" className="mb-1">Describe your dream room</Label>
          <Textarea 
            id="room-prompt" 
            rows={3} 
            placeholder="E.g. A modern Scandinavian living room."
            value={roomPrompt}
            onChange={(e) => setRoomPrompt(e.target.value)}
            className="resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="room-type" className="mb-1">Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger id="room-type">
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="living_room">Living Room</SelectItem>
                <SelectItem value="bedroom">Bedroom</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="bathroom">Bathroom</SelectItem>
                <SelectItem value="home_office">Home Office</SelectItem>
                <SelectItem value="dining_room">Dining Room</SelectItem>
                <SelectItem value="children_room">Children's Room</SelectItem>
                <SelectItem value="guest_room">Guest Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="room-style" className="mb-1">Style</Label>
            <Select value={roomStyle} onValueChange={setRoomStyle}>
              <SelectTrigger id="room-style">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="scandinavian">Scandinavian</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="bohemian">Bohemian</SelectItem>
                <SelectItem value="mid_century">Mid-Century</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={onGenerate} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isGenerating}
        >
          <span>{isGenerating ? "Generating..." : "Generate Room"}</span>
          {isGenerating && (
            <span className="material-icons animate-spin ml-2">refresh</span>
          )}
        </Button>
      </div>
      
      {/* Recent Generations */}
      {recentGenerations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Recent Generations</h3>
          <div className="grid grid-cols-3 gap-2">
            {recentGenerations.map((generation) => (
              <div 
                key={generation.id}
                className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                onClick={() => onLoadGeneration(generation.id)}
                title={generation.prompt}
              >
                <img 
                  src={generation.thumbnail} 
                  alt="Generated room preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPromptSection;
