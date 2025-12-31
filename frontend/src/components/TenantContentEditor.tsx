
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TenantContentEditorProps {
  sectionKey: string;
  defaultContent: string;
  type?: "text" | "textarea" | "image";
  className?: string;
  as?: React.ElementType; // To render as h1, p, div etc.
}

const TenantContentEditor = ({
  sectionKey,
  defaultContent,
  type = "text",
  className,
  as: Component = "span",
}: TenantContentEditorProps) => {
  const { isAdmin, tenantId: authTenantId, websiteConfig: authWebsiteConfig, updateWebsiteConfig } = useAuth();
  const { toast } = useToast();
  
  // Try to use TenantContext if available (for end-user routes), fallback to null
  let tenantFromContext = null;
  let tenantIdFromContext = null;
  try {
    const tenantContextValue = useTenant();
    tenantFromContext = tenantContextValue.tenant;
    tenantIdFromContext = tenantContextValue.tenant?.id;
  } catch (e) {
    // TenantProvider not available - this is OK for /client/* routes
  }
  
  const tenant = tenantFromContext;
  const tenantId = tenantIdFromContext || authTenantId;
  
  const [content, setContent] = useState(defaultContent);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const config = tenant?.website_config || authWebsiteConfig;
    if (config && config[sectionKey]) {
      setContent(config[sectionKey]);
    } else {
      setContent(defaultContent);
    }
  }, [tenant, authWebsiteConfig, sectionKey, defaultContent]);

  const handleEdit = () => {
    setEditValue(content);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!tenantId) return;
    
    setIsSaving(true);
    try {
      const currentConfig = tenant?.website_config || authWebsiteConfig;
      const newConfig = {
        ...currentConfig,
        [sectionKey]: editValue
      };

      // Correct API usage: endpoint, method, body
      await apiRequest(`/tenants/${tenantId}`, 'PATCH', {
        websiteConfig: newConfig
      });

      // Update local state and AuthContext
      setContent(editValue);
      updateWebsiteConfig(newConfig);
      setIsOpen(false);
      toast({
        title: "Content Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save content", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If not admin, just render the content
  if (!isAdmin) {
    if (type === 'image') {
       return <img src={content} alt="Dynamic content" className={className} />;
    }
    return <Component className={className}>{content}</Component>;
  }

  // Admin view with edit controls
  // Using span to avoid nesting block in inline elements (like p)
  return (
    <span className={`relative group inline-block ${type === 'image' ? '' : 'min-w-[20px] min-h-[20px]'}`}>
       {type === 'image' ? (
         <img src={content} alt="Dynamic content" className={className} />
       ) : (
         <Component className={className}>{content}</Component>
       )}
      
      <Button
        variant="secondary"
        size="icon"
        className="absolute -top-3 -right-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50 bg-white hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEdit();
        }}
        type="button" 
      >
        <Edit className="h-3 w-3 text-black" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Make changes to the content below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {type === "textarea" ? (
              <Textarea 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                className="min-h-[150px]"
              />
            ) : (
              <Input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
              />
            )}
            {type === 'image' && (
              <p className="text-sm text-muted-foreground mt-2">Enter the image URL.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </span>
  );
};

export default TenantContentEditor;
