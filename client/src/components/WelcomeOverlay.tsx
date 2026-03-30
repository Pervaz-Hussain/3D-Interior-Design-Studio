import { Button } from "@/components/ui/button";

interface WelcomeOverlayProps {
  onClose: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onClose }) => {
  const handleShowTutorial = () => {
    // Implementation for tutorial
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-md">
        <div className="text-center mb-6">
          <span className="material-icons text-primary text-5xl">view_in_ar</span>
          <h2 className="text-2xl font-heading font-bold mt-4">Welcome to AI Interior Designer</h2>
          <p className="text-muted-foreground mt-2">Transform your space with AI-powered interior design</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="material-icons text-primary mr-3 mt-1">auto_awesome</span>
            <div>
              <h3 className="font-medium">AI-Generated Rooms</h3>
              <p className="text-sm text-muted-foreground">Use natural language to describe your dream room and watch it come to life in 3D</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="material-icons text-primary mr-3 mt-1">touch_app</span>
            <div>
              <h3 className="font-medium">Interactive Design</h3>
              <p className="text-sm text-muted-foreground">Arrange furniture, customize colors, and adjust lighting in real-time</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="material-icons text-primary mr-3 mt-1">save</span>
            <div>
              <h3 className="font-medium">Save & Share</h3>
              <p className="text-sm text-muted-foreground">Save your designs and share them with friends or professional designers</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col mt-8">
          <Button 
            onClick={onClose}
            className="py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            Get Started
          </Button>
          <Button
            onClick={handleShowTutorial} 
            variant="link"
            className="mt-2 text-sm text-primary"
          >
            Show me how it works
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
